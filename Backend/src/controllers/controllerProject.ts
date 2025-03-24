import { Request, Response } from 'express'
import { prisma } from '@/server'
import {
  projectCreateSchema,
  projectSelectSchema,
  projectUpdateSchema,
  keySchema,
  uuidSchema,
} from '@utils/schema'
import { authorization } from '@utils/auth'
import { numberToCurrency } from '@utils/currency'

const formatDate = (date: Date) => {
  const year = String(date.getFullYear()).slice(-2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')

  return `${day}/${month}/${year} ${hour}:${minute}`
}

export const projectSelect = async (req: Request, res: Response): Promise<void> => {
  try {
    // check params
    const params = keySchema.safeParse(req.params)
    if (!params.success) {
      res.status(401).json({ message: `Params inválido: ${JSON.stringify(params.error.format())}` })
      return
    }

    // check query
    const query = projectSelectSchema.safeParse(req.query)
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

    const auth = await prisma.auth.findUnique({ where: { uuid: token.authUuid } })
    if (!auth) {
      res.status(401).json({ message: 'Autorização não encontrada!' })
      return
    }

    // server request
    const projects = await prisma.project.findMany({
      include: {
        user: {
          include: {
            person: {
              include: {
                entity: true,
              },
            },
            auth: true,
          },
        },
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
        status: true,
        budget: {
          include: {
            tasks: {
              include: {
                taskExpense: true,
                taskActivity: true,
              },
            },
          },
        },
        tasks: {
          include: {
            dones: {
              include: {
                doneExpense: true,
                doneActivity: true,
              },
            },
            taskExpense: true,
            taskActivity: true,
          },
        },
        transactions: {
          include: {
            expense: true,
            income: true,
            refund: true,
            loan: true,
          },
        },
      },
      where: {
        uuid: filter.key === 'all' ? undefined : filter.key,
        name: filter.name ? { contains: filter.name } : undefined,
        description: filter.description ? { contains: filter.description } : undefined,
        register: {
          gte: filter.registerMin ? filter.registerMin : undefined,
          lte: filter.registerMax ? filter.registerMax : undefined,
        },
        active: filter.active?.length === 1 ? filter.active[0] : undefined,
        userUuid: filter.userUuid?.length ? { in: filter.userUuid } : undefined,
        clientUuid: filter.clientUuid?.length ? { in: filter.clientUuid } : undefined,
        statusUuid: filter.statusUuid?.length ? { in: filter.statusUuid } : undefined,
      },
    })

    const responseProjects = projects.map((project) => {
      // calculate dates
      const dates: Date[] = [
        project.register,
        project.budget.register,
        ...project.budget.tasks.flatMap((task) => [task.beginDate, task.endDate]),
        ...project.tasks.flatMap((task) => [
          task.beginDate,
          task.endDate,
          ...(task.dones?.flatMap((done) => [done.register]) ?? []),
        ]),
        ...(project.transactions?.flatMap((transaction) => [transaction.register]) ?? []),
      ].filter((date): date is Date => date instanceof Date)

      const beginDate =
        dates.length > 0
          ? new Date(Math.min(...dates.map((d) => new Date(d).getTime())))
          : project.register
      const endDate =
        dates.length > 0
          ? new Date(Math.max(...dates.map((d) => new Date(d).getTime())))
          : project.register

      const txs: {
        expense: number
        income: number
        refund: number
        loan: { income: number; expense: number }
      } = project.transactions.reduce(
        (sum, { amount, expense, income, refund, loan }) => {
          if (expense) sum.expense += amount.toNumber()
          if (income) sum.income += amount.toNumber()
          if (refund) sum.refund += amount.toNumber()
          if (loan) {
            sum.loan.income += amount.toNumber()
            sum.loan.expense += loan.months * loan.installment.toNumber()
          }

          return sum
        },
        { expense: 0, income: 0, refund: 0, loan: { income: 0, expense: 0 } },
      )

      const tx = {
        income: txs.income + txs.loan.income - txs.refund,
        expense: txs.expense + txs.loan.expense + txs.refund,
      }

      const budget = project.budget.tasks.reduce(
        (acc, task) => {
          if (task.taskExpense) {
            acc.cost += task.taskExpense.amount.toNumber()
            acc.revn += task.revenue.toNumber()
          }

          if (task.taskActivity) {
            const hours = (task.endDate.getTime() - task.beginDate.getTime()) / 3600000
            acc.cost += hours * task.taskActivity.hourlyRate.toNumber()
            acc.revn += hours * task.revenue.toNumber()
          }

          return acc
        },
        { cost: 0, revn: 0 },
      )

      const tasks = project.tasks
        .filter(({ budgetUuid, dones }) => !budgetUuid && dones.length > 0)
        .reduce(
          (acc, task) => {
            let prev = 0,
              cost = 0,
              revn = 0,
              unforeseen: number | undefined = undefined

            if (task.taskExpense) {
              prev = task.taskExpense.amount.toNumber()
              revn = task.revenue.toNumber()
            }

            if (task.taskActivity) {
              const hours = (task.endDate.getTime() - task.beginDate.getTime()) / 3600000
              prev = hours * task.taskActivity.hourlyRate.toNumber()
              revn = hours * task.revenue.toNumber()
            }

            if (task.dones)
              cost = task.dones.reduce((sum, done) => {
                if (done.doneExpense) sum += done.doneExpense.amount.toNumber()

                if (done.doneActivity) {
                  const hours =
                    (done.doneActivity.endDate.getTime() - done.doneActivity.beginDate.getTime()) /
                    3600000
                  sum += hours * done.doneActivity.hourlyRate.toNumber()
                }

                return sum
              }, 0)

            if (!task.originalTaskId) {
              const ratio = cost / (prev || 1)
              unforeseen = task.finished || ratio >= 1 ? cost : cost * ratio
            }

            const ratio = cost / (prev || 1)

            acc.cost += cost
            acc.revn += unforeseen
              ? -unforeseen
              : task.finished || ratio >= 1
                ? prev - cost
                : revn * ratio

            return acc
          },
          { cost: 0, revn: 0 },
        )

      return {
        ...project,
        register: formatDate(project.register),
        dates: {
          beginDate: formatDate(beginDate),
          endDate: formatDate(endDate),
        },
        budget: {
          ...project.budget,
          total: numberToCurrency(budget.cost + budget.revn, 'BRL'),
          cost: numberToCurrency(budget.cost, 'BRL'),
          revenue: numberToCurrency(budget.revn, 'BRL'),
        },
        tx: {
          income: numberToCurrency(tx.income, 'BRL'),
          expense: numberToCurrency(tx.expense, 'BRL'),
          revenue: numberToCurrency(tx.income - tx.expense, 'BRL'),
        },
        proj: {
          total: numberToCurrency(tasks.cost + tasks.revn, 'BRL'),
          cost: numberToCurrency(tasks.cost, 'BRL'),
          revenue: numberToCurrency(tasks.revn, 'BRL'),
        },
      }
    })

    res.status(200).json(responseProjects)
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const projectCreate = async (req: Request, res: Response): Promise<void> => {
  try {
    // check schema
    const body = projectCreateSchema.safeParse(req.body)
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
    if (!(await authorization('project', token.authUuid))) {
      res.status(401).json({ message: 'Usuário sem autorização para criar esses dados!' })
      return
    }

    // check if user has registered
    if (body.data.userUuid) {
      const user = await prisma.user.findUnique({ where: { uuid: body.data.userUuid } })
      if (!user) {
        res.status(401).json({ message: 'Usuário não econtrado!' })
        return
      }
      const auth = await prisma.auth.findUnique({ where: { uuid: user.authUuid } })
      if (!auth) {
        res.status(401).json({ message: 'A autorização do usuário do projeto não foi econtrada!' })
        return
      }
      if (!auth.project) {
        res.status(401).json({
          message: 'Usuário do projeto não tem autorização para gerir projetos!',
        })
        return
      }
    }

    // check if client has registered
    const client = await prisma.client.findUnique({ where: { uuid: body.data.clientUuid } })
    if (!client) {
      res.status(401).json({ message: 'Cliente não econtrado!' })
      return
    }

    // check if status has registered
    const status = await prisma.status.findUnique({ where: { uuid: body.data.statusUuid } })
    if (!status) {
      res.status(401).json({ message: 'Status não econtrado!' })
      return
    }

    // create resource
    const budget = await prisma.budget.create({
      data: {
        register: null,
      },
    })
    await prisma.project.create({
      data: {
        name: body.data.name,
        description: body.data.description,
        register: new Date(),
        active: body.data.active,
        userUuid: body.data.userUuid,
        clientUuid: body.data.clientUuid,
        statusUuid: body.data.statusUuid,
        budgetUuid: budget.uuid,
      },
    })

    res.status(201).json({ message: 'O projeto foi cadastrado.' })
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const projectUpdate = async (req: Request, res: Response): Promise<void> => {
  try {
    // check schema
    const body = projectUpdateSchema.safeParse(req.body)
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

    // check if project exist
    const project = await prisma.project.findUnique({ where: { uuid: body.data.uuid } })
    if (!project) {
      res.status(401).json({ message: 'Projeto não econtrado!' })
      return
    }

    // check if user has authorization
    if (!(await authorization('project', token.authUuid))) {
      res.status(401).json({ message: 'Usuário sem autorização para editar esses dados!' })
      return
    }

    // check if user has registered
    if (body.data.userUuid) {
      const user = await prisma.user.findUnique({ where: { uuid: body.data.userUuid } })
      if (!user) {
        res.status(401).json({ message: 'Usuário não econtrado!' })
        return
      }
      const auth = await prisma.auth.findUnique({ where: { uuid: user.authUuid } })
      if (!auth) {
        res.status(401).json({ message: 'A autorização do usuário do projeto não foi econtrada!' })
        return
      }
      if (!auth.project) {
        res.status(401).json({
          message: 'Usuário do projeto não tem autorização para gerir projetos!',
        })
        return
      }
    }

    // check if client has registered
    const client = await prisma.client.findUnique({ where: { uuid: body.data.clientUuid } })
    if (!client) {
      res.status(401).json({ message: 'Cliente não econtrado!' })
      return
    }

    // check if status has registered
    const status = await prisma.status.findUnique({ where: { uuid: body.data.statusUuid } })
    if (!status) {
      res.status(401).json({ message: 'Status não econtrado!' })
      return
    }

    // create resource
    await prisma.project.update({
      data: {
        name: body.data.name,
        description: body.data.description,
        active: body.data.active,
        userUuid: body.data.userUuid,
        clientUuid: body.data.clientUuid,
        statusUuid: body.data.statusUuid,
      },
      where: {
        uuid: body.data.uuid,
      },
    })

    res.status(201).json({ message: 'As informações do projeto foram atualizadas.' })
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const projectDelete = async (req: Request, res: Response): Promise<void> => {
  try {
    // get uuid
    const params = uuidSchema('projecte').safeParse(req.params)
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

    // check if project exist
    const project = await prisma.project.findUnique({ where: { uuid: params.data.uuid } })
    if (!project) {
      res.status(401).json({ message: 'Projeto não econtrado!' })
      return
    }

    // check if user has authorization
    if (!(await authorization('project', token.authUuid))) {
      res.status(401).json({ message: 'Usuário sem autorização para excluir os dados!' })
      return
    }

    const task = await prisma.task.findMany({
      where: {
        projectUuid: params.data.uuid,
        budgetUuid: null,
      },
    })
    const transaction = await prisma.transaction.findMany({
      where: { projectUuid: params.data.uuid },
    })
    if (task.length || transaction.length) {
      res.status(401).json({ message: 'O projeto contém pendências!' })
      return
    }

    // create resource
    await prisma.project.delete({ where: { uuid: params.data.uuid } })
    await prisma.budget.delete({ where: { uuid: project.budgetUuid } })

    res.status(201).json({ message: 'O projeto foi deletado.' })
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}
