import { Request, Response } from 'express'
import { prisma } from '@/server'
import { budgetSelectSchema, budgetTasksUpdateSchema, keySchema } from '@utils/schema'
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
      register: budget.register ? formatDate(budget.register) : undefined,
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
            : undefined,
          taskActivity: task.taskActivity
            ? {
                ...task.taskActivity,
                hourlyRate: numberToCurrency(task.taskActivity.hourlyRate.toNumber(), 'BRL'),
              }
            : undefined,
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
        uuid: filter.key === 'all' ? undefined : filter.key,
        project: {
          uuid: filter.projectUuid?.length ? { in: filter.projectUuid } : undefined,
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

export const budgetTasksUpdate = async (req: Request, res: Response): Promise<void> => {
  try {
    // check schema
    const body = budgetTasksUpdateSchema.safeParse(req.body)
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

    const budget = await prisma.budget.findUnique({ where: { uuid: body.data.uuid } })
    if (!budget) {
      res.status(401).json({ message: 'Orçamento não encontrado!' })
      return
    }

    const projectUuids = new Set(body.data.tasks.map(({ projectUuid }) => projectUuid))
    if (projectUuids.size !== 1) {
      res.status(401).json({ message: 'As tarefas devem ter um único projeto!' })
      return
    }
    const projectUuid = [...projectUuids][0]

    const budgetUuids = new Set(body.data.tasks.map(({ budgetUuid }) => budgetUuid))
    if (budgetUuids.size !== 1) {
      res.status(401).json({ message: 'As tarefas devem ter um único orçamento!' })
      return
    }
    const budgetUuid = [...budgetUuids][0]

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
            budgetUuid: budgetUuid,
            projectUuid: projectUuid,
          },
        },
      }),
      prisma.taskActivity.findMany({
        where: {
          uuid: { notIn: tasks.update.activity.map(({ taskActivity: { uuid } }) => uuid) },
          task: {
            budgetUuid: budgetUuid,
            projectUuid: projectUuid,
          },
        },
      }),
    ])

    tasks.delete.expense = expenseTasks.map(({ id, uuid }) => ({ id, uuid }))
    tasks.delete.activity = activityTasks.map(({ id, uuid }) => ({ id, uuid }))

    console.log(`Tasks expense to delete: ${tasks.delete.expense}`)

    // create resource
    if (!budget.register) {
      await prisma.budget.update({
        data: { register: new Date() },
        where: { uuid: budget.uuid },
      })
    }

    await Promise.all([
      ...tasks.create.expense.map(async (task) => {
        const budgetTaskCreated = await prisma.task.create({
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
            originalTaskId: null,
          },
        })
        await prisma.taskExpense.create({
          data: {
            id: budgetTaskCreated.id,
            amount: task.taskExpense.amount,
          },
        })
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
            budgetUuid: null,
            originalTaskId: budgetTaskCreated.id,
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
        const budgetTaskCreated = await prisma.task.create({
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
            originalTaskId: null,
          },
        })
        await prisma.taskActivity.create({
          data: {
            id: budgetTaskCreated.id,
            hourlyRate: task.taskActivity.hourlyRate,
          },
        })
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
            budgetUuid: null,
            originalTaskId: budgetTaskCreated.id,
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
        const budgetTaskUpdated = await prisma.taskExpense.update({
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
            budgetUuid: budgetUuid,
            originalTaskId: null,
          },
          where: {
            id: budgetTaskUpdated.id,
          },
        })
        const taskToUpdate = await prisma.task.findFirst({
          include: { taskExpense: true },
          where: { originalTaskId: budgetTaskUpdated.id },
        })
        if (taskToUpdate) {
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
              budgetUuid: null,
              originalTaskId: budgetTaskUpdated.id,
            },
            where: {
              id: taskToUpdate.id,
            },
          })
          if (taskToUpdate.taskExpense)
            await prisma.taskExpense.update({
              data: {
                amount: task.taskExpense.amount,
              },
              where: {
                uuid: taskToUpdate.taskExpense.uuid,
              },
            })
        }
      }),
      ...tasks.update.activity.map(async (task) => {
        const budgetTaskUpdated = await prisma.taskActivity.update({
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
            budgetUuid: budgetUuid,
            originalTaskId: null,
          },
          where: {
            id: budgetTaskUpdated.id,
          },
        })
        const taskToUpdate = await prisma.task.findFirst({
          include: { taskActivity: true },
          where: { originalTaskId: budgetTaskUpdated.id },
        })
        if (taskToUpdate) {
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
              budgetUuid: null,
              originalTaskId: budgetTaskUpdated.id,
            },
            where: {
              id: taskToUpdate.id,
            },
          })
          if (taskToUpdate.taskActivity)
            await prisma.taskActivity.update({
              data: {
                hourlyRate: task.taskActivity.hourlyRate,
              },
              where: {
                uuid: taskToUpdate.taskActivity.uuid,
              },
            })
        }
      }),
    ])

    await Promise.all([
      ...tasks.delete.expense.map(async (task) => {
        const taskToDelete = await prisma.task.findFirst({
          include: { taskExpense: true },
          where: { originalTaskId: task.id, dones: { none: {} } },
        })
        if (taskToDelete) {
          if (taskToDelete.taskExpense)
            await prisma.taskExpense.delete({
              where: { uuid: taskToDelete.taskExpense.uuid },
            })
          await prisma.task.delete({
            where: { id: taskToDelete.id },
          })
        }
        await prisma.taskExpense.delete({
          where: { uuid: task.uuid },
        })
        await prisma.task.delete({
          where: { id: task.id },
        })
      }),
      ...tasks.delete.activity.map(async (task) => {
        const taskToDelete = await prisma.task.findFirst({
          include: { taskActivity: true },
          where: { originalTaskId: task.id, dones: { none: {} } },
        })
        if (taskToDelete) {
          if (taskToDelete.taskActivity)
            await prisma.taskActivity.delete({
              where: { uuid: taskToDelete.taskActivity.uuid },
            })
          await prisma.task.delete({
            where: { id: taskToDelete.id },
          })
        }
        await prisma.taskActivity.delete({
          where: { uuid: task.uuid },
        })
        await prisma.task.delete({
          where: { id: task.id },
        })
      }),
    ])

    res.status(201).json({ message: 'As tarefas do orçamento foram atualizadas.' })
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}
