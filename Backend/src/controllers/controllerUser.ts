import { Request, Response } from 'express'
import { prisma } from '@/server'
import { currencyToNumber, numberToCurrency } from '@/utils/currency'
import { validateData } from '@utils/z'
import { keySchema, userSelectSchema } from '@utils/schema'

const formatUsers = (users: any[]) => {
  users.map((user) => ({
    ...user,
    hourlyRate: user.hourlyRate ? numberToCurrency(user.hourlyRate.toNumber(), 'BRL') : null,
  }))
}

export const userSelect = async (req: Request, res: Response): Promise<void> => {
  try {
    // check params
    const { data: params, error: paramsError } = validateData(req.params, keySchema)
    if (!params) {
      res.status(401).json({ message: paramsError })
      return
    }

    // check query
    const { data: query, error: queryError } = validateData(req.query, userSelectSchema)
    if (!query) {
      res.status(401).json({ message: queryError })
      return
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
    if (params.key === 'this') {
      auth = {
        ...auth,
        personal: true,
        financial: true,
      }
    }

    // server select
    const select = {
      uuid: true,
      username: true,
      active: true,
      photo: true,
      hourlyRate: auth.financial,
      person: {
        select: {
          cpf: auth.personal,
          entity: {
            select: {
              name: auth.personal,
              email: true,
              phone: true,
              address: auth.personal,
            },
          },
        },
      },
      auth: {
        select: {
          uuid: true,
          name: true,
        },
      },
    }

    // server filter
    const filter = {
      uuid: params.key === 'all' ? undefined : params.key === 'this' ? token.uuid : params.key,
      username: { contains: query.username },
      active: query.active ? query.active === 'true' : undefined,
      hourlyRate: {
        gte: query.hourlyRateMin ? currencyToNumber(query.hourlyRateMin, 'BRL') : undefined,
        lte: query.hourlyRateMax ? currencyToNumber(query.hourlyRateMax, 'BRL') : undefined,
      },
      authUuid: query.auth?.split(',').length ? { in: query.auth.split(',') } : undefined,
      person: {
        cpf: { contains: query.cpf },
        entity: {
          name: { contains: query.name },
          email: { contains: query.email },
          phone: { contains: query.phone },
          address: { contains: query.address },
        },
      },
    }

    // server request
    const users = await prisma.user.findMany({
      select: select,
      where: filter,
    })

    res.status(200).json(formatUsers(users))
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}
