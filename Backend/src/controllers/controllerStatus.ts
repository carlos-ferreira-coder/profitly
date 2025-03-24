import { Request, Response } from 'express'
import { prisma } from '@/server'
import {
  keySchema,
  statusCreateSchema,
  statusSelectSchema,
  statusUpdateSchema,
  uuidSchema,
} from '@utils/schema'
import { authorization } from '@utils/auth'

export const statusSelect = async (req: Request, res: Response): Promise<void> => {
  try {
    // check params
    const params = keySchema.safeParse(req.params)
    if (!params.success) {
      res.status(401).json({ message: `Params inválido: ${JSON.stringify(params.error.format())}` })
      return
    }

    // check query
    const query = statusSelectSchema.safeParse(req.query)
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
    const status = await prisma.status.findMany({
      where: {
        uuid: filter.key === 'all' ? undefined : filter.key,
        name: filter.name ? { contains: filter.name } : undefined,
        description: filter.description ? { contains: filter.description } : undefined,
        priority: filter.priority ? { in: filter.priority } : undefined,
      },
    })

    res.status(200).json(status)
    return
  } catch (e) {
    console.error('Erro no servidor:', e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const statusCreate = async (req: Request, res: Response): Promise<void> => {
  try {
    // check schema
    const body = statusCreateSchema.safeParse(req.body)
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
    if (!(await authorization('admin', token.authUuid))) {
      res.status(401).json({ message: 'Usuário sem autorização para criar esses dados!' })
      return
    }

    // create resource
    await prisma.status.create({
      data: {
        name: body.data.name,
        description: body.data.description,
        priority: body.data.priority,
      },
    })

    res.status(201).json({ message: 'O status foi cadastrado.' })
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const statusUpdate = async (req: Request, res: Response): Promise<void> => {
  try {
    // check schema
    const body = statusUpdateSchema.safeParse(req.body)
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

    // check if status exist
    const status = await prisma.status.findUnique({
      where: {
        uuid: body.data.uuid,
      },
    })
    if (!status) {
      res.status(401).json({ message: 'Status não econtrado!' })
      return
    }

    // check if user has authorization
    if (!(await authorization('admin', token.authUuid))) {
      res.status(401).json({ message: 'Usuário sem autorização para editar esses dados!' })
      return
    }

    // create resource
    await prisma.status.update({
      data: {
        name: body.data.name,
        description: body.data.description,
        priority: body.data.priority,
      },
      where: {
        uuid: body.data.uuid,
      },
    })

    res.status(201).json({ message: 'O status foi editado.' })
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const statusDelete = async (req: Request, res: Response): Promise<void> => {
  try {
    // check params
    const params = uuidSchema('status').safeParse(req.params)
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

    // check if user has authorization
    if (!(await authorization('admin', token.authUuid))) {
      res.status(401).json({ message: 'Usuário sem autorização para excluir os dados!' })
      return
    }

    // check if status exist
    const status = await prisma.status.findUnique({ where: { uuid: params.data.uuid } })
    if (!status) {
      res.status(401).json({ message: 'Fornecedor não econtrado!' })
      return
    }

    // check pending issues
    const project = await prisma.project.findMany({ where: { statusUuid: params.data.uuid } })
    const task = await prisma.task.findMany({ where: { statusUuid: params.data.uuid } })
    if (project.length || task.length) {
      res.status(401).json({ message: 'O status contém pendências!' })
      return
    }

    // create resource
    await prisma.status.delete({ where: { uuid: params.data.uuid } })

    res.status(201).json({ message: 'O status foi deletado.' })
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}
