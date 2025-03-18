import { Request, Response } from 'express'
import { prisma } from '@/server'
import { numberToCurrency } from '@/utils/currency'
import {
  keySchema,
  userCreateSchema,
  userSelectSchema,
  userUpdatePasswordSchema,
  userUpdatePhotoSchema,
  userUpdateSchema,
  uuidSchema,
} from '@utils/schema'
import { authorization } from '@utils/auth'
import { validateCPF } from '@utils/validate'
import bcrypt from 'bcrypt'
import fs from 'fs'
import path from 'path'
import { User, Auth, Person, Entity } from '@prisma/client'

type UserProps = User & {
  person: Person & {
    entity: Entity
  }
  auth: Auth
}

const DOMAIN = process.env.DOMAIN || ''

const responseUsers = (users: UserProps[], uuid: string, auth: Auth) => {
  return users.map((user) => {
    const isMain = user.uuid === uuid

    return {
      ...user,
      password: undefined,
      hourlyRate:
        (auth.financial || isMain) && user.hourlyRate
          ? numberToCurrency(user.hourlyRate.toNumber(), 'BRL')
          : undefined,
      person: {
        cpf: auth.personal || isMain ? user.person.cpf : undefined,
        entity: {
          ...user.person.entity,
          name: auth.personal || isMain ? user.person.entity.name : undefined,
          phone:
            (auth.personal || isMain) && user.person.entity.phone
              ? user.person.entity.phone
              : undefined,
          address:
            (auth.personal || isMain) && user.person.entity.address
              ? user.person.entity.address
              : undefined,
        },
      },
    }
  })
}

