import { Request, Response } from 'express'
import { prisma } from '@/server'
import { validateCPF, validateCNPJ } from '@utils/validate'
import {
  supplierCreateSchema,
  supplierSelectSchema,
  supplierUpdateSchema,
  keySchema,
  uuidSchema,
} from '@utils/schema'

export const supplierSelect = async (req: Request, res: Response): Promise<void> => {
  try {
    // check params
    const params = keySchema.safeParse(req.params)
    if (!params.success) {
      res.status(401).json({ message: `Params inválido: ${JSON.stringify(params.error.format())}` })
      return
    }

    // check query
    const query = supplierSelectSchema.safeParse(req.query)
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

    // TODO retificar cpf, cnpj e fantasy
    // server request
    const suppliers = await prisma.supplier.findMany({
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
                  cpf: query.data.cpf ? { contains: query.data.cpf } : undefined,
                  entity: entityFilter,
                },
              },
          query.data.cpf
            ? { enterprise: { is: null } }
            : {
                enterprise: {
                  cnpj: query.data.cnpj ? { contains: query.data.cnpj } : undefined,
                  fantasy: query.data.fantasy ? { contains: query.data.fantasy } : undefined,
                  entity: entityFilter,
                },
              },
        ],
      },
    })

    res.status(200).json(suppliers)
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const supplierCreate = async (req: Request, res: Response): Promise<void> => {
  try {
    // check schema
    const body = supplierCreateSchema.safeParse(req.body)
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
    await prisma.supplier.create({
      data: {
        id: entity.id,
        active: body.data.active,
        personId: body.data.cpf ? entity.id : undefined,
        enterpriseId: body.data.cnpj ? entity.id : undefined,
      },
    })

    res.status(201).json({ message: 'O fornecedor foi cadastrado.' })
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const supplierUpdate = async (req: Request, res: Response): Promise<void> => {
  try {
    // check schema
    const body = supplierUpdateSchema.safeParse(req.body)
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

    // check if supplier exist
    const supplier = await prisma.supplier.findUnique({ where: { uuid: body.data.uuid } })
    if (!supplier) {
      res.status(404).json({ message: 'Fornecedor não econtrado!' })
      return
    }

    // check if email has registered
    const email = await prisma.entity.findUnique({ where: { email: body.data.email } })
    if (email && email.id !== supplier.id) {
      res.status(401).json({ message: 'Esse email já foi registrado!' })
      return
    }

    // create resource
    const supplierUpdated = await prisma.supplier.update({
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
          id: supplierUpdated.id,
        },
      })
    }
    if (body.data.cpf) {
      await prisma.person.update({
        data: {
          cpf: body.data.cpf,
        },
        where: {
          id: supplierUpdated.id,
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
        id: supplierUpdated.id,
      },
    })

    res.status(201).json({ message: 'As informações do fornecedor foram atualizadas.' })
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const supplierDelete = async (req: Request, res: Response): Promise<void> => {
  try {
    // get uuid
    const params = uuidSchema('suppliere').safeParse(req.params)
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

    // check if supplier exist
    const supplier = await prisma.supplier.findUnique({ where: { uuid: params.data.uuid } })
    if (!supplier) {
      res.status(401).json({ message: 'Fornecedor não econtrado!' })
      return
    }

    // create resource
    const supplierDeleted = await prisma.supplier.delete({ where: { uuid: params.data.uuid } })
    if (supplierDeleted.enterpriseId) {
      await prisma.enterprise.delete({ where: { id: supplierDeleted.id } })
    }
    if (supplierDeleted.personId) {
      await prisma.person.delete({ where: { id: supplierDeleted.id } })
    }
    await prisma.entity.delete({ where: { id: supplierDeleted.id } })

    res.status(201).json({ message: 'O fornecedor foi deletado.' })
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}
