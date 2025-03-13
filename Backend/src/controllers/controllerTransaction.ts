import { Request, Response } from 'express'
import { prisma } from '@/server'
import {
  transactionCreateSchema,
  transactionSelectSchema,
  transactionUpdateSchema,
  keySchema,
  uuidSchema,
} from '@utils/schema'
import { numberToCurrency } from '@utils/currency'
import { authorization } from '@utils/auth'
import { error } from 'console'

export const transactionSelect = async (req: Request, res: Response): Promise<void> => {
  try {
    // check params
    const params = keySchema.safeParse(req.params)
    if (!params.success) {
      res.status(401).json({ message: `Params inválido: ${JSON.stringify(params.error.format())}` })
      return
    }

    // check query
    const query = transactionSelectSchema.safeParse(req.query)
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
    const transactions = await prisma.transaction.findMany({
      include: {
        user: true,
        Bill: true,
        Income: true,
        Refund: true,
        Loan: true,
      },
      where: {
        //uuid: params.data.key === 'all' ? undefined : params.data.key,
      },
    })

    res.status(200).json(transactions)
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const transactionCreate = async (req: Request, res: Response): Promise<void> => {
  try {
    // check schema
    const body = transactionCreateSchema.safeParse(req.body)
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
    if (!(await authorization('financial', token.authUuid))) {
      res.status(401).json({ message: 'Usuário sem autorização para criar esses dados!' })
      return
    }

    // check if user has registered
    const user = await prisma.user.findUnique({ where: { uuid: body.data.userUuid } })
    if (!user) {
      res.status(401).json({ message: 'Usuário não econtrado!' })
      return
    }

    // check if project has registered
    if (body.data.projectUuid) {
      const project = await prisma.project.findUnique({ where: { uuid: body.data.projectUuid } })
      if (!project) {
        res.status(401).json({ message: 'Projeto não econtrado!' })
        return
      }
    }

    // check if client has registered
    if (body.data.clientUuid) {
      const client = await prisma.client.findUnique({ where: { uuid: body.data.clientUuid } })
      if (!client) {
        res.status(401).json({ message: 'Cliente não econtrado!' })
        return
      }
    }

    // check if supplier has registered
    if (body.data.supplierUuid) {
      const supplier = await prisma.supplier.findUnique({ where: { uuid: body.data.supplierUuid } })
      if (!supplier) {
        res.status(401).json({ message: 'Fornecedor não econtrado!' })
        return
      }
    }

    // create resource
    const transaction = await prisma.transaction.create({
      data: {
        name: body.data.name,
        description: body.data.description,
        register: new Date(),
        date: body.data.date,
        amount: body.data.amount,
        userUuid: body.data.userUuid,
        projectUuid: body.data.projectUuid,
      },
    })

    switch (body.data.type) {
      case 'Bill': {
        await prisma.bill.create({
          data: {
            id: transaction.id,
            supplierUuid: body.data.supplierUuid || '',
          },
        })
        break
      }
      case 'Income': {
        await prisma.income.create({
          data: {
            id: transaction.id,
            clientUuid: body.data.clientUuid || '',
          },
        })
        break
      }
      case 'Refund': {
        await prisma.refund.create({
          data: {
            id: transaction.id,
            clientUuid: body.data.clientUuid,
            supplierUuid: body.data.supplierUuid,
          },
        })
        break
      }
      case 'Loan': {
        await prisma.loan.create({
          data: {
            id: transaction.id,
            percent: body.data.percent || '',
            supplierUuid: body.data.supplierUuid || '',
          },
        })
        break
      }
      default: {
        throw new Error('Tipo de transação não conhecido!')
      }
    }

    res.status(201).json({ message: 'A transação foi cadastrada.' })
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const transactionUpdate = async (req: Request, res: Response): Promise<void> => {
  try {
    // check schema
    const body = transactionUpdateSchema.safeParse(req.body)
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
    if (!(await authorization('financial', token.authUuid))) {
      res.status(401).json({ message: 'Usuário sem autorização para criar esses dados!' })
      return
    }

    // check if transaction exist
    let transaction
    switch (body.data.type) {
      case 'Bill': {
        transaction = await prisma.bill.findUnique({ where: { uuid: body.data.uuid } })
        break
      }
      case 'Income': {
        transaction = await prisma.income.findUnique({ where: { uuid: body.data.uuid } })
        break
      }
      case 'Refund': {
        transaction = await prisma.refund.findUnique({ where: { uuid: body.data.uuid } })
        break
      }
      case 'Loan': {
        transaction = await prisma.loan.findUnique({ where: { uuid: body.data.uuid } })
        break
      }
      default: {
        throw new Error('Tipo de transação não conhecido!')
      }
    }
    if (!transaction) {
      res.status(401).json({ message: 'Trasação não econtrada!' })
      return
    }

    // check if user has registered
    const user = await prisma.user.findUnique({ where: { uuid: body.data.userUuid } })
    if (!user) {
      res.status(401).json({ message: 'Usuário não econtrado!' })
      return
    }

    // check if project has registered
    if (body.data.projectUuid) {
      const project = await prisma.project.findUnique({ where: { uuid: body.data.projectUuid } })
      if (!project) {
        res.status(401).json({ message: 'Projeto não econtrado!' })
        return
      }
    }

    // check if client has registered
    if (body.data.clientUuid) {
      const client = await prisma.client.findUnique({ where: { uuid: body.data.clientUuid } })
      if (!client) {
        res.status(401).json({ message: 'Cliente não econtrado!' })
        return
      }
    }

    // check if supplier has registered
    if (body.data.supplierUuid) {
      const supplier = await prisma.supplier.findUnique({ where: { uuid: body.data.supplierUuid } })
      if (!supplier) {
        res.status(401).json({ message: 'Fornecedor não econtrado!' })
        return
      }
    }

    // create resource
    let transactionUpdated
    switch (body.data.type) {
      case 'Bill': {
        transactionUpdated = await prisma.bill.update({
          data: {
            supplierUuid: body.data.supplierUuid || '',
          },
          where: {
            uuid: body.data.uuid,
          },
        })
        break
      }
      case 'Income': {
        transactionUpdated = await prisma.income.update({
          data: {
            clientUuid: body.data.clientUuid || '',
          },
          where: {
            uuid: body.data.uuid,
          },
        })
        break
      }
      case 'Refund': {
        transactionUpdated = await prisma.refund.update({
          data: {
            clientUuid: body.data.clientUuid,
            supplierUuid: body.data.supplierUuid,
          },
          where: {
            uuid: body.data.uuid,
          },
        })
        break
      }
      case 'Loan': {
        transactionUpdated = await prisma.loan.update({
          data: {
            percent: body.data.percent || '',
            supplierUuid: body.data.supplierUuid || '',
          },
          where: {
            uuid: body.data.uuid,
          },
        })
        break
      }
      default: {
        throw new Error('Tipo de transação não conhecido!')
      }
    }

    await prisma.transaction.update({
      data: {
        name: body.data.name,
        description: body.data.description,
        date: body.data.date,
        amount: body.data.amount,
        userUuid: body.data.userUuid,
        projectUuid: body.data.projectUuid,
      },
      where: {
        id: transactionUpdated.id,
      },
    })

    res.status(201).json({ message: 'As informações da transação foram atualizadas.' })
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}

export const transactionDelete = async (req: Request, res: Response): Promise<void> => {
  try {
    // get uuid
    const params = uuidSchema('transação').safeParse(req.params)
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

    // check if transaction exist
    const transaction = await prisma.transaction.findUnique({ where: { uuid: params.data.uuid } })
    if (!transaction) {
      res.status(401).json({ message: 'Transação não econtrado!' })
      return
    }

    // create resource
    const transactionDeleted = await prisma.transaction.delete({
      where: { uuid: params.data.uuid },
    })
    if (transactionDeleted.enterpriseId) {
      await prisma.enterprise.delete({ where: { id: transactionDeleted.id } })
    }
    if (transactionDeleted.personId) {
      await prisma.person.delete({ where: { id: transactionDeleted.id } })
    }
    await prisma.entity.delete({ where: { id: transactionDeleted.id } })

    res.status(201).json({ message: 'A transação foi deletada.' })
    return
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Erro no servidor!' })
    return
  }
}
