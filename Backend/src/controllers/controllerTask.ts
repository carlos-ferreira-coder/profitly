import { Request, Response } from 'express'
import { prisma } from '@/server'
import {
  keySchema,
  taskActivitySelectSchema,
  taskExpenseSelectSchema,
  tasksActivityUpdateSchema,
  tasksExpenseUpdateSchema,
} from '@utils/schema'
import { authorization } from '@utils/auth'
import { TaskExpense, TaskActivity, Task } from '@prisma/client'
import { numberToCurrency } from '@utils/currency'

type TaskExpenseProps = TaskExpense & { task: Task }
type TaskActivityProps = TaskActivity & { task: Task }

const formatDate = (date: Date) => {
  const year = String(date.getFullYear()).slice(-2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')

  return `${day}/${month}/${year} ${hour}:${minute}`
}

const responseTasksExpense = (tasksExpense: TaskExpenseProps[]) => {
  return tasksExpense.map((taskExpense) => {
    return {
      ...taskExpense,
      amount: numberToCurrency(taskExpense.amount.toNumber(), 'BRL'),
      task: {
        ...taskExpense.task,
        beginDate: formatDate(taskExpense.task.beginDate),
        endDate: formatDate(taskExpense.task.endDate),
        revenue: numberToCurrency(taskExpense.task.revenue.toNumber(), 'BRL'),
      },
    }
  })
}

const responseTasksActivity = (tasksActivity: TaskActivityProps[]) => {
  return tasksActivity.map((taskActivity) => {
    return {
      ...taskActivity,
      hourlyRate: numberToCurrency(taskActivity.hourlyRate.toNumber(), 'BRL'),
      task: {
        ...taskActivity.task,
        beginDate: formatDate(taskActivity.task.beginDate),
        endDate: formatDate(taskActivity.task.endDate),
        revenue: numberToCurrency(taskActivity.task.revenue.toNumber(), 'BRL'),
      },
    }
  })
}

export const tasksExpenseSelect = async (req: Request, res: Response): Promise<void> => {
  try {
    // check params
    const params = keySchema.safeParse(req.params)
    if (!params.success) {
      res.status(401).json({ message: `Params inválido: ${JSON.stringify(params.error.format())}` })
      return
    }

    // check query
    const query = taskExpenseSelectSchema.safeParse(req.query)
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
    const tasksExpense = await prisma.taskExpense.findMany({
      include: {
        task: true,
      },
      where: {
        uuid: params.data.key === 'all' ? undefined : params.data.key,
        amount: {
          gte: query.data.amountMin ? query.data.amountMin : undefined,
          lte: query.data.amountMax ? query.data.amountMax : undefined,
        },
        task: {
          name: query.data.name ? { contains: query.data.name } : undefined,
          description: query.data.description ? { contains: query.data.description } : undefined,
          beginDate: {
            gte: query.data.beginDateMin ? query.data.beginDateMin : undefined,
            lte: query.data.beginDateMax ? query.data.beginDateMax : undefined,
          },
          endDate: {
            gte: query.data.endDateMin ? query.data.endDateMin : undefined,
            lte: query.data.endDateMax ? query.data.endDateMax : undefined,
          },
          revenue: {
            gte: query.data.revenueMin ? query.data.revenueMin : undefined,
            lte: query.data.revenueMax ? query.data.revenueMax : undefined,
          },
          statusUuid: query.data.statusUuid?.length ? { in: query.data.statusUuid } : undefined,
          projectUuid: query.data.projectUuid?.length ? { in: query.data.projectUuid } : undefined,
          userUuid: query.data.userUuid?.length ? { in: query.data.userUuid } : undefined,
          budgetUuid: query.data.budgetUuid?.length ? { in: query.data.budgetUuid } : undefined,
        },
      },
    })

    res.status(200).json(responseTasksExpense(tasksExpense))
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const tasksActivitySelect = async (req: Request, res: Response): Promise<void> => {
  try {
    // check params
    const params = keySchema.safeParse(req.params)
    if (!params.success) {
      res.status(401).json({ message: `Params inválido: ${JSON.stringify(params.error.format())}` })
      return
    }

    // check query
    const query = taskActivitySelectSchema.safeParse(req.query)
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
    const tasksActivity = await prisma.taskActivity.findMany({
      include: {
        task: true,
      },
      where: {
        uuid: params.data.key === 'all' ? undefined : params.data.key,
        hourlyRate: {
          gte: query.data.hourlyRateMin ? query.data.hourlyRateMin : undefined,
          lte: query.data.hourlyRateMax ? query.data.hourlyRateMax : undefined,
        },
        task: {
          name: query.data.name ? { contains: query.data.name } : undefined,
          description: query.data.description ? { contains: query.data.description } : undefined,
          beginDate: {
            gte: query.data.beginDateMin ? query.data.beginDateMin : undefined,
            lte: query.data.beginDateMax ? query.data.beginDateMax : undefined,
          },
          endDate: {
            gte: query.data.endDateMin ? query.data.endDateMin : undefined,
            lte: query.data.endDateMax ? query.data.endDateMax : undefined,
          },
          revenue: {
            gte: query.data.revenueMin ? query.data.revenueMin : undefined,
            lte: query.data.revenueMax ? query.data.revenueMax : undefined,
          },
          statusUuid: query.data.statusUuid?.length ? { in: query.data.statusUuid } : undefined,
          projectUuid: query.data.projectUuid?.length ? { in: query.data.projectUuid } : undefined,
          userUuid: query.data.userUuid?.length ? { in: query.data.userUuid } : undefined,
          budgetUuid: query.data.budgetUuid?.length ? { in: query.data.budgetUuid } : undefined,
        },
      },
    })

    res.status(200).json(responseTasksActivity(tasksActivity))
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const tasksExpenseUpdate = async (req: Request, res: Response): Promise<void> => {
  try {
    // check schema
    const body = tasksExpenseUpdateSchema.safeParse(req.body)
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

    const projectUuids = new Set(tasks.map(({ projectUuid }) => projectUuid))
    if (projectUuids.size !== 1) {
      res.status(401).json({ message: 'As tarefas devem ser de um único projeto!' })
      return
    }
    const projectUuid = [...projectUuids][0]

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
          budgetUuid: null,
          projectUuid: projectUuid,
        },
      },
    })

    // create resource
    tasksExpenseToCreate.map(async (task) => {
      const created = await prisma.task.create({
        data: {
          name: task.name,
          description: task.description,
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
          beginDate: task.beginDate,
          endDate: task.endDate,
          revenue: task.revenue,
          statusUuid: task.statusUuid,
          projectUuid: projectUuid,
          userUuid: task.userUuid,
          budgetUuid: null,
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

    res.status(201).json({ message: 'As tarefas de despesa do projeto foram atualizadas.' })
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const tasksActivityUpdate = async (req: Request, res: Response): Promise<void> => {
  try {
    // check schema
    const body = tasksActivityUpdateSchema.safeParse(req.body)
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

    const projectUuids = new Set(tasks.map(({ projectUuid }) => projectUuid))
    if (projectUuids.size !== 1) {
      res.status(401).json({ message: 'As tarefas devem ser de um único projeto!' })
      return
    }
    const projectUuid = [...projectUuids][0]

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
          budgetUuid: null,
          projectUuid: projectUuid,
        },
      },
    })

    // create resource
    tasksActivityToCreate.map(async (task) => {
      const created = await prisma.task.create({
        data: {
          name: task.name,
          description: task.description,
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
          amount: task.hourlyRate,
        },
      })
    })

    tasksActivityToUpdate.map(async (task) => {
      const updated = await prisma.taskExpense.update({
        data: {
          amount: task.hourlyRate,
        },
        where: {
          uuid: task.uuid,
        },
      })
      await prisma.task.update({
        data: {
          name: task.name,
          description: task.description,
          beginDate: task.beginDate,
          endDate: task.endDate,
          revenue: task.revenue,
          statusUuid: task.statusUuid,
          projectUuid: projectUuid,
          userUuid: task.userUuid,
          budgetUuid: null,
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
