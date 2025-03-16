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
        uuid: params.data.key === 'all' ? undefined : params.data.key,
        name: query.data.name ? { contains: query.data.name } : undefined,
        description: query.data.description ? { contains: query.data.description } : undefined,
        register: {
          gte: query.data.registerMin ? query.data.registerMin : undefined,
          lte: query.data.registerMax ? query.data.registerMax : undefined,
        },
        active: query.data.active?.length === 1 ? query.data.active[0] : undefined,
        userUuid: query.data.userUuid?.length ? { in: query.data.userUuid } : undefined,
        clientUuid: query.data.clientUuid?.length ? { in: query.data.clientUuid } : undefined,
        statusUuid: query.data.statusUuid?.length ? { in: query.data.statusUuid } : undefined,
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

      // calculate budget
      const budgetCost: number = project.budget.tasks.reduce((sum, task) => {
        if (task.taskExpense?.amount) return sum + task.taskExpense.amount.toNumber()

        if (task.taskActivity?.hourlyRate) {
          const hours = (task.endDate.getTime() - task.beginDate.getTime()) / 3600000
          return sum + hours * task.taskActivity.hourlyRate.toNumber()
        }

        return 0
      }, 0)

      const budgetRevenue: number = project.budget.tasks.reduce((sum, task) => {
        if (task.taskExpense?.amount) return sum + task.revenue.toNumber()

        if (task.taskActivity?.hourlyRate) {
          const hours = (task.endDate.getTime() - task.beginDate.getTime()) / 3600000
          return sum + hours * task.revenue.toNumber()
        }

        return 0
      }, 0)

      const budgetTotal = budgetCost + budgetRevenue

      // calculate transactions
      const expense: number = project.transactions
        .filter((transaction) => transaction.expense)
        .reduce((sum, { amount }) => sum + amount.toNumber(), 0)

      const income: number = project.transactions
        .filter((transaction) => transaction.income)
        .reduce((sum, { amount }) => sum + amount.toNumber(), 0)

      const refund: number = project.transactions
        .filter((transaction) => transaction.refund)
        .reduce((sum, { amount }) => sum + amount.toNumber(), 0)

      const loan: { income: number; expense: number } = project.transactions
        .filter((transaction) => transaction.loan)
        .reduce(
          (sum, { amount, loan }) => {
            if (!loan) return sum

            const income = sum.income + amount.toNumber()
            const expense = sum.expense + loan.months * loan.installment.toNumber()

            return { income, expense }
          },
          { income: 0, expense: 0 },
        )

      const transactionIncome = income + loan.income - refund
      const transactionExpense = expense + loan.expense + refund
      const transactionRevenue = transactionIncome - transactionExpense

      // calculate project
      const projectPrevCost: number = project.tasks
        .filter(({ budgetUuid }) => !budgetUuid)
        .reduce((sum, task) => {
          if (task.taskExpense?.amount) return sum + task.taskExpense.amount.toNumber()

          if (task.taskActivity?.hourlyRate) {
            const hours = (task.endDate.getTime() - task.beginDate.getTime()) / 3600000
            return sum + hours * task.taskActivity.hourlyRate.toNumber()
          }

          return 0
        }, 0)

      const projectCost: number = project.tasks
        .filter(({ budgetUuid }) => !budgetUuid)
        .reduce(
          (sum, task) =>
            sum +
            task.dones.reduce((sum, done) => {
              if (done.doneExpense?.amount) return sum + done.doneExpense.amount.toNumber()

              if (done.doneActivity?.hourlyRate) {
                const hours = (task.endDate.getTime() - task.beginDate.getTime()) / 3600000
                return sum + hours * done.doneActivity.hourlyRate.toNumber()
              }

              return 0
            }, 0),
          0,
        )

      const projectCostDiff = projectPrevCost - projectCost

      const projectRevenue: number =
        project.tasks
          .filter(({ budgetUuid }) => !budgetUuid)
          .reduce((sum, task) => {
            if (task.taskExpense?.amount) return sum + task.revenue.toNumber()

            if (task.taskActivity?.hourlyRate) {
              const hours = (task.endDate.getTime() - task.beginDate.getTime()) / 3600000
              return sum + hours * task.revenue.toNumber()
            }

            return 0
          }, 0) + projectCostDiff

      const projectTotal = projectCost + projectRevenue

      return {
        ...project,

        register: formatDate(project.register),

        beginDate: formatDate(beginDate),
        endDate: formatDate(endDate),

        budgetTotal: numberToCurrency(budgetTotal, 'BRL'),
        budgetCost: numberToCurrency(budgetCost, 'BRL'),
        budgetRevenue: numberToCurrency(budgetRevenue, 'BRL'),

        transactionIncome: numberToCurrency(transactionIncome, 'BRL'),
        transactionExpense: numberToCurrency(transactionExpense, 'BRL'),
        transactionRevenue: numberToCurrency(transactionRevenue, 'BRL'),

        projectTotal: numberToCurrency(projectTotal, 'BRL'),
        projectCost: numberToCurrency(projectCost, 'BRL'),
        projectRevenue: numberToCurrency(projectRevenue, 'BRL'),
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
      res.status(401).json({ message: 'O status contém pendências!' })
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
