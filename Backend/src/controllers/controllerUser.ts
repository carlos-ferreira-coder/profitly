import { Request, Response } from 'express'
import { prisma } from '@/server'
import { currencyToNumber, numberToCurrency } from '@/utils/currency'
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
    const params = keySchema.safeParse(req.params)
    if (!params.success) {
      res.status(401).json({ message: 'Query inválida', details: params.error.format() })
      return
    }

    // check query
    const query = userSelectSchema.safeParse(req.query)
    if (!query.success) {
      res.status(401).json({ message: 'Query inválida', details: query.error.format() })
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
    if (params.data.key === 'this') {
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
      uuid:
        params.data.key === 'all'
          ? undefined
          : params.data.key === 'this'
            ? token.uuid
            : params.data.key,
      username: { contains: query.data.username },
      active: query.data.active ? query.data.active === 'true' : undefined,
      hourlyRate: {
        gte: query.data.hourlyRateMin
          ? currencyToNumber(query.data.hourlyRateMin, 'BRL')
          : undefined,
        lte: query.data.hourlyRateMax
          ? currencyToNumber(query.data.hourlyRateMax, 'BRL')
          : undefined,
      },
      authUuid: query.data.auth?.split(',').length ? { in: query.data.auth.split(',') } : undefined,
      person: {
        cpf: { contains: query.data.cpf },
        entity: {
          name: { contains: query.data.name },
          email: { contains: query.data.email },
          phone: { contains: query.data.phone },
          address: { contains: query.data.address },
        },
      },
    }

    console.log(`Filter: ${JSON.stringify(filter)}`)

    // server request
    const users = await prisma.user.findMany({
      select: select,
      where: filter,
    })

    res.status(200).json(formatUsers(users))
    return
  } catch (e) {
    console.error('Erro no servidor:', e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}
