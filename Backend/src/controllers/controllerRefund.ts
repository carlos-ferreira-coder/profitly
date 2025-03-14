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
      register: formatDate(refund.transaction.register),
      date: formatDate(refund.transaction.date),
      amount: numberToCurrency(refund.transaction.amount.toNumber(), 'BRL'),
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

    // check if has token
    const token = req.user
    if (!token) {
      res.status(401).json({ message: 'Token não encontrado!' })
      return
    }

    // server request
    const refunds = await prisma.refund.findMany({
      include: {
        transaction: true,
      },
      where: {
        uuid: params.data.key === 'all' ? undefined : params.data.key,
        clientUuid: query.data.clientUuid?.length ? { in: query.data.clientUuid } : undefined,
        supplierUuid: query.data.supplierUuid?.length ? { in: query.data.supplierUuid } : undefined,
        transaction: {
          name: query.data.name ? { contains: query.data.name } : undefined,
          description: query.data.description ? { contains: query.data.description } : undefined,
          register: {
            gte: query.data.registerMin ? query.data.registerMin : undefined,
            lte: query.data.registerMax ? query.data.registerMax : undefined,
          },
          date: {
            gte: query.data.dateMin ? query.data.dateMin : undefined,
            lte: query.data.dateMax ? query.data.dateMax : undefined,
          },
          amount: {
            gte: query.data.amountMin ? query.data.amountMin : undefined,
            lte: query.data.amountMax ? query.data.amountMax : undefined,
          },
          userUuid: query.data.userUuid?.length ? { in: query.data.userUuid } : undefined,
          projectUuid: query.data.projectUuid?.length ? { in: query.data.projectUuid } : undefined,
        },
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

    // check if user has registered
    const user = await prisma.user.findUnique({ where: { uuid: body.data.userUuid } })
    if (!user) {
      res.status(401).json({ message: 'Usuário não econtrado!' })
      return
    }

    // check if project has registered
    if (body.data.projectUuid) {
      const project = await prisma.project.findUnique({ where: { uuid: body.data.projectUuid } })
      if (!project) {
        res.status(401).json({ message: 'Projeto não econtrado!' })
        return
      }
    }

    // check if client has registered
    const client = await prisma.client.findUnique({ where: { uuid: body.data.clientUuid } })
    if (!client) {
      res.status(401).json({ message: 'Cliente não econtrado!' })
      return
    }

    // check if supplier has registered
    const supplier = await prisma.supplier.findUnique({ where: { uuid: body.data.supplierUuid } })
    if (!supplier) {
      res.status(401).json({ message: 'Fornecedor não econtrado!' })
      return
    }

    // create resource
    const refund = await prisma.refund.create({
      data: {
        clientUuid: body.data.clientUuid,
        supplierUuid: body.data.supplierUuid,
      },
    })
    await prisma.transaction.create({
      data: {
        id: refund.id,
        name: body.data.name,
        description: body.data.description,
        register: new Date(),
        date: body.data.date,
        amount: body.data.amount,
        userUuid: body.data.userUuid,
        projectUuid: body.data.projectUuid,
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
