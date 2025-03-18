import { Request, Response } from 'express'
import { prisma } from '@/server'
import { expenseCreateSchema, expenseSelectSchema, keySchema } from '@utils/schema'
import { numberToCurrency } from '@utils/currency'
import { authorization } from '@utils/auth'
import { Expense, Transaction } from '@prisma/client'

type ExpenseProps = Expense & { transaction: Transaction }

const formatDate = (date: Date) => {
  const year = String(date.getFullYear()).slice(-2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')

  return `${day}/${month}/${year} ${hour}:${minute}`
}

const responseExpenses = (expenses: ExpenseProps[]) => {
  return expenses.map((expense) => {
    return {
      ...expense,
      transaction: {
        ...expense.transaction,
        register: formatDate(expense.transaction.register),
        date: formatDate(expense.transaction.date),
        amount: numberToCurrency(expense.transaction.amount.toNumber(), 'BRL'),
      },
    }
  })
}

export const expenseSelect = async (req: Request, res: Response): Promise<void> => {
  try {
    // check params
    const params = keySchema.safeParse(req.params)
    if (!params.success) {
      res.status(401).json({ message: `Params inválido: ${JSON.stringify(params.error.format())}` })
      return
    }

    // check query
    const query = expenseSelectSchema.safeParse(req.query)
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
    const expenses = await prisma.expense.findMany({
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
        uuid: filter.key === 'all' ? undefined : filter.key,
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

    res.status(200).json(responseExpenses(expenses))
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const expenseCreate = async (req: Request, res: Response): Promise<void> => {
  try {
    // check schema
    const body = expenseCreateSchema.safeParse(req.body)
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
    if (body.data.transaction.projectUuid) {
      const project = await prisma.project.findUnique({
        where: { uuid: body.data.transaction.projectUuid },
      })
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
        name: body.data.transaction.name,
        description: body.data.transaction.description,
        register: new Date(),
        date: body.data.transaction.date,
        amount: body.data.transaction.amount,
        userUuid: token.uuid,
        projectUuid: body.data.transaction.projectUuid,
      },
    })
    await prisma.expense.create({
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
