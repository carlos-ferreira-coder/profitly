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
import { validateData } from '@utils/z'

const JWT_SECRET = process.env.JWT_SECRET || ''

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // check schema
    const { data: form, error: errorForm } = validateData(req.body, loginSchema)
    if (!form) {
      res.status(401).json({ message: errorForm })
      return
    }

    // check user
    const where = form.email
      ? { person: { entity: { email: form.email } } }
      : form.cpf
        ? { person: { cpf: form.cpf } }
        : form.username
          ? { username: form.username }
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
    const isMatch = await bcrypt.compare(form.password, user.password)
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
    })

    res.status(201).json({ message: 'Logado com sucesso.' })
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // clear cookies
    if (req.cookies['token']) {
      res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        priority: 'high',
        path: '/',
      })
    }

    res.status(201).json({ message: 'Deslogado com sucesso.' })
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const authCheck = async (req: Request, res: Response): Promise<void> => {
  try {
    // check query
    const { data: query, error: queryError } = validateData(req.query, authCheckSchema)
    if (!query) {
      res.status(401).json({ message: queryError })
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
    for (const [key, value] of Object.entries(query)) {
      if (permissions[key]) {
        const hasPermission = value === 'true'
        if (auth[key as 'admin' | 'project' | 'personal' | 'financial'] !== hasPermission) {
          res.status(401).json({ message: `Usuário sem autorização sobre ${permissions[key]}` })
          return
        }
      }
    }

    res.status(201).json({ message: 'Usuário autorizado.' })
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const authSelect = async (req: Request, res: Response): Promise<void> => {
  try {
    // check params
    const { data: params, error: paramsError } = validateData(req.params, keySchema)
    if (!params) {
      res.status(401).json({ message: paramsError })
      return
    }

    // check query
    const { data: query, error: queryError } = validateData(req.query, authSelectSchema)
    if (!query) {
      res.status(401).json({ message: queryError })
      return
    }

    // get user form token
    const userToken = getUserFromToken(req, res)
    if (!userToken) return

    // server request
    const auth = await prisma.auth.findMany({
      where: {
        uuid:
          params.key === 'all' ? undefined : params.key === 'this' ? userToken.uuid : params.key,
        name: query.name?.split(',').length ? { in: query.name.split(',') } : undefined,
        admin: query.auth?.includes('admin') ? true : undefined,
        project: query.auth?.includes('project') ? true : undefined,
        personal: query.auth?.includes('personal') ? true : undefined,
        financial: query.auth?.includes('financial') ? true : undefined,
      },
    })
    if (!auth) {
      res.status(401).json({ message: 'Autorização não encontrada!' })
      return
    }

    res.status(201).json(auth)
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const authCreate = async (req: Request, res: Response): Promise<void> => {
  try {
    // check schema
    const { data: form, error: errorForm } = validateData(req.body, authCreateSchema)
    if (!form) {
      res.status(401).json({ message: errorForm })
      return
    }

    // get user form token
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
        name: form.name,
        admin: form.admin,
        project: form.project,
        personal: form.personal,
        financial: form.financial,
      },
    })

    res.status(201).json({ message: 'O cargo/função foi cadastrado.' })
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const authUpdate = async (req: Request, res: Response): Promise<void> => {
  try {
    // check schema
    const { data: form, error: errorForm } = validateData(req.body, authUpdateSchema)
    if (!form) {
      res.status(401).json({ message: errorForm })
      return
    }

    // get user form token
    const userToken = getUserFromToken(req, res)
    if (!userToken) return

    // check if auth exist
    const auth = await prisma.auth.findUnique({ where: { uuid: form.uuid } })
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
        name: form.name,
        admin: form.admin,
        project: form.project,
        personal: form.personal,
        financial: form.financial,
      },
      where: {
        uuid: form.uuid,
      },
    })

    res.status(201).json({ message: 'As informações do cargo/função foram atualizadas.' })
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const authDelete = async (req: Request, res: Response): Promise<void> => {
  try {
    // get uuid
    const { data: params, error: paramsError } = validateData(
      req.params,
      uuidSchema('cargo/função'),
    )
    if (!params) {
      res.status(401).json({ message: paramsError })
      return
    }

    // get user form token
    const userToken = getUserFromToken(req, res)
    if (!userToken) return

    // check auth
    const auth = await prisma.auth.findUnique({ where: { uuid: params.uuid } })
    if (!auth) {
      res.status(401).json({ message: 'Cargo/Função não econtrado!' })
      return
    }

    // check if user has authorization
    if (!(await authorization('admin', userToken.authUuid)) || auth.id === 0) {
      res.status(401).json({ message: 'Usuário sem autorização para excluir os dados!' })
      return
    }

    // create resource
    await prisma.auth.delete({ where: { uuid: params.uuid } })

    res.status(201).json({ message: 'O cargo/função foi deletado.' })
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}
