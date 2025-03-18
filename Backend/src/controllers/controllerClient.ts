import { Request, Response } from 'express'
import { prisma } from '@/server'
import { validateCPF, validateCNPJ } from '@utils/validate'
import {
  clientCreateSchema,
  clientSelectSchema,
  clientUpdateSchema,
  keySchema,
  uuidSchema,
} from '@utils/schema'
import { Client, Person, Enterprise, Entity } from '@prisma/client'

type ClientProps = Client & {
  person: (Person & { entity: Entity }) | null
  enterprise: (Enterprise & { entity: Entity }) | null
}

const responseClients = (clients: ClientProps[]) => {
  return clients.map((client) => {
    return {
      ...client,
      person: client.person
        ? {
            ...client.person,
            entity: {
              ...client.person.entity,
              phone: client.person.entity.phone ? client.person.entity.phone : undefined,
              address: client.person.entity.address ? client.person.entity.address : undefined,
            },
          }
        : undefined,
      enterprise: client.enterprise
        ? {
            ...client.enterprise,
            entity: {
              ...client.enterprise.entity,
              phone: client.enterprise.entity.phone ? client.enterprise.entity.phone : undefined,
              address: client.enterprise.entity.address
                ? client.enterprise.entity.address
                : undefined,
            },
          }
        : undefined,
    }
  })
}

