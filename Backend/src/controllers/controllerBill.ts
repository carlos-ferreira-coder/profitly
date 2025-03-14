import { Request, Response } from 'express'
import { prisma } from '@/server'
import { billCreateSchema, billSelectSchema, keySchema } from '@utils/schema'
import { numberToCurrency } from '@utils/currency'
import { authorization } from '@utils/auth'
import { Bill, Transaction } from '@prisma/client'

type BillProps = Bill & { transaction: Transaction }

const formatDate = (date: Date) => {
  const year = String(date.getFullYear()).slice(-2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')

  return `${day}/${month}/${year} ${hour}:${minute}`
}

const responseBills = (bills: BillProps[]) => {
  return bills.map((bill) => {
    return {
      ...bill,
      register: formatDate(bill.transaction.register),
      date: formatDate(bill.transaction.date),
      amount: numberToCurrency(bill.transaction.amount.toNumber(), 'BRL'),
    }
  })
}

export const billSelect = async (req: Request, res: Response): Promise<void> => {
  try {
    // check params
    const params = keySchema.safeParse(req.params)
    if (!params.success) {
      res.status(401).json({ message: `Params inválido: ${JSON.stringify(params.error.format())}` })
      return
    }

    // check query
    const query = billSelectSchema.safeParse(req.query)
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
    const bills = await prisma.bill.findMany({
      include: {
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
        uuid: params.data.key === 'all' ? undefined : params.data.key,
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

    res.status(200).json(responseBills(bills))
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const billCreate = async (req: Request, res: Response): Promise<void> => {
  try {
    // check schema
    const body = billCreateSchema.safeParse(req.body)
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
    if (body.data.projectUuid) {
      const project = await prisma.project.findUnique({ where: { uuid: body.data.projectUuid } })
      if (!project) {
        res.status(401).json({ message: 'Projeto não econtrado!' })
        return
      }
    }

    // check if supplier has registered
    const supplier = await prisma.supplier.findUnique({ where: { uuid: body.data.supplierUuid } })
    if (!supplier) {
      res.status(401).json({ message: 'Fornecedor não econtrado!' })
      return
    }

    // create resource
    const transaction = await prisma.transaction.create({
      data: {
        name: body.data.name,
        description: body.data.description,
        register: new Date(),
        date: body.data.date,
        amount: body.data.amount,
        userUuid: token.uuid,
        projectUuid: body.data.projectUuid,
      },
    })
    await prisma.bill.create({
      data: {
        id: transaction.id,
        supplierUuid: body.data.supplierUuid,
      },
    })

    res.status(201).json({ message: 'A despesa foi cadastrada.' })
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}
