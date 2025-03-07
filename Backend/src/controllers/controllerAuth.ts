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

const JWT_SECRET = process.env.JWT_SECRET || ''

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // check schema
    const form = loginSchema.safeParse(req.body)
    if (!form.success) {
      res.status(401).json({ error: 'Query inválida', details: form.error.format() })
      return
    }

    // check user
    const where = form.data.email
      ? { person: { entity: { email: form.data.email } } }
      : form.data.cpf
        ? { person: { cpf: form.data.cpf } }
        : form.data.username
          ? { username: form.data.username }
          : null

    const user = where ? await prisma.user.findFirst({ where: where }) : null

    if (!user) {
      res.status(401).json({ error: 'Usuário não cadastrado!' })
      return
    }

    // check if user is active
    if (!user.active) {
      res.status(401).json({ error: 'Usuário inativo!' })
      return
    }

    // check if password is right
    const isMatch = await bcrypt.compare(form.data.password, user.password)
    if (!isMatch) {
      res.status(401).json({ error: 'Senha incorreta!' })
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
    })

    res.status(201).json({ message: 'Logado com sucesso.' })
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ error: 'Erro no servidor!' })
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
      })
    }

    res.status(200).json({ message: 'Deslogado com sucesso.' })
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ error: 'Erro no servidor!' })
    return
  }
}

export const authCheck = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Received query:', req.query)
    console.log('Received query auth:', req.query.auth)

    // check query
    const query = authCheckSchema.safeParse(String(req.query))
    if (!query.success) {
      res.status(401).json({ error: 'Query inválida', details: query.error.format() })
      return
    }

    // get user form token
    const userToken = getUserFromToken(req, res)
    if (!userToken) return

    // get authorizations
    const auth = await prisma.auth.findUnique({ where: { uuid: userToken.authUuid } })
    if (!auth) {
      res.status(401).json({ error: 'Autorização não encontrada!' })
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
      if (permissions[key]) {
        const hasPermission = value === 'true'
        if (auth[key as 'admin' | 'project' | 'personal' | 'financial'] !== hasPermission) {
          res.status(401).json({ message: `Usuário sem autorização sobre ${permissions[key]}` })
          return
        }
      }
    }

    res.status(200).json({ message: 'Usuário autorizado.' })
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ error: 'Erro no servidor!' })
    return
  }
}

export const authSelect = async (req: Request, res: Response): Promise<void> => {
  try {
    // check params
    const params = keySchema.safeParse(req.params)
    if (!params.success) {
      res.status(401).json({ error: 'Query inválida', details: params.error.format() })
      return
    }

    // check query
    const query = authSelectSchema.safeParse(req.query)
    if (!query.success) {
      res.status(401).json({ error: 'Query inválida', details: query.error.format() })
      return
    }

    // get user form token
    const userToken = getUserFromToken(req, res)
    if (!userToken) return

    // server request
    const auth = await prisma.auth.findMany({
      where: {
        uuid:
          params.data.key === 'all'
            ? undefined
            : params.data.key === 'this'
              ? userToken.uuid
              : params.data.key,
        name: query.data.name?.split(',').length ? { in: query.data.name.split(',') } : undefined,
        admin: query.data.auth?.includes('admin') ? true : undefined,
        project: query.data.auth?.includes('project') ? true : undefined,
        personal: query.data.auth?.includes('personal') ? true : undefined,
        financial: query.data.auth?.includes('financial') ? true : undefined,
      },
    })
    if (!auth) {
      res.status(401).json({ error: 'Autorização não encontrada!' })
      return
    }

    res.status(201).json(auth)
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ error: 'Erro no servidor!' })
    return
  }
}

export const authCreate = async (req: Request, res: Response): Promise<void> => {
  try {
    // check schema
    const form = authCreateSchema.safeParse(req.body)
    if (!form.success) {
      res.status(401).json({ error: 'Query inválida', details: form.error.format() })
      return
    }

    // get user form token
    const userToken = getUserFromToken(req, res)
    if (!userToken) return

    // check if user has authorization
    if (!(await authorization('admin', userToken.authUuid))) {
      res.status(401).json({ error: 'Usuário sem autorização para criar esses dados!' })
      return
    }

    // create resource
    await prisma.auth.create({
      data: {
        name: form.data.name,
        admin: form.data.admin,
        project: form.data.project,
        personal: form.data.personal,
        financial: form.data.financial,
      },
    })

    res.status(201).json({ message: 'O cargo/função foi cadastrado.' })
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ error: 'Erro no servidor!' })
    return
  }
}

export const authUpdate = async (req: Request, res: Response): Promise<void> => {
  try {
    // check schema
    const form = authUpdateSchema.safeParse(req.body)
    if (!form.success) {
      res.status(401).json({ error: 'Query inválida', details: form.error.format() })
      return
    }

    // get user form token
    const userToken = getUserFromToken(req, res)
    if (!userToken) return

    // check if auth exist
    const auth = await prisma.auth.findUnique({ where: { uuid: form.data.uuid } })
    if (!auth) {
      res.status(401).json({ error: 'Cargo/Função não econtrado!' })
      return
    }

    // check if user has authorization
    if (!(await authorization('admin', userToken.authUuid)) || auth.id === 0) {
      res.status(401).json({ error: 'Usuário sem autorização para editar esses dados!' })
      return
    }

    // create resource
    await prisma.auth.update({
      data: {
        name: form.data.name,
        admin: form.data.admin,
        project: form.data.project,
        personal: form.data.personal,
        financial: form.data.financial,
      },
      where: {
        uuid: form.data.uuid,
      },
    })

    res.status(201).json({ message: 'As informações do cargo/função foram atualizadas.' })
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ error: 'Erro no servidor!' })
    return
  }
}

export const authDelete = async (req: Request, res: Response): Promise<void> => {
  try {
    // get uuid
    const params = uuidSchema('cargo/função').safeParse(req.params)
    if (!params.success) {
      res.status(401).json({ error: 'Query inválida', details: params.error.format() })
      return
    }

    // get user form token
    const userToken = getUserFromToken(req, res)
    if (!userToken) return

    // check auth
    const auth = await prisma.auth.findUnique({ where: { uuid: params.data.uuid } })
    if (!auth) {
      res.status(401).json({ error: 'Cargo/Função não econtrado!' })
      return
    }

    // check if user has authorization
    if (!(await authorization('admin', userToken.authUuid)) || auth.id === 0) {
      res.status(401).json({ error: 'Usuário sem autorização para excluir os dados!' })
      return
    }

    // create resource
    await prisma.auth.delete({ where: { uuid: params.data.uuid } })

    res.status(201).json({ message: 'O cargo/função foi deletado.' })
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ error: 'Erro no servidor!' })
    return
  }
}
