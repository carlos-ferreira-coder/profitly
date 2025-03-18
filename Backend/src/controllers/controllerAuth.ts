import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '@/server'
import { authorization, getUserFromToken } from '@utils/auth'
import {
  authCheckSchema,
  authCreateSchema,
  authSelectSchema,
  authUpdateSchema,
  keySchema,
  loginSchema,
  uuidSchema,
} from '@utils/schema'

const DOMAIN = process.env.DOMAIN || ''
const JWT_SECRET = process.env.JWT_SECRET || ''

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // check schema
    const body = loginSchema.safeParse(req.body)
    if (!body.success) {
      res.status(401).json({ message: `Body inválido: ${JSON.stringify(body.error.format())}` })
      return
    }

    // check user
    const where = body.data.email
      ? { person: { entity: { email: body.data.email } } }
      : body.data.cpf
        ? { person: { cpf: body.data.cpf } }
        : body.data.username
          ? { username: body.data.username }
          : null

    const user = where ? await prisma.user.findFirst({ where: where }) : null

    if (!user) {
      res.status(401).json({ message: 'Usuário não cadastrado!' })
      return
    }

    // check if user is active
    if (!user.active) {
      res.status(401).json({ message: 'Usuário inativo!' })
      return
    }

    // check if password is right
    const isMatch = await bcrypt.compare(body.data.password, user.password)
    if (!isMatch) {
      res.status(401).json({ message: 'Senha incorreta!' })
      return
    }

    // create jwt token
    const token = jwt.sign(
      {
        uuid: user.uuid,
        authUuid: user.authUuid,
      },
      JWT_SECRET,
    )

    // Set the token in an HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      priority: 'high',
      path: '/',
      domain: DOMAIN,
      maxAge: body.data.rememberMe ? 604800000 : undefined, // 1 week
    })

    res.status(201).json({ message: 'Logado com sucesso.' })
    return
  } catch (e) {
    console.error('Erro no servidor:', e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // clear cookies
    if (req.cookies?.token) {
      res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        priority: 'high',
        path: '/',
        domain: 'server-g7vl.onrender.com',
      })
    }

    res.status(200).json({ message: 'Deslogado com sucesso.' })
    return
  } catch (e) {
    console.error('Erro no servidor:', e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const authCheck = async (req: Request, res: Response): Promise<void> => {
  try {
    // check query
    const query = authCheckSchema.safeParse(req.query)
    if (!query.success) {
      res.status(401).json({ message: `Query inválido: ${JSON.stringify(query.error.format())}` })
      return
    }

    // get user form token
    const userToken = getUserFromToken(req, res)
    if (!userToken) return

    // get authorizations
    const auth = await prisma.auth.findUnique({ where: { uuid: userToken.authUuid } })
    if (!auth) {
      res.status(401).json({ message: 'Autorização não encontrada!' })
      return
    }

    // Permissions keys and labels
    const permissions: { [key: string]: string } = {
      admin: 'configurações do sistema',
      project: 'dados dos projetos',
      personal: 'dados pessoais',
      financial: 'dados financeiros',
    }

    // Iterate over query parameters and check permissions
    for (const [key, value] of Object.entries(query.data)) {
      if (value === 'true') {
        if (!auth[key as 'admin' | 'project' | 'personal' | 'financial']) {
          res.status(401).json({ message: `Usuário sem autorização sobre ${permissions[key]}` })
          return
        }
      }
    }

    res.status(200).json({ message: 'Usuário autorizado.' })
    return
  } catch (e) {
    console.error('Erro no servidor:', e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const authSelect = async (req: Request, res: Response): Promise<void> => {
  try {
    // check params
    const params = keySchema.safeParse(req.params)
    if (!params.success) {
      res.status(401).json({ message: `Params inválido: ${JSON.stringify(params.error.format())}` })
      return
    }

    // check query
    const query = authSelectSchema.safeParse(req.query)
    if (!query.success) {
      res.status(401).json({ message: `Query inválido: ${JSON.stringify(query.error.format())}` })
      return
    }

    const filter = {
      ...params.data,
      ...query.data,
    }

    // get user form token
    const userToken = getUserFromToken(req, res)
    if (!userToken) return

    // server request
    const auth = await prisma.auth.findMany({
      where: {
        uuid:
          filter.key === 'all'
            ? undefined
            : filter.key === 'this'
              ? userToken.authUuid
              : filter.key,
        name: filter.name ? { contains: filter.name } : undefined,
        admin: filter.auth?.includes('admin')
          ? true
          : filter.notAuth?.includes('admin')
            ? false
            : undefined,
        project: filter.auth?.includes('project')
          ? true
          : filter.notAuth?.includes('project')
            ? false
            : undefined,
        personal: filter.auth?.includes('personal')
          ? true
          : filter.notAuth?.includes('personal')
            ? false
            : undefined,
        financial: filter.auth?.includes('financial')
          ? true
          : filter.notAuth?.includes('financial')
            ? false
            : undefined,
      },
    })
    if (!auth) {
      res.status(401).json({ message: 'Autorização não encontrada!' })
      return
    }

    res.status(201).json(auth)
    return
  } catch (e) {
    console.error('Erro no servidor:', e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const authCreate = async (req: Request, res: Response): Promise<void> => {
  try {
    // check schema
    const body = authCreateSchema.safeParse(req.body)
    if (!body.success) {
      res.status(401).json({ message: `Body inválido: ${JSON.stringify(body.error.format())}` })
      return
    }

    // get user from token
    const userToken = getUserFromToken(req, res)
    if (!userToken) return

    // check if user has authorization
    if (!(await authorization('admin', userToken.authUuid))) {
      res.status(401).json({ message: 'Usuário sem autorização para criar esses dados!' })
      return
    }

    // create resource
    await prisma.auth.create({
      data: {
        name: body.data.name,
        admin: body.data.admin,
        project: body.data.project,
        personal: body.data.personal,
        financial: body.data.financial,
      },
    })

    res.status(201).json({ message: 'O cargo/função foi cadastrado.' })
    return
  } catch (e) {
    console.error('Erro no servidor:', e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const authUpdate = async (req: Request, res: Response): Promise<void> => {
  try {
    // check schema
    const body = authUpdateSchema.safeParse(req.body)
    if (!body.success) {
      res.status(401).json({ message: `Body inválido: ${JSON.stringify(body.error.format())}` })
      return
    }

    // get user from token
    const userToken = getUserFromToken(req, res)
    if (!userToken) return

    // check if auth exist
    const auth = await prisma.auth.findUnique({ where: { uuid: body.data.uuid } })
    if (!auth) {
      res.status(401).json({ message: 'Cargo/Função não econtrado!' })
      return
    }

    // check if user has authorization
    if (!(await authorization('admin', userToken.authUuid)) || auth.id === 0) {
      res.status(401).json({ message: 'Usuário sem autorização para editar esses dados!' })
      return
    }

    // create resource
    await prisma.auth.update({
      data: {
        name: body.data.name,
        admin: body.data.admin,
        project: body.data.project,
        personal: body.data.personal,
        financial: body.data.financial,
      },
      where: {
        uuid: body.data.uuid,
      },
    })

    res.status(201).json({ message: 'As informações do cargo/função foram atualizadas.' })
    return
  } catch (e) {
    console.error('Erro no servidor:', e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const authDelete = async (req: Request, res: Response): Promise<void> => {
  try {
    // get uuid
    const params = uuidSchema('cargo/função').safeParse(req.params)
    if (!params.success) {
      res.status(401).json({ message: `Params inválido: ${JSON.stringify(params.error.format())}` })
      return
    }

    // get user form token
    const userToken = getUserFromToken(req, res)
    if (!userToken) return

    // check auth
    const auth = await prisma.auth.findUnique({ where: { uuid: params.data.uuid } })
    if (!auth) {
      res.status(401).json({ message: 'Cargo/Função não econtrado!' })
      return
    }

    // check if user has authorization
    if (!(await authorization('admin', userToken.authUuid)) || auth.id === 0) {
      res.status(401).json({ message: 'Usuário sem autorização para excluir os dados!' })
      return
    }

    // check pending issues
    const user = await prisma.user.findMany({ where: { authUuid: params.data.uuid } })
    if (user.length) {
      res.status(401).json({ message: 'O cargo/função contém pendências!' })
      return
    }

    // create resource
    await prisma.auth.delete({ where: { uuid: params.data.uuid } })

    res.status(201).json({ message: 'O cargo/função foi deletado.' })
    return
  } catch (e) {
    console.error('Erro no servidor:', e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}
