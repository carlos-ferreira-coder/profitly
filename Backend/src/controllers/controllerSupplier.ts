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
import { Supplier, Person, Enterprise, Entity } from '@prisma/client'

type SupplierProps = Supplier & {
  person: (Person & { entity: Entity }) | null
  enterprise: (Enterprise & { entity: Entity }) | null
}

const responseSuppliers = (suppliers: SupplierProps[]) => {
  return suppliers.map((supplier) => {
    return {
      ...supplier,
      person: supplier.person
        ? {
            ...supplier.person,
            entity: {
              ...supplier.person.entity,
              phone: supplier.person.entity.phone ? supplier.person.entity.phone : undefined,
              address: supplier.person.entity.address ? supplier.person.entity.address : undefined,
            },
          }
        : undefined,
      enterprise: supplier.enterprise
        ? {
            ...supplier.enterprise,
            entity: {
              ...supplier.enterprise.entity,
              phone: supplier.enterprise.entity.phone
                ? supplier.enterprise.entity.phone
                : undefined,
              address: supplier.enterprise.entity.address
                ? supplier.enterprise.entity.address
                : undefined,
            },
          }
        : undefined,
    }
  })
}

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

    res.status(200).json(responseSuppliers(suppliers))
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
    await prisma.supplier.create({
      data: {
        id: entity.id,
        active: body.data.active,
        personId: body.data.person ? entity.id : undefined,
        enterpriseId: body.data.enterprise ? entity.id : undefined,
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
    const bodyEntity = (body.data.person?.entity || body.data.enterprise?.entity)!
    const email = await prisma.entity.findUnique({ where: { email: bodyEntity.email } })
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
    if (body.data.enterprise) {
      await prisma.enterprise.update({
        data: {
          fantasy: body.data.enterprise.fantasy,
        },
        where: {
          id: supplierUpdated.id,
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

    // check pending issues
    const doneExpense = await prisma.doneExpense.findMany({
      where: { supplierUuid: params.data.uuid },
    })
    const expense = await prisma.expense.findMany({ where: { supplierUuid: params.data.uuid } })
    const refund = await prisma.refund.findMany({ where: { supplierUuid: params.data.uuid } })
    const loan = await prisma.loan.findMany({ where: { supplierUuid: params.data.uuid } })
    if (doneExpense.length || expense.length || refund.length || loan.length) {
      res.status(401).json({ message: 'O fornecedor contém pendências!' })
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
