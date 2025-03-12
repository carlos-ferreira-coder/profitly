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

    // check if has token
    const token = req.user
    if (!token) {
      res.status(401).json({ message: 'Token não encontrado!' })
      return
    }

    const entityFilter = {
      name: query.data.name ? { contains: query.data.name } : undefined,
      email: query.data.email ? { contains: query.data.email } : undefined,
      phone: query.data.phone ? { contains: query.data.phone } : undefined,
      address: query.data.address ? { contains: query.data.address } : undefined,
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
        uuid: params.data.key === 'all' ? undefined : params.data.key,
        active: query.data.active?.length === 1 ? query.data.active[0] : undefined,
        OR: [
          query.data.cnpj || query.data.fantasy
            ? { person: { is: null } }
            : {
                person: {
                  where: {
                    cpf: query.data.cpf ? { contains: query.data.cpf } : undefined,
                    entity: entityFilter,
                  },
                },
              },
          query.data.cpf
            ? { enterprise: { is: null } }
            : {
                enterprise: {
                  where: {
                    cnpj: query.data.cnpj ? { contains: query.data.cnpj } : undefined,
                    fantasy: query.data.fantasy ? { contains: query.data.fantasy } : undefined,
                    entity: entityFilter,
                  },
                },
              },
        ].filter(Boolean),
      },
    })

    res.status(200).json(clients)
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
    if (body.data.cpf) {
      if (!validateCPF(body.data.cpf)) {
        res.status(401).json({ message: 'CPF inválido!' })
        return
      }

      // check if cpf has registered
      const person = await prisma.person.findUnique({ where: { cpf: body.data.cpf } })
      if (person) {
        res.status(401).json({ message: 'Esse CPF já foi registrado!' })
        return
      }
    }

    // check if cnpj is valid
    if (body.data.cnpj) {
      if (!validateCNPJ(body.data.cnpj)) {
        res.status(401).json({ message: 'CNPJ inválido!' })
        return
      }

      // check if cnpj has registered
      const enterprise = await prisma.enterprise.findUnique({ where: { cnpj: body.data.cnpj } })
      if (enterprise) {
        res.status(401).json({ message: 'Esse CNPJ já foi registrado!' })
        return
      }
    }

    // check if email has registered
    const email = await prisma.entity.findUnique({ where: { email: body.data.email } })
    if (email) {
      res.status(401).json({ message: 'Esse email já foi registrado!' })
      return
    }

    // create resource
    const entity = await prisma.entity.create({
      data: {
        name: body.data.name,
        email: body.data.email,
        phone: body.data.phone,
        address: body.data.address,
      },
    })
    if (body.data.cnpj && body.data.fantasy) {
      await prisma.enterprise.create({
        data: {
          id: entity.id,
          cnpj: body.data.cnpj,
          fantasy: body.data.fantasy,
        },
      })
    }
    if (body.data.cpf) {
      await prisma.person.create({
        data: {
          id: entity.id,
          cpf: body.data.cpf,
        },
      })
    }
    await prisma.client.create({
      data: {
        id: entity.id,
        active: body.data.active,
        personId: body.data.cpf ? entity.id : undefined,
        enterpriseId: body.data.cnpj ? entity.id : undefined,
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
    const email = await prisma.entity.findUnique({ where: { email: body.data.email } })
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
    if (body.data.cnpj && body.data.fantasy) {
      await prisma.enterprise.update({
        data: {
          cnpj: body.data.cnpj,
          fantasy: body.data.fantasy,
        },
        where: {
          id: clientUpdated.id,
        },
      })
    }
    if (body.data.cpf) {
      await prisma.person.update({
        data: {
          cpf: body.data.cpf,
        },
        where: {
          id: clientUpdated.id,
        },
      })
    }
    await prisma.entity.update({
      data: {
        name: body.data.name,
        email: body.data.email,
        phone: body.data.phone,
        address: body.data.address,
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

    // create resource
    await prisma.client.delete({ where: { uuid: params.data.uuid } })

    res.status(201).json({ message: 'O cliente foi deletado.' })
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}
