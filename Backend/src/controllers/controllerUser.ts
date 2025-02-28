import { Request, Response } from 'express'
import { prisma } from '@/server'
import { currencyToNumber, numberToCurrency } from '@/utils/currency'
import z from 'zod'
import { dataSchema } from '@utils/schema'

export const userSelect = async (req: Request, res: Response): Promise<void> => {
  try {
    // check schema
    const schema = z.object({
      key: z.string().nonempty(),
    })
    const { data, error } = dataSchema(req.params, schema)
    if (!data || error) {
      res.status(401).json({ message: error || 'Chave inválida!' })
      return
    }

    const query = req.query
    const authValues = query.auth?.toString().split(',')

    // check if has token
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

    let uuid: string | undefined
    if (data.key === 'all') {
      uuid = undefined
    } else if (data.key === 'this') {
      uuid = token.uuid
      auth = {
        ...auth,
        personal: true,
        financial: true,
      }
    } else {
      uuid = data.key as string
    }

    // request server
    const users = await prisma.user.findMany({
      select: {
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
      },
      where: {
        uuid: uuid,
        username: { contains: query.username?.toString() },
        active: query.active ? query.active === 'true' : undefined,
        hourlyRate: {
          gte: query.hourlyRateMin
            ? currencyToNumber(query.hourlyRateMin.toString(), 'BRL')
            : undefined,
          lte: query.hourlyRateMax
            ? currencyToNumber(query.hourlyRateMax.toString(), 'BRL')
            : undefined,
        },
        authUuid: authValues?.length ? { in: authValues } : undefined,
        person: {
          cpf: { contains: query.cpf?.toString() },
          entity: {
            name: { contains: query.name?.toString() },
            email: { contains: query.email?.toString() },
            phone: { contains: query.phone?.toString() },
            address: { contains: query.address?.toString() },
          },
        },
      },
    })

    // format
    const response = users.map((user) => ({
      ...user,
      hourlyRate: user.hourlyRate ? numberToCurrency(user.hourlyRate.toNumber(), 'BRL') : null,
    }))

    res.status(200).json(response)
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}