export const clientSelect = async (req: Request, res: Response): Promise<void> => {
  try {
    // check params
    const params = keySchema.safeParse(req.params)
    if (!params.success) {
      res.status(401).json({ message: `Params inválido: ${JSON.stringify(params.error.format())}` })
      return
    }

    // check query
    const query = clientSelectSchema.safeParse(req.query)
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
    const clients = await prisma.client.findMany({
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
      where: {
        uuid: filter.key === 'all' ? undefined : filter.key,
        active: filter.active?.length === 1 ? filter.active[0] : undefined,
        person: filter.person
          ? {
              cpf: filter.person.cpf,
              entity: filter.person.entity
                ? {
                    name: filter.person.entity.name
                      ? { contains: filter.person.entity.name }
                      : undefined,
                    email: filter.person.entity.email
                      ? { contains: filter.person.entity.email }
                      : undefined,
                    phone: filter.person.entity.phone
                      ? { contains: filter.person.entity.phone }
                      : undefined,
                    address: filter.person.entity.address
                      ? { contains: filter.person.entity.address }
                      : undefined,
                  }
                : undefined,
            }
          : undefined,
        enterprise: filter.enterprise
          ? {
              cnpj: filter.enterprise.cnpj,
              fantasy: filter.enterprise.fantasy,
              entity: filter.enterprise.entity
                ? {
                    name: filter.enterprise.entity.name
                      ? { contains: filter.enterprise.entity.name }
                      : undefined,
                    email: filter.enterprise.entity.email
                      ? { contains: filter.enterprise.entity.email }
                      : undefined,
                    phone: filter.enterprise.entity.phone
                      ? { contains: filter.enterprise.entity.phone }
                      : undefined,
                    address: filter.enterprise.entity.address
                      ? { contains: filter.enterprise.entity.address }
                      : undefined,
                  }
                : undefined,
            }
          : undefined,
      },
    })

    res.status(200).json(responseClients(clients))
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const clientCreate = async (req: Request, res: Response): Promise<void> => {
  try {
    // check schema
    const body = clientCreateSchema.safeParse(req.body)
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

    // check if cpf is valid
    if (body.data.person) {
      if (!validateCPF(body.data.person.cpf)) {
        res.status(401).json({ message: 'CPF inválido!' })
        return
      }

      // check if cpf has registered
      const person = await prisma.person.findUnique({ where: { cpf: body.data.person.cpf } })
      if (person) {
        res.status(401).json({ message: 'Esse CPF já foi registrado!' })
        return
      }
    }

    // check if cnpj is valid
    if (body.data.enterprise) {
      if (!validateCNPJ(body.data.enterprise.cnpj)) {
        res.status(401).json({ message: 'CNPJ inválido!' })
        return
      }

      // check if cnpj has registered
      const enterprise = await prisma.enterprise.findUnique({
        where: { cnpj: body.data.enterprise.cnpj },
      })
      if (enterprise) {
        res.status(401).json({ message: 'Esse CNPJ já foi registrado!' })
        return
      }
    }

    // check if email has registered
    const bodyEntity = (body.data.person?.entity || body.data.enterprise?.entity)!
    const email = await prisma.entity.findUnique({ where: { email: bodyEntity.email } })
    if (email) {
      res.status(401).json({ message: 'Esse email já foi registrado!' })
      return
    }

    // create resource
    const entity = await prisma.entity.create({
      data: {
        name: bodyEntity.name,
        email: bodyEntity.email,
        phone: bodyEntity.phone,
        address: bodyEntity.address,
      },
    })
    if (body.data.enterprise) {
      await prisma.enterprise.create({
        data: {
          id: entity.id,
          cnpj: body.data.enterprise.cnpj,
          fantasy: body.data.enterprise.fantasy,
        },
      })
    }
    if (body.data.person) {
      await prisma.person.create({
        data: {
          id: entity.id,
          cpf: body.data.person.cpf,
        },
      })
    }
    await prisma.client.create({
      data: {
        id: entity.id,
        active: body.data.active,
        personId: body.data.person ? entity.id : undefined,
        enterpriseId: body.data.enterprise ? entity.id : undefined,
      },
    })

    res.status(201).json({ message: 'O cliente foi cadastrado.' })
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const clientUpdate = async (req: Request, res: Response): Promise<void> => {
  try {
    // check schema
    const body = clientUpdateSchema.safeParse(req.body)
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

    // check if client exist
    const client = await prisma.client.findUnique({ where: { uuid: body.data.uuid } })
    if (!client) {
      res.status(404).json({ message: 'Cliente não econtrado!' })
      return
    }

    // check if email has registered
    const bodyEntity = (body.data.person?.entity || body.data.enterprise?.entity)!
    const email = await prisma.entity.findUnique({ where: { email: bodyEntity.email } })
    if (email && email.id !== client.id) {
      res.status(401).json({ message: 'Esse email já foi registrado!' })
      return
    }

    // create resource
    const clientUpdated = await prisma.client.update({
      data: {
        active: body.data.active,
      },
      where: {
        uuid: body.data.uuid,
      },
    })
    if (body.data.enterprise) {
      await prisma.enterprise.update({
        data: {
          fantasy: body.data.enterprise.fantasy,
        },
        where: {
          id: clientUpdated.id,
        },
      })
    }
    await prisma.entity.update({
      data: {
        name: bodyEntity.name,
        email: bodyEntity.email,
        phone: bodyEntity.phone,
        address: bodyEntity.address,
      },
      where: {
        id: clientUpdated.id,
      },
    })

    res.status(201).json({ message: 'As informações do cliente foram atualizadas.' })
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const clientDelete = async (req: Request, res: Response): Promise<void> => {
  try {
    // get uuid
    const params = uuidSchema('cliente').safeParse(req.params)
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

    // check if client exist
    const client = await prisma.client.findUnique({ where: { uuid: params.data.uuid } })
    if (!client) {
      res.status(401).json({ message: 'Cliente não econtrado!' })
      return
    }

    // check pending issues
    const project = await prisma.project.findMany({ where: { clientUuid: params.data.uuid } })
    const income = await prisma.income.findMany({ where: { clientUuid: params.data.uuid } })
    const refund = await prisma.refund.findMany({ where: { clientUuid: params.data.uuid } })
    if (project.length || income.length || refund.length) {
      res.status(401).json({ message: 'O cliente contém pendências!' })
      return
    }

    // create resource
    const clientDeleted = await prisma.client.delete({ where: { uuid: params.data.uuid } })
    if (clientDeleted.enterpriseId) {
      await prisma.enterprise.delete({ where: { id: clientDeleted.id } })
    }
    if (clientDeleted.personId) {
      await prisma.person.delete({ where: { id: clientDeleted.id } })
    }
    await prisma.entity.delete({ where: { id: clientDeleted.id } })

    res.status(201).json({ message: 'O cliente foi deletado.' })
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}
