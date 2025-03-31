import { Request, Response } from 'express'
import { prisma } from '@/server'
import { doneSchema, tasksSelectSchema, tasksUpdateSchema } from '@utils/schema'
import { authorization } from '@utils/auth'
import { TaskExpense, TaskActivity, Task, Done, DoneExpense, DoneActivity } from '@prisma/client'
import { numberToCurrency } from '@utils/currency'

type TaskProps = Task & {
  taskExpense?: TaskExpense | null
  taskActivity?: TaskActivity | null
  dones?: (Done & {
    doneExpense?: DoneExpense | null
    doneActivity?: DoneActivity | null
  })[]
}

const formatDate = (date: Date) => {
  const year = String(date.getFullYear()).slice(-2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')

  return `${day}/${month}/${year} ${hour}:${minute}`
}

const responseTasks = (tasks: TaskProps[]) => {
  return tasks.map((task) => {
    return {
      ...task,
      beginDate: formatDate(task.beginDate),
      endDate: formatDate(task.endDate),
      revenue: numberToCurrency(task.revenue.toNumber(), 'BRL'),
      budgetUuid: undefined,
      taskExpense: task.taskExpense
        ? {
            ...task.taskExpense,
            amount: numberToCurrency(task.taskExpense.amount.toNumber(), 'BRL'),
          }
        : undefined,
      taskActivity: task.taskActivity
        ? {
            ...task.taskActivity,
            hourlyRate: numberToCurrency(task.taskActivity.hourlyRate.toNumber(), 'BRL'),
          }
        : undefined,
      dones:
        task.dones && task.dones.length > 0
          ? task.dones.map((done) => {
              return {
                ...done,
                doneExpense: done.doneExpense
                  ? {
                      ...done.doneExpense,
                      taskUuid: task.taskExpense?.uuid,
                      amount: numberToCurrency(done.doneExpense.amount.toNumber(), 'BRL'),
                      date: formatDate(done.doneExpense.date),
                    }
                  : undefined,
                doneActivity: done.doneActivity
                  ? {
                      ...done.doneActivity,
                      taskUuid: task.taskActivity?.uuid,
                      hourlyRate: numberToCurrency(done.doneActivity.hourlyRate.toNumber(), 'BRL'),
                      beginDate: formatDate(done.doneActivity.beginDate),
                      endDate: formatDate(done.doneActivity.endDate),
                    }
                  : undefined,
              }
            })
          : undefined,
    }
  })
}

export const tasksSelect = async (req: Request, res: Response): Promise<void> => {
  try {
    // check query
    const query = tasksSelectSchema.safeParse(req.query)
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

    const filter = {
      ...query.data,
    }

    // server request
    const tasks = await prisma.task.findMany({
      include: {
        taskExpense: true,
        taskActivity: true,
        dones: {
          include: {
            doneExpense: true,
            doneActivity: true,
          },
        },
      },
      where: {
        projectUuid: filter.projectUuid?.length ? { in: filter.projectUuid } : undefined,
        budgetUuid: null,
        taskExpense: filter.taskExpense
          ? {
              uuid: filter.taskExpense.uuid?.length ? { in: filter.taskExpense.uuid } : undefined,
            }
          : undefined,
        taskActivity: filter.taskActivity
          ? {
              uuid: filter.taskActivity.uuid?.length ? { in: filter.taskActivity.uuid } : undefined,
            }
          : undefined,
      },
    })

    res.status(200).json(responseTasks(tasks))
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const tasksUpdate = async (req: Request, res: Response): Promise<void> => {
  try {
    // check schema
    const body = tasksUpdateSchema.safeParse(req.body)
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

    // check if user has authorization
    if (!(await authorization('project', token.authUuid))) {
      res.status(401).json({ message: 'Usuário sem autorização para editar esses dados!' })
      return
    }

    const projectUuids = new Set(body.data.tasks.map(({ projectUuid }) => projectUuid))
    if (projectUuids.size !== 1) {
      res.status(401).json({ message: 'As tarefas devem ter único projeto!' })
      return
    }
    const projectUuid = [...projectUuids][0]

    type TE = {
      name: string
      description: string
      finished: boolean
      beginDate: Date
      endDate: Date
      revenue: number
      statusUuid: string
      projectUuid: string
      userUuid?: string
      budgetUuid?: string
      taskExpense: {
        uuid: string
        amount: number
      }
    }

    type TA = {
      name: string
      description: string
      finished: boolean
      beginDate: Date
      endDate: Date
      revenue: number
      statusUuid: string
      projectUuid: string
      userUuid?: string
      budgetUuid?: string
      taskActivity: {
        uuid: string
        hourlyRate: number
      }
    }

    let tasks: {
      create: { expense: TE[]; activity: TA[] }
      update: { expense: TE[]; activity: TA[] }
      delete: {
        expense: { id: number; uuid: string }[]
        activity: { id: number; uuid: string }[]
      }
    } = body.data.tasks.reduce(
      (acc, task) => {
        if (task.taskExpense) {
          const formattedTask = {
            ...task,
            taskExpense: { ...task.taskExpense },
          }

          if (task.taskExpense.uuid === '') acc.create.expense.push(formattedTask)
          else acc.update.expense.push(formattedTask)
        }

        if (task.taskActivity) {
          const formattedTask = {
            ...task,
            taskActivity: { ...task.taskActivity },
          }

          if (task.taskActivity.uuid === '') acc.create.activity.push(formattedTask)
          else acc.update.activity.push(formattedTask)
        }

        return acc
      },
      {
        create: { expense: [] as TE[], activity: [] as TA[] },
        update: { expense: [] as TE[], activity: [] as TA[] },
        delete: {
          expense: [] as { id: number; uuid: string }[],
          activity: [] as { id: number; uuid: string }[],
        },
      },
    )

    const [expenseTasks, activityTasks] = await Promise.all([
      prisma.taskExpense.findMany({
        where: {
          uuid: { notIn: tasks.update.expense.map(({ taskExpense: { uuid } }) => uuid) },
          task: {
            budgetUuid: null,
            projectUuid: projectUuid,
            dones: { none: {} },
          },
        },
      }),
      prisma.taskActivity.findMany({
        where: {
          uuid: { notIn: tasks.update.activity.map(({ taskActivity: { uuid } }) => uuid) },
          task: {
            budgetUuid: null,
            projectUuid: projectUuid,
            dones: { none: {} },
          },
        },
      }),
    ])

    tasks.delete.expense = expenseTasks.map(({ id, uuid }) => ({ id, uuid }))
    tasks.delete.activity = activityTasks.map(({ id, uuid }) => ({ id, uuid }))

    await Promise.all([
      ...tasks.create.expense.map(async (task) => {
        const taskCreated = await prisma.task.create({
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
          },
        })
        await prisma.taskExpense.create({
          data: {
            id: taskCreated.id,
            amount: task.taskExpense.amount,
          },
        })
      }),
      ...tasks.create.activity.map(async (task) => {
        const taskCreated = await prisma.task.create({
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
          },
        })
        await prisma.taskActivity.create({
          data: {
            id: taskCreated.id,
            hourlyRate: task.taskActivity.hourlyRate,
          },
        })
      }),
    ])

    await Promise.all([
      ...tasks.update.expense.map(async (task) => {
        const taskUpdated = await prisma.taskExpense.update({
          data: {
            amount: task.taskExpense.amount,
          },
          where: {
            uuid: task.taskExpense.uuid,
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
          },
          where: {
            id: taskUpdated.id,
          },
        })
      }),
      ...tasks.update.activity.map(async (task) => {
        const taskUpdated = await prisma.taskActivity.update({
          data: {
            hourlyRate: task.taskActivity.hourlyRate,
          },
          where: {
            uuid: task.taskActivity.uuid,
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
          },
          where: {
            id: taskUpdated.id,
          },
        })
      }),
    ])

    await Promise.all([
      ...tasks.delete.expense.map(async (task) => {
        await prisma.taskExpense.delete({
          where: { uuid: task.uuid },
        })
        await prisma.task.delete({
          where: { id: task.id },
        })
      }),
      ...tasks.delete.activity.map(async (task) => {
        await prisma.taskActivity.delete({
          where: { uuid: task.uuid },
        })
        await prisma.task.delete({
          where: { id: task.id },
        })
      }),
    ])

    res.status(201).json({ message: 'As tarefas do projeto foram atualizadas.' })
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const doneCreate = async (req: Request, res: Response): Promise<void> => {
  try {
    // check schema
    const body = doneSchema.safeParse(req.body)
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

    const task = body.data.doneExpense
      ? await prisma.taskExpense.findUnique({
          where: { uuid: body.data.doneExpense.taskUuid },
        })
      : body.data.doneActivity
        ? await prisma.taskActivity.findUnique({
            where: { uuid: body.data.doneActivity.taskUuid },
          })
        : undefined
    if (!task) {
      res.status(401).json({ message: 'Tarefa não encontrada!' })
      return
    }

    const done = await prisma.done.create({
      data: {
        name: body.data.name,
        description: body.data.description,
        register: new Date(),
        taskId: task.id,
        userUuid: body.data.userUuid,
      },
    })
    if (body.data.doneExpense) {
      await prisma.doneExpense.create({
        data: {
          id: done.id,
          amount: body.data.doneExpense.amount,
          date: body.data.doneExpense.date,
          supplierUuid: body.data.doneExpense.supplierUuid,
        },
      })
    }
    if (body.data.doneActivity) {
      await prisma.doneActivity.create({
        data: {
          id: done.id,
          beginDate: body.data.doneActivity.beginDate,
          endDate: body.data.doneActivity.endDate,
          hourlyRate: body.data.doneActivity.hourlyRate,
        },
      })
    }

    res.status(201).json({ message: 'O realizado da tarefa foi cadastrado.' })
    return
  } catch (e) {
    console.error('Erro no servidor:', e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}