export const userSelect = async (req: Request, res: Response): Promise<void> => {
  try {
    // check params
    const params = keySchema.safeParse(req.params)
    if (!params.success) {
      res.status(401).json({ message: `Params inválido: ${JSON.stringify(params.error.format())}` })
      return
    }

    // check query
    const query = userSelectSchema.safeParse(req.query)
    if (!query.success) {
      res.status(401).json({ message: `Query inválido: ${JSON.stringify(query.error.format())}` })
      return
    }

    const filter = {
      ...params.data,
      ...query.data,
    }

    // check token
    const token = req.user
    if (!token) {
      res.status(401).json({ message: 'Token não encontrado!' })
      return
    }

    // get auth
    let auth = await prisma.auth.findUnique({ where: { uuid: token.authUuid } })
    if (!auth) {
      res.status(401).json({ message: 'Autorização não encontrada!' })
      return
    }

    // server request
    const users = await prisma.user.findMany({
      include: {
        auth: true,
        person: {
          include: {
            entity: true,
          },
        },
      },
      where: {
        uuid: filter.key === 'all' ? undefined : filter.key === 'this' ? token.uuid : filter.key,
        username: filter.username ? { contains: filter.username } : undefined,
        active: filter.active?.length === 1 ? filter.active[0] : undefined,
        hourlyRate: {
          gte: filter.hourlyRateMin ? filter.hourlyRateMin : undefined,
          lte: filter.hourlyRateMax ? filter.hourlyRateMax : undefined,
        },
        authUuid: filter.authUuid?.length ? { in: filter.authUuid } : undefined,
        person: filter.person
          ? {
              cpf: filter.person.cpf ? { contains: filter.person.cpf } : undefined,
              entity: filter.person.entity
                ? {
                    name: filter.person.entity.name
                      ? { contains: filter.person.entity.name }
                      : undefined,
                    email: filter.person.entity.email
                      ? { contains: filter.person.entity.email }
                      : undefined,
                    phone: filter.person.entity.phone
                      ? { contains: filter.person.entity.phone }
                      : undefined,
                    address: filter.person.entity.address
                      ? { contains: filter.person.entity.address }
                      : undefined,
                  }
                : undefined,
            }
          : undefined,
      },
    })

    res.status(200).json(responseUsers(users, token.uuid, auth))
    return
  } catch (e) {
    console.error('Erro no servidor:', e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const userCreate = async (req: Request, res: Response): Promise<void> => {
  try {
    // check schema
    const body = userCreateSchema.safeParse(req.body)
    if (!body.success) {
      res.status(401).json({ message: `Body inválido: ${JSON.stringify(body.error.format())}` })
      return
    }

    // check if has user
    const token = req.user
    if (!token) {
      res.status(401).json({ message: 'Token não encontrado!' })
      return
    }

    // check if user has authorization
    if (!(await authorization('personal', token.authUuid))) {
      res.status(401).json({ message: 'Usuário sem autorização para criar esses dados!' })
      return
    }

    // check if cpf is valid
    if (!validateCPF(body.data.person.cpf)) {
      res.status(401).json({ message: 'CPF inválido!' })
      return
    }

    // check if cpf has registered
    const cpf = await prisma.person.findUnique({ where: { cpf: body.data.person.cpf } })
    if (cpf) {
      res.status(401).json({ message: 'Esse CPF já foi registrado!' })
      return
    }

    // check if email has registered
    const email = await prisma.entity.findUnique({
      where: { email: body.data.person.entity.email },
    })
    if (email) {
      res.status(401).json({ message: 'Esse email já foi registrado!' })
      return
    }

    // check if username has registered
    const username = await prisma.user.findUnique({ where: { username: body.data.username } })
    if (username) {
      res.status(401).json({ message: 'Esse nome de usuário já foi registrado!' })
      return
    }

    // check if both passwords are the same
    if (body.data.password !== body.data.passwordCheck) {
      res.status(401).json({ message: 'A nova senha está diferente da confirmação de senha!' })
      return
    }

    // hash password
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(body.data.password, salt)

    // check if hourlyRate is required
    const auth = await prisma.auth.findUnique({ where: { uuid: body.data.authUuid } })
    if (!auth) {
      res.status(401).json({ message: 'Autorização não encontrada!' })
      return
    }
    if (auth.project && !body.data.hourlyRate) {
      res.status(401).json({ message: 'Usuário precisa do valor da hora!' })
      return
    }

    const entity = await prisma.entity.create({
      data: {
        name: body.data.person.entity.name,
        email: body.data.person.entity.email,
        phone: body.data.person.entity.phone,
        address: body.data.person.entity.address,
      },
    })
    await prisma.person.create({
      data: {
        id: entity.id,
        cpf: body.data.person.cpf,
      },
    })
    await prisma.user.create({
      data: {
        id: entity.id,
        username: body.data.username,
        password: hashPassword,
        active: body.data.active,
        hourlyRate: body.data.hourlyRate ? body.data.hourlyRate : null,
        authUuid: body.data.authUuid,
      },
    })

    res.status(201).json({ message: 'O usuário foi cadastrado.' })
    return
  } catch (e) {
    console.error('Erro no servidor:', e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const userUpdate = async (req: Request, res: Response): Promise<void> => {
  try {
    // check schema
    const body = userUpdateSchema.safeParse(req.body)
    if (!body.success) {
      res.status(401).json({ message: `Body inválido: ${JSON.stringify(body.error.format())}` })
      return
    }

    // check if has token
    const token = req.user
    if (!token) {
      res.status(401).json({ message: 'Token não encontrado!' })
      return
    }

    // check if user exist
    const user = await prisma.user.findUnique({ where: { uuid: body.data.uuid } })
    if (!user) {
      res.status(401).json({ message: 'Usuário não econtrado!' })
      return
    }

    // check if email has registered
    const email = await prisma.entity.findUnique({
      where: { email: body.data.person.entity.email },
    })
    if (email && email.id !== user.id) {
      res.status(401).json({ message: 'Esse email já foi registrado!' })
      return
    }

    // check if username has registered
    const username = await prisma.user.findUnique({ where: { username: body.data.username } })
    if (username && username.id !== user.id) {
      res.status(401).json({ message: 'Esse nome de usuário já foi registrado!' })
      return
    }

    // check if user has authorization
    if (!(await authorization('personal', token.authUuid))) {
      // check if is main user
      if (token.uuid !== body.data.uuid) {
        res.status(401).json({ message: 'Usuário sem autorização para editar esses dados!' })
        return
      }

      // check if user has authorization over the position
      if (body.data.authUuid !== user.authUuid) {
        res
          .status(401)
          .json({ message: 'Usuário sem autorização para promover ou rebaixar cargo/função!' })
        return
      }
    }

    // check if user has or not hourlyRate
    const auth = await prisma.auth.findUnique({ where: { uuid: body.data.authUuid } })
    if (!auth) {
      res.status(401).json({ message: 'Autorização não encontrada!' })
      return
    }
    if (!auth.project && body.data.hourlyRate) {
      res.status(401).json({ message: 'Usuário não precisa do valor da hora!' })
      return
    }
    if (auth.project && !body.data.hourlyRate) {
      res.status(401).json({ message: 'Usuário precisa do valor da hora!' })
      return
    }

    const userUpdated = await prisma.user.update({
      data: {
        username: body.data.username,
        active: body.data.active,
        hourlyRate: body.data.hourlyRate ? body.data.hourlyRate : undefined,
        authUuid: body.data.authUuid,
      },
      where: {
        uuid: body.data.uuid,
      },
    })
    await prisma.entity.update({
      data: {
        name: body.data.person.entity.name,
        email: body.data.person.entity.email,
        phone: body.data.person.entity.phone,
        address: body.data.person.entity.address,
      },
      where: {
        id: userUpdated.id,
      },
    })

    // check if main user still active
    if (token.uuid === userUpdated.uuid && !userUpdated.active) {
      try {
        // clear cookies
        if (req.cookies?.token) {
          res.clearCookie('token', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            priority: 'high',
            path: '/',
            domain: DOMAIN,
          })
        }
        res.status(418).json({ message: 'Eitah me inativei kkkkkkkk!' })
        return
      } catch (e) {
        console.error('Erro no servidor:', e)
        res.status(500).json({ message: 'Erro no servidor!' })
        return
      }
    }

    res.status(201).json({ message: 'As informações do usuário foram atualizadas.' })
    return
  } catch (e) {
    console.error('Erro no servidor:', e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const userUpdatePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    // check schema
    const body = userUpdatePasswordSchema.safeParse(req.body)
    if (!body.success) {
      res.status(401).json({ message: `Body inválido: ${JSON.stringify(body.error.format())}` })
      return
    }

    // check if has token
    const token = req.user
    if (!token) {
      res.status(401).json({ message: 'Token não encontrado!' })
      return
    }

    // check if user has authorization
    if (!(await authorization('personal', token.authUuid))) {
      // check if is the main user
      if (token.uuid !== body.data.uuid) {
        res.status(401).json({ message: 'Usuário sem autorização para alterar a senha!' })
        return
      }
      // he needs to check current password
      if (!body.data.passwordCurrent) {
        res.status(401).json({ message: 'Usuário precisa da senha atual!' })
        return
      }
      // get user information
      const user = await prisma.user.findUnique({
        where: {
          uuid: body.data.uuid,
        },
      })
      if (!user) {
        res.status(401).json({ message: 'Usuário não encontrado!' })
        return
      }
      // check if was the main user
      const isMatch = await bcrypt.compare(body.data.passwordCurrent, user.password)
      if (!isMatch) {
        res.status(401).json({ message: 'Senha atual inválida!' })
        return
      }
    }

    // check that the passwords are the same
    if (body.data.password !== body.data.passwordCheck) {
      res.status(401).json({ message: 'Confirme a nova senha!' })
      return
    }

    // hash password
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(body.data.password, salt)

    // create resource
    await prisma.user.update({
      data: {
        password: hashPassword,
      },
      where: {
        uuid: body.data.uuid,
      },
    })

    res.status(201).json({ message: 'A senha do usuáio foi atualizada.' })
    return
  } catch (e) {
    console.error('Erro no servidor:', e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const userUpdatePhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    // get file
    const file = req.file
    if (!file) {
      res.status(401).json({ message: 'Envie uma imagem!' })
      return
    }
    const photo = new File([file.buffer], file.originalname, { type: file.mimetype })

    // check schema
    const body = userUpdatePhotoSchema.safeParse({ uuid: req.body.uuid, photo: photo })
    if (!body.success) {
      res.status(401).json({ message: `Body inválido: ${JSON.stringify(body.error.format())}` })
      return
    }

    // check if has token
    const token = req.user
    if (!token) {
      res.status(401).json({ message: 'Token não encontrado!' })
      return
    }

    // check if user is registered
    const user = await prisma.user.findUnique({ where: { uuid: body.data.uuid } })
    if (!user) {
      res.status(401).json({ message: 'Usuário não econtrado!' })
      return
    }

    // check if user has authorization
    if (!(await authorization('personal', token.authUuid))) {
      // check if is the main user
      if (token.uuid !== body.data.uuid) {
        res.status(401).json({ message: 'Usuário sem autorização para alterar a foto!' })
        return
      }
    }

    // delete old photo
    if (user.photo) {
      const photoPath = path.resolve(`src/images/users/${user.photo}`)
      fs.unlink(photoPath, (err) => {
        if (err) {
          console.error('Erro ao deletar a foto: ', err)
        } else {
          console.log('Foto deletada com sucesso:', photoPath)
        }
      })
    }

    // create resource
    await prisma.user.update({
      data: {
        photo: file.filename,
      },
      where: {
        uuid: body.data.uuid,
      },
    })

    res.status(201).json({ message: 'Foto atualiza.' })
    return
  } catch (e) {
    console.error('Erro no servidor:', e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const userDeletePhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    // check schema
    const body = uuidSchema('usuáio').safeParse(req.body)
    if (!body.success) {
      res.status(401).json({ message: `Body inválido: ${JSON.stringify(body.error.format())}` })
      return
    }

    // check if has token
    const token = req.user
    if (!token) {
      res.status(401).json({ message: 'Token não encontrado!' })
      return
    }

    // check if user is registered
    const user = await prisma.user.findUnique({ where: { uuid: body.data.uuid } })
    if (!user) {
      res.status(401).json({ message: 'Usuário não econtrado!' })
      return
    }

    // check if user has authorization
    if (!(await authorization('personal', token.authUuid))) {
      // check if is the main user
      if (token.uuid !== body.data.uuid) {
        res.status(401).json({ message: 'Usuário sem autorização para deletar a foto!' })
        return
      }
    }

    // delete old photo
    if (user.photo) {
      const photoPath = path.resolve(`src/images/users/${user.photo}`)
      fs.unlink(photoPath, (err) => {
        if (err) {
          console.error('Erro ao deletar a foto: ', err)
        } else {
          console.log('Foto deletada com sucesso:', photoPath)
        }
      })
    }

    // create resource
    await prisma.user.update({
      data: {
        photo: null,
      },
      where: {
        uuid: body.data.uuid,
      },
    })

    res.status(201).json({ message: 'Foto deletada.' })
    return
  } catch (e) {
    console.error('Erro no servidor:', e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const userDelete = async (req: Request, res: Response): Promise<void> => {
  try {
    // get uuid
    const params = uuidSchema('usuário').safeParse(req.params)
    if (!params.success) {
      res.status(401).json({ message: `Params inválido: ${JSON.stringify(params.error.format())}` })
      return
    }

    // check if has user
    const token = req.user
    if (!token) {
      res.status(401).json({ message: 'Token não encontrado!' })
      return
    }

    // check if user has authorization
    if (!(await authorization('personal', token.authUuid))) {
      res.status(401).json({ message: 'Usuário sem autorização para excluir os dados!' })
      return
    }

    // check if user exist
    const user = await prisma.user.findUnique({ where: { uuid: params.data.uuid } })
    if (!user) {
      res.status(401).json({ message: 'Usuário não econtrado!' })
      return
    }

    // check pending issues
    const done = await prisma.done.findMany({ where: { userUuid: params.data.uuid } })
    const transaction = await prisma.transaction.findMany({ where: { userUuid: params.data.uuid } })
    if (done.length || transaction.length) {
      res.status(401).json({ message: 'O usuário contém pendências!' })
      return
    }

    // create resource
    const userDeleted = await prisma.user.delete({ where: { uuid: params.data.uuid } })
    await prisma.person.delete({ where: { id: userDeleted.id } })
    await prisma.entity.delete({ where: { id: userDeleted.id } })

    // check if main user still active
    if (token.uuid === userDeleted.uuid) {
      try {
        // clear cookies
        if (req.cookies?.token) {
          res.clearCookie('token', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            priority: 'high',
            path: '/',
            domain: DOMAIN,
          })
        }
        res.status(418).json({ message: 'Eitah me deletei kkkkkkkk!' })
        return
      } catch (e) {
        console.error('Erro no servidor:', e)
        res.status(500).json({ message: 'Erro no servidor!' })
        return
      }
    }

    res.status(201).json({ message: 'O usuário foi deletado.' })
    return
  } catch (e) {
    console.error('Erro no servidor:', e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}
