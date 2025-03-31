import { Request, Response } from 'express'
import { prisma } from '@/server'
import { incomeCreateSchema, incomeSelectSchema, keySchema } from '@utils/schema'
import { numberToCurrency } from '@utils/currency'
import { authorization } from '@utils/auth'
import { Income, Transaction } from '@prisma/client'

type IncomeProps = Income & { transaction: Transaction }

const formatDate = (date: Date) => {
  const year = String(date.getFullYear()).slice(-2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')

  return `${day}/${month}/${year} ${hour}:${minute}`
}

const responseIncomes = (incomes: IncomeProps[]) => {
  return incomes.map((income) => {
    return {
      ...income,
      transaction: {
        ...income.transaction,
        register: formatDate(income.transaction.register),
        date: formatDate(income.transaction.date),
        amount: numberToCurrency(income.transaction.amount.toNumber(), 'BRL'),
      },
    }
  })
}

export const incomeSelect = async (req: Request, res: Response): Promise<void> => {
  try {
    // check params
    const params = keySchema.safeParse(req.params)
    if (!params.success) {
      res.status(401).json({ message: `Params inválido: ${JSON.stringify(params.error.format())}` })
      return
    }

    // check query
    const query = incomeSelectSchema.safeParse(req.query)
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
    const incomes = await prisma.income.findMany({
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

    res.status(200).json(responseIncomes(incomes))
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const incomeCreate = async (req: Request, res: Response): Promise<void> => {
  try {
    // check schema
    const body = incomeCreateSchema.safeParse(req.body)
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
      where: { uuid: body.data.transaction.projectUuid },
    })
    if (!project) {
      res.status(401).json({ message: 'Projeto não econtrado!' })
      return
    }

    // check if client has registered
    const client = await prisma.client.findUnique({ where: { uuid: body.data.clientUuid } })
    if (!client) {
      res.status(401).json({ message: 'Cliente não econtrado!' })
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
    await prisma.income.create({
      data: {
        id: transaction.id,
        clientUuid: body.data.clientUuid,
      },
    })

    res.status(201).json({ message: 'A receita foi cadastrada.' })
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}
