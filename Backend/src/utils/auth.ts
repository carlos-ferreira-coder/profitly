import { prisma } from '@/server'
import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || ''

export const authorization = async (
  type: 'admin' | 'project' | 'personal' | 'financial',
  uuid: string,
): Promise<boolean> => {
  const auth = await prisma.auth.findUnique({ where: { uuid: uuid } })

  if (!auth) return false

  switch (type) {
    case 'admin':
      return auth.admin || false
    case 'project':
      return auth.project || false
    case 'personal':
      return auth.personal || false
    case 'financial':
      return auth.financial || false
    default:
      return false
  }
}

export const getUserFromToken = (req: Request, res: Response) => {
  try {
    // check if has token authorization
    const token = req.cookies['token']
    if (!token) {
      res.status(401).json({ message: 'Necessário token de autorização!' })
      return null
    }

    // get token information
    const userToken = jwt.verify(token, JWT_SECRET) as Express.Request['user']
    if (!userToken) {
      res.status(401).json({ message: 'Erro na validação do token de autorização!' })
      return null
    }

    return userToken
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return null
  }
}
