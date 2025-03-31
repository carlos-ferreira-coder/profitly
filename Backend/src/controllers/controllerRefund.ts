import { Request, Response } from 'express'
import { prisma } from '@/server'
import { refundCreateSchema, refundSelectSchema, keySchema } from '@utils/schema'
import { numberToCurrency } from '@utils/currency'
import { authorization } from '@utils/auth'
import { Refund, Transaction } from '@prisma/client'

type RefundProps = Refund & { transaction: Transaction }

const formatDate = (date: Date) => {
  const year = String(date.getFullYear()).slice(-2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')

  return `${day}/${month}/${year} ${hour}:${minute}`
}

const responseRefunds = (refunds: RefundProps[]) => {
  return refunds.map((refund) => {
    return {
      ...refund,
      transaction: {
        ...refund.transaction,
        register: formatDate(refund.transaction.register),
        date: formatDate(refund.transaction.date),
        amount: numberToCurrency(refund.transaction.amount.toNumber(), 'BRL'),
      },
    }
  })
}

export const refundSelect = async (req: Request, res: Response): Promise<void> => {
  try {
    // check params
    const params = keySchema.safeParse(req.params)
    if (!params.success) {
      res.status(401).json({ message: `Params inválido: ${JSON.stringify(params.error.format())}` })
      return
    }

    // check query
    const query = refundSelectSchema.safeParse(req.query)
    if (!query.success) {
      res.status(401).json({ message: `Query inválido: ${JSON.stringify(query.error.format())}` })
      return
    }

    const filter = {
      ...params.data,
      ...query.data,
    }

    // check if has token
    const token = req.user
    if (!token) {
      res.status(401).json({ message: 'Token não encontrado!' })
      return
    }

    // server request
    const refunds = await prisma.refund.findMany({
      include: {
        client: {
          include: {
            person: {
              include: {
                entity: true,
              },
            },
            enterprise: {
              include: {
                entity: true,
              },
            },
          },
        },
        supplier: {
          include: {
            person: {
              include: {
                entity: true,
              },
            },
            enterprise: {
              include: {
                entity: true,
              },
            },
          },
        },
        transaction: {
          include: {
            user: {
              include: {
                person: {
                  include: {
                    entity: true,
                  },
                },
              },
            },
          },
        },
      },
      where: {
        uuid: filter.key === 'all' ? undefined : filter.key,
        clientUuid: filter.clientUuid?.length ? { in: filter.clientUuid } : undefined,
        supplierUuid: filter.supplierUuid?.length ? { in: filter.supplierUuid } : undefined,
        transaction: filter.transaction
          ? {
              name: filter.transaction.name ? { contains: filter.transaction.name } : undefined,
              description: filter.transaction.description
                ? { contains: filter.transaction.description }
                : undefined,
              register: {
                gte: filter.transaction.registerMin ? filter.transaction.registerMin : undefined,
                lte: filter.transaction.registerMax ? filter.transaction.registerMax : undefined,
              },
              date: {
                gte: filter.transaction.dateMin ? filter.transaction.dateMin : undefined,
                lte: filter.transaction.dateMax ? filter.transaction.dateMax : undefined,
              },
              amount: {
                gte: filter.transaction.amountMin ? filter.transaction.amountMin : undefined,
                lte: filter.transaction.amountMax ? filter.transaction.amountMax : undefined,
              },
              userUuid: filter.transaction.userUuid?.length
                ? { in: filter.transaction.userUuid }
                : undefined,
              projectUuid: filter.transaction.projectUuid?.length
                ? { in: filter.transaction.projectUuid }
                : undefined,
            }
          : undefined,
      },
    })

    res.status(200).json(responseRefunds(refunds))
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const refundCreate = async (req: Request, res: Response): Promise<void> => {
  try {
    // check schema
    const body = refundCreateSchema.safeParse(req.body)
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
    if (!(await authorization('financial', token.authUuid))) {
      res.status(401).json({ message: 'Usuário sem autorização para criar esses dados!' })
      return
    }

    // check if project has registered
    const project = await prisma.project.findUnique({
      where: { uuid: body.data.trasaction.projectUuid },
    })
    if (!project) {
      res.status(401).json({ message: 'Projeto não econtrado!' })
      return
    }

    // check if client has registered
    if (body.data.clientUuid) {
      const client = await prisma.client.findUnique({ where: { uuid: body.data.clientUuid } })
      if (!client) {
        res.status(401).json({ message: 'Cliente não econtrado!' })
        return
      }
    }

    // check if supplier has registered
    if (body.data.supplierUuid) {
      const supplier = await prisma.supplier.findUnique({ where: { uuid: body.data.supplierUuid } })
      if (!supplier) {
        res.status(401).json({ message: 'Fornecedor não econtrado!' })
        return
      }
    }

    // create resource
    const transaction = await prisma.transaction.create({
      data: {
        name: body.data.trasaction.name,
        description: body.data.trasaction.description,
        register: new Date(),
        date: body.data.trasaction.date,
        amount: body.data.trasaction.amount,
        userUuid: token.uuid,
        projectUuid: body.data.trasaction.projectUuid,
      },
    })
    await prisma.refund.create({
      data: {
        id: transaction.id,
        clientUuid: body.data.clientUuid,
        supplierUuid: body.data.supplierUuid,
      },
    })

    res.status(201).json({ message: 'O reembolso foi cadastrada.' })
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}
