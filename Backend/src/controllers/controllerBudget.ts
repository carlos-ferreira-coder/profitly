import { Request, Response } from 'express'
import { prisma } from '@/server'
import {
  budgetSelectSchema,
  budgetTasksActivityUpdateSchema,
  budgetTasksExpenseUpdateSchema,
  keySchema,
} from '@utils/schema'
import { authorization } from '@utils/auth'
import { TaskExpense, TaskActivity, Task, Budget } from '@prisma/client'
import { numberToCurrency } from '@utils/currency'

type TaskProps = Task & {
  taskExpense?: TaskExpense | null
  taskActivity?: TaskActivity | null
}

type BudgetProps = Budget & {
  tasks: TaskProps[]
}

const formatDate = (date: Date) => {
  const year = String(date.getFullYear()).slice(-2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')

  return `${day}/${month}/${year} ${hour}:${minute}`
}

const responseBudgets = (budgets: BudgetProps[]) => {
  return budgets.map((budget) => {
    return {
      ...budget,
      tasks: budget.tasks.map((task) => {
        return {
          ...task,
          beginDate: formatDate(task.beginDate),
          endDate: formatDate(task.endDate),
          revenue: numberToCurrency(task.revenue.toNumber(), 'BRL'),
          taskExpense: task.taskExpense
            ? {
                ...task.taskExpense,
                amount: numberToCurrency(task.taskExpense.amount.toNumber(), 'BRL'),
              }
            : null,
          taskActivity: task.taskActivity
            ? {
                ...task.taskActivity,
                hourlyRate: numberToCurrency(task.taskActivity.hourlyRate.toNumber(), 'BRL'),
              }
            : null,
        }
      }),
    }
  })
}

export const budgetSelect = async (req: Request, res: Response): Promise<void> => {
  try {
    // check params
    const params = keySchema.safeParse(req.params)
    if (!params.success) {
      res.status(401).json({ message: `Params inválido: ${JSON.stringify(params.error.format())}` })
      return
    }

    // check query
    const query = budgetSelectSchema.safeParse(req.query)
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
    const budgets = await prisma.budget.findMany({
      include: {
        project: true,
        tasks: {
          include: {
            taskExpense: true,
            taskActivity: true,
          },
        },
      },
      where: {
        uuid: params.data.key === 'all' ? undefined : params.data.key,
        register: {
          gte: query.data.registerMin ? query.data.registerMin : undefined,
          lte: query.data.registerMax ? query.data.registerMax : undefined,
        },
      },
    })

    res.status(200).json(responseBudgets(budgets))
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const budgetTasksExpenseUpdate = async (req: Request, res: Response): Promise<void> => {
  try {
    // check schema
    const body = budgetTasksExpenseUpdateSchema.safeParse(req.body)
    if (!body.success) {
      res.status(401).json({ message: `Body inválido: ${JSON.stringify(body.error.format())}` })
      return
    }
    const tasks = body.data.tasks

    // check if has token
    const token = req.user
    if (!token) {
      res.status(401).json({ message: 'Token não encontrado!' })
      return
    }

    // check if user has authorization
    if (!(await authorization('project', token.authUuid))) {
      res.status(401).json({ message: 'Usuário sem autorização para editar esses dados!' })
      return
    }

    const budget = await prisma.budget.findUnique({ where: { uuid: body.data.uuid } })
    if (!budget) {
      res.status(401).json({ message: 'Orçamento não encontrado!' })
      return
    }

    const projectUuids = new Set(tasks.map(({ projectUuid }) => projectUuid))
    if (projectUuids.size !== 1) {
      res.status(401).json({ message: 'As tarefas devem ser de um único projeto!' })
      return
    }
    const projectUuid = [...projectUuids][0]

    const budgetUuids = new Set(tasks.map(({ budgetUuid }) => budgetUuid))
    if (budgetUuids.size !== 1) {
      res.status(401).json({ message: 'As tarefas devem ser de um único projeto!' })
      return
    }
    const budgetUuid = [...budgetUuids][0]

    const tasksExpenseToCreate = tasks
      .filter(({ uuid }) => uuid === '')
      .map(({ uuid, ...task }) => task)

    const tasksExpenseToUpdate = tasks.filter(({ uuid }) => uuid !== '')

    const tasksExpenseToDelete = await prisma.taskExpense.findMany({
      where: {
        uuid: {
          notIn: tasksExpenseToUpdate.map(({ uuid }) => uuid),
        },
        task: {
          budgetUuid: budgetUuid,
          projectUuid: projectUuid,
        },
      },
    })

    // create resource
    if (!budget.register) {
      await prisma.budget.update({
        data: { register: new Date() },
        where: { uuid: budget.uuid },
      })
      tasksExpenseToCreate.map(async (task) => {
        const created = await prisma.task.create({
          data: {
            name: task.name,
            description: task.description,
            finished: task.finished,
            beginDate: task.beginDate,
            endDate: task.endDate,
            revenue: task.revenue,
            statusUuid: task.statusUuid,
            projectUuid: projectUuid,
            userUuid: task.userUuid,
            budgetUuid: null,
          },
        })
        await prisma.taskExpense.create({
          data: {
            id: created.id,
            amount: task.amount,
          },
        })
      })
    }

    tasksExpenseToCreate.map(async (task) => {
      const created = await prisma.task.create({
        data: {
          name: task.name,
          description: task.description,
          finished: task.finished,
          beginDate: task.beginDate,
          endDate: task.endDate,
          revenue: task.revenue,
          statusUuid: task.statusUuid,
          projectUuid: projectUuid,
          userUuid: task.userUuid,
          budgetUuid: budgetUuid,
        },
      })
      await prisma.taskExpense.create({
        data: {
          id: created.id,
          amount: task.amount,
        },
      })
    })

    tasksExpenseToUpdate.map(async (task) => {
      const updated = await prisma.taskExpense.update({
        data: {
          amount: task.amount,
        },
        where: {
          uuid: task.uuid,
        },
      })
      await prisma.task.update({
        data: {
          name: task.name,
          description: task.description,
          finished: task.finished,
          beginDate: task.beginDate,
          endDate: task.endDate,
          revenue: task.revenue,
          statusUuid: task.statusUuid,
          projectUuid: projectUuid,
          userUuid: task.userUuid,
          budgetUuid: budgetUuid,
        },
        where: {
          id: updated.id,
        },
      })
    })

    tasksExpenseToDelete.map(async (task) => {
      const deleted = await prisma.taskExpense.delete({
        where: { uuid: task.uuid },
      })
      await prisma.task.delete({
        where: { id: deleted.id },
      })
    })

    res.status(201).json({ message: 'As tarefas de despesa do orçamento foram atualizadas.' })
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const budgetTasksActivityUpdate = async (req: Request, res: Response): Promise<void> => {
  try {
    // check schema
    const body = budgetTasksActivityUpdateSchema.safeParse(req.body)
    if (!body.success) {
      res.status(401).json({ message: `Body inválido: ${JSON.stringify(body.error.format())}` })
      return
    }
    const tasks = body.data.tasks

    // check if has token
    const token = req.user
    if (!token) {
      res.status(401).json({ message: 'Token não encontrado!' })
      return
    }

    // check if user has authorization
    if (!(await authorization('project', token.authUuid))) {
      res.status(401).json({ message: 'Usuário sem autorização para editar esses dados!' })
      return
    }

    const budget = await prisma.budget.findUnique({ where: { uuid: body.data.uuid } })
    if (!budget) {
      res.status(401).json({ message: 'Orçamento não encontrado!' })
      return
    }

    const projectUuids = new Set(tasks.map(({ projectUuid }) => projectUuid))
    if (projectUuids.size !== 1) {
      res.status(401).json({ message: 'As tarefas devem ser de um único projeto!' })
      return
    }
    const projectUuid = [...projectUuids][0]

    const budgetUuids = new Set(tasks.map(({ budgetUuid }) => budgetUuid))
    if (budgetUuids.size !== 1) {
      res.status(401).json({ message: 'As tarefas devem ser de um único projeto!' })
      return
    }
    const budgetUuid = [...budgetUuids][0]

    const tasksActivityToCreate = tasks
      .filter(({ uuid }) => uuid === '')
      .map(({ uuid, ...task }) => task)

    const tasksActivityToUpdate = tasks.filter(({ uuid }) => uuid !== '')

    const tasksActivityToDelete = await prisma.taskExpense.findMany({
      where: {
        uuid: {
          notIn: tasksActivityToUpdate.map(({ uuid }) => uuid),
        },
        task: {
          budgetUuid: budgetUuid,
          projectUuid: projectUuid,
        },
      },
    })

    // create resource
    if (!budget.register) {
      await prisma.budget.update({
        data: { register: new Date() },
        where: { uuid: budget.uuid },
      })
      tasksActivityToCreate.map(async (task) => {
        const created = await prisma.task.create({
          data: {
            name: task.name,
            description: task.description,
            finished: task.finished,
            beginDate: task.beginDate,
            endDate: task.endDate,
            revenue: task.revenue,
            statusUuid: task.statusUuid,
            projectUuid: projectUuid,
            userUuid: task.userUuid,
            budgetUuid: null,
          },
        })
        await prisma.taskActivity.create({
          data: {
            id: created.id,
            hourlyRate: task.hourlyRate,
          },
        })
      })
    }

    tasksActivityToCreate.map(async (task) => {
      const created = await prisma.task.create({
        data: {
          name: task.name,
          description: task.description,
          finished: task.finished,
          beginDate: task.beginDate,
          endDate: task.endDate,
          revenue: task.revenue,
          statusUuid: task.statusUuid,
          projectUuid: projectUuid,
          userUuid: task.userUuid,
          budgetUuid: budgetUuid,
        },
      })
      await prisma.taskActivity.create({
        data: {
          id: created.id,
          hourlyRate: task.hourlyRate,
        },
      })
    })

    tasksActivityToUpdate.map(async (task) => {
      const updated = await prisma.taskActivity.update({
        data: {
          hourlyRate: task.hourlyRate,
        },
        where: {
          uuid: task.uuid,
        },
      })
      await prisma.task.update({
        data: {
          name: task.name,
          description: task.description,
          finished: task.finished,
          beginDate: task.beginDate,
          endDate: task.endDate,
          revenue: task.revenue,
          statusUuid: task.statusUuid,
          projectUuid: projectUuid,
          userUuid: task.userUuid,
          budgetUuid: budgetUuid,
        },
        where: {
          id: updated.id,
        },
      })
    })

    tasksActivityToDelete.map(async (task) => {
      const deleted = await prisma.taskExpense.delete({
        where: { uuid: task.uuid },
      })
      await prisma.task.delete({
        where: { id: deleted.id },
      })
    })

    res.status(201).json({ message: 'As tarefas de atividade do projeto foram atualizadas.' })
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}
