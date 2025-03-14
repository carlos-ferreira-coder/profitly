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
      return {
        ...project,
        register: formatDate(project.register),

        beginDate: formatDate(project.register),
        endDate: formatDate(project.register),

        prevTotal: 'R$ 0,00',
        prevCost: 'R$ 0,00',
        prevRevenue: 'R$ 0,00',
        total: 'R$ 0,00',
        cost: 'R$ 0,00',
        revenue: 'R$ 0,00',
        currentIncome: 'R$ 0,00',
        currentExpense: 'R$ 0,00',
        currentRevenue: 'R$ 0,00',
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
