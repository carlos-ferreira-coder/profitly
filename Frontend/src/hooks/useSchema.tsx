import { z } from 'zod'
import { zodBoolean, zodEmail, zodPassword, zodRegex, zodString, zodUuid } from './useZod'

export const uuidSchema = (name: string) => {
  return z.object({
    uuid: zodUuid(name),
  })
}

export const loginSchema = z
  .object({
    type: zodRegex('tipo', /^cpf$|^email$|^username$/, true),
    cpf: zodRegex('cpf', /^\d{3}\.\d{3}\.\d{3}-\d{2}$/, false).optional(),
    email: zodEmail('usuário', false).optional(),
    username: zodString('nome de usuário', false).optional(),
    password: zodRegex('senha', /^(?=.*\d)(?=.*\W)[a-zA-Z\d\W]{8,}$/, true),
    rememberMe: zodBoolean('manter logado'),
  })
  .superRefine(({ cpf, email, username }, ctx) => {
    if (!(cpf || email || username)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Informe um cpf ou email ou nome de usuário válido!',
        path: ['cpf', 'email', 'username'],
      })
    }
  })

export const authSchema = z.object({
  uuid: zodUuid('cargo/função'),
  name: zodString('cargo/função', true),
  admin: zodBoolean('autorização de administrador'),
  project: zodBoolean('autorização de editar projetos'),
  personal: zodBoolean('autorização de informações pessoais'),
  financial: zodBoolean('autorização de informações financeiras'),
})

export const authCreateSchema = z.object({
  name: zodString('cargo/função', true),
  admin: zodBoolean('autorização de administrador'),
  project: zodBoolean('autorização de editar projetos'),
  personal: zodBoolean('autorização de informações pessoais'),
  financial: zodBoolean('autorização de informações financeiras'),
})

export const statusCreateSchema = z.object({
  name: zodString('nome', true),
  description: zodString('descrição', true),
  priority: zodRegex('prioridade', /^\d+$/, true).transform((s) => parseInt(s)),
})

export const statusUpdateSchema = z.object({
  uuid: zodUuid('status'),
  name: zodString('nome', true),
  description: zodString('descrição', true),
  priority: zodRegex('prioridade', /^\d+$/, true).transform((s) => parseInt(s)),
})

export const statusDeleteSchema = z.object({
  uuid: zodUuid('status'),
  name: zodString('nome', true),
  description: zodString('descrição', true),
  priority: zodString('prioridade', true),
})

const entityCreateSchema = {
  name: zodString('nome completo', true),
  email: zodEmail('email', true),
  phone: zodRegex('contato', /^$|^\(\d{2}\)\s\d{1}\s\d{4}-\d{4}$/, false).transform((s) =>
    s === '' ? undefined : s
  ),
  address: zodString('endereço', false).transform((s) => (s === '' ? undefined : s)),
}

const entityUpdateSchema = {
  name: zodString('nome completo', true),
  email: zodEmail('email', true),
  phone: zodRegex('contato', /^$|^\(\d{2}\)\s\d{1}\s\d{4}-\d{4}$/, false)
    .transform((s) => (s === '' ? undefined : s))
    .nullable(),
  address: zodString('endereço', false)
    .transform((s) => (s === '' ? undefined : s))
    .nullable(),
}

const entityDeleteSchema = {
  name: zodString('nome completo', true),
  email: zodEmail('email', true),
  phone: zodRegex('contato', /^$|^\(\d{2}\)\s\d{1}\s\d{4}-\d{4}$/, false)
    .transform((s) => (s === '' ? undefined : s))
    .nullable(),
  address: zodString('endereço', false)
    .transform((s) => (s === '' ? undefined : s))
    .nullable(),
}

const personCreateSchema = (optional: boolean) => {
  return {
    cpf: optional
      ? zodRegex('cpf', /^\d{3}\.\d{3}\.\d{3}-\d{2}$/, true).optional()
      : zodRegex('cpf', /^\d{3}\.\d{3}\.\d{3}-\d{2}$/, true),
    ...entityCreateSchema,
  }
}

const personUpdateSchema = (optional: boolean) => {
  return {
    cpf: optional
      ? zodRegex('cpf', /^\d{3}\.\d{3}\.\d{3}-\d{2}$/, true).optional()
      : zodRegex('cpf', /^\d{3}\.\d{3}\.\d{3}-\d{2}$/, true),
    ...entityUpdateSchema,
  }
}

const personDeleteSchema = (optional: boolean) => {
  return {
    cpf: optional
      ? zodRegex('cpf', /^\d{3}\.\d{3}\.\d{3}-\d{2}$/, true).optional()
      : zodRegex('cpf', /^\d{3}\.\d{3}\.\d{3}-\d{2}$/, true),
    ...entityDeleteSchema,
  }
}

const enterpriseCreateSchema = (optional: boolean) => {
  return {
    cnpj: optional
      ? zodRegex('cpf', /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, true).optional()
      : zodRegex('cpf', /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, true),
    fantasy: optional
      ? zodString('nome fantasia', true).optional()
      : zodString('nome fantasia', true),
    ...entityCreateSchema,
  }
}

const enterpriseUpdateSchema = (optional: boolean) => {
  return {
    cnpj: optional
      ? zodRegex('cpf', /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, true).optional()
      : zodRegex('cpf', /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, true),
    fantasy: optional
      ? zodString('nome fantasia', true).optional()
      : zodString('nome fantasia', true),
    ...entityUpdateSchema,
  }
}

const enterpriseDeleteSchema = (optional: boolean) => {
  return {
    cnpj: optional
      ? zodRegex('cpf', /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, true).optional()
      : zodRegex('cpf', /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, true),
    fantasy: optional
      ? zodString('nome fantasia', true).optional()
      : zodString('nome fantasia', true),
    ...entityDeleteSchema,
  }
}

export const userCreateSchema = z
  .object({
    username: zodString('nome de usuário', true),
    password: zodPassword('senha'),
    passwordCheck: zodRegex('senha', /^(?=.*\d)(?=.*\W)[a-zA-Z\d\W]{8,}$/, true),
    active: zodBoolean('ativo'),
    hourlyRate: zodRegex('valor da hora', /^$|R\$\s\d{1,3}(\.\d{3})*(,\d{1,2})?$/, false).transform(
      (s) => (s === '' ? undefined : s)
    ),
    authUuid: zodUuid('cargo/função'),
    ...personCreateSchema(false),
  })
  .superRefine(({ password, passwordCheck }, ctx) => {
    if (password !== passwordCheck) {
      ctx.addIssue({
        code: 'custom',
        message: 'As senhas não correspondem!',
        path: ['passwordCheck'],
      })
    }
  })

export const userUpdateSchema = z.object({
  uuid: zodUuid('usuário'),
  username: zodString('nome de usuário', true),
  active: zodBoolean('ativo'),
  hourlyRate: zodRegex('valor da hora', /^$|R\$\s\d{1,3}(\.\d{3})*(,\d{1,2})?$/, false)
    .transform((s) => (s === '' ? undefined : s))
    .nullable(),
  authUuid: zodUuid('cargo/função'),
  ...personUpdateSchema(false),
})

export const userDeleteSchema = z.object({
  uuid: zodUuid('usuário'),
  username: zodString('nome de usuário', true),
  active: zodBoolean('ativo'),
  ...personDeleteSchema,
})

export const userUpdatePasswordSchema = (auth: boolean) => {
  return z
    .object({
      uuid: zodUuid('usuário'),
      passwordCurrent: auth
        ? zodRegex('senha antiga', /^$/, false).optional()
        : zodRegex('senha antiga', /^(?=.*\d)(?=.*\W)[a-zA-Z\d\W]{8,}$/, true).transform((s) =>
            s === '' ? undefined : s
          ),
      password: zodPassword('senha nova'),
      passwordCheck: zodRegex('senha de confirmação', /^(?=.*\d)(?=.*\W)[a-zA-Z\d\W]{8,}$/, true),
    })
    .superRefine(({ password, passwordCheck }, ctx) => {
      if (password !== passwordCheck) {
        ctx.addIssue({
          code: 'custom',
          message: 'As senhas não correspondem!',
          path: ['passwordCheck'],
        })
      }
    })
}

export const userFilePhotoSchema = z
  .instanceof(FileList, {
    message: 'Selecione um arquivo de imagem.',
  })
  .refine((files) => files.length > 0, {
    message: 'Selecione uma imagem.',
  })
  .refine((files) => files.length === 1, {
    message: 'Selecione apenas uma imagem.',
  })
  .refine((files) => files[0].size <= 5 * 1024 * 1024, {
    message: 'O arquivo deve ser menor que 5MB.',
  })
  .refine(
    (files) => ['image/svg+xml', 'image/jpg', 'image/jpeg', 'image/png'].includes(files[0].type),
    {
      message: 'O arquivo deve ser uma imagem (SVG, JPG ou PNG).',
    }
  )

export const clientCreateSchema = z
  .object({
    active: zodBoolean('ativo'),
    type: zodRegex('tipo', /^(Person|Enterprise)$/, true),
    ...personCreateSchema(true),
    ...enterpriseCreateSchema(true),
  })
  .superRefine(({ cpf, cnpj, fantasy }, ctx) => {
    if (!(cpf || (cnpj && fantasy))) {
      ctx.addIssue({
        code: 'custom',
        message: 'O cliente precisa ser pessoa fisica ou juridica!',
        path: ['cpf', 'cnpj'],
      })
    }

    if (cpf && cnpj) {
      ctx.addIssue({
        code: 'custom',
        message: 'Cadastre separadamente pessoa fisica e juridica!',
        path: ['cpf', 'cnpj'],
      })
    }
  })

export const clientUpdateSchema = z.object({
  uuid: zodUuid('cliente'),
  active: zodBoolean('ativo'),
  ...personUpdateSchema(true),
  ...enterpriseUpdateSchema(true),
})

export const clientDeleteSchema = z.object({
  uuid: zodUuid('cliente'),
  active: zodBoolean('ativo'),
  ...personDeleteSchema(true),
  ...enterpriseDeleteSchema(true),
})

export const supplierCreateSchema = z
  .object({
    active: zodBoolean('ativo'),
    type: zodRegex('tipo', /^(Person|Enterprise)$/, true),
    ...personCreateSchema(true),
    ...enterpriseCreateSchema(true),
  })
  .superRefine(({ cpf, cnpj, fantasy }, ctx) => {
    if (!(cpf || (cnpj && fantasy))) {
      ctx.addIssue({
        code: 'custom',
        message: 'O cliente precisa ser pessoa fisica ou juridica!',
        path: ['cpf', 'cnpj'],
      })
    }

    if (cpf && cnpj) {
      ctx.addIssue({
        code: 'custom',
        message: 'Cadastre separadamente pessoa fisica e juridica!',
        path: ['cpf', 'cnpj'],
      })
    }
  })

export const supplierUpdateSchema = z.object({
  uuid: zodUuid('fornecedor'),
  active: zodBoolean('ativo'),
  ...personUpdateSchema(true),
  ...enterpriseUpdateSchema(true),
})

export const supplierDeleteSchema = z.object({
  uuid: zodUuid('fornecedor'),
  active: zodBoolean('ativo'),
  ...personDeleteSchema(true),
  ...enterpriseDeleteSchema(true),
})

const transactionCreateSchema = {
  name: zodString('nome', true),
  description: zodString('descrição', true),
  date: zodRegex(
    'data',
    /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/(\d{2}) ([01]\d|2[0-3]):[0-5]\d$/,
    true
  ).transform((s) => {
    const [date, time] = s.split(' ')
    const [hour, minute] = time.split(':')
    const [day, month, year] = date.split('/')

    return `20${year}-${month}-${day}T${hour}:${minute}:00`
  }),
  amount: zodRegex('valor', /^R\$\s\d{1,3}(\.\d{3})*(,\d{1,2})?$/, true),
  projectUuid: zodRegex(
    'uuid de projeto',
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    false
  )
    .transform((s) => (s === '' ? undefined : s))
    .nullable()
    .optional(),
}

export const billCreateSchema = z.object({
  supplierUuid: zodUuid('fornecedor'),
  ...transactionCreateSchema,
})

export const incomeCreateSchema = z.object({
  clientUuid: zodUuid('cliente'),
  ...transactionCreateSchema,
})

export const refundCreateSchema = z
  .object({
    clientUuid: zodUuid('cliente').optional(),
    supplierUuid: zodUuid('fornecedor').optional(),
    ...transactionCreateSchema,
  })
  .superRefine(({ clientUuid, supplierUuid }, ctx) => {
    if (!(clientUuid || supplierUuid)) {
      ctx.addIssue({
        code: 'custom',
        message: 'O cliente ou fornecedor é obrigatório!',
        path: ['clientUuid', 'supplierUuid'],
      })
    }
  })

export const loanCreateSchema = z.object({
  percent: zodRegex('valor', /^%\s\d{1,3}(,\d{1,2})?$/, true),
  supplierUuid: zodUuid('fornecedor'),
  ...transactionCreateSchema,
})

export const projectCreateSchema = z.object({
  name: zodString('nome', true),
  description: zodString('descrição', true),
  active: zodBoolean('ativo'),
  userUuid: zodRegex(
    'uuid de usuário',
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    false
  )
    .transform((s) => (s === '' ? undefined : s))
    .nullable()
    .optional(),
  clientUuid: zodUuid('cliente'),
  statusUuid: zodUuid('status'),
})

export const projectUpdateSchema = z.object({
  uuid: zodUuid('projeto'),
  name: zodString('nome', true),
  description: zodString('descrição', true),
  active: zodBoolean('ativo'),
  userUuid: zodUuid('usuário').nullable().optional(),
  clientUuid: zodUuid('cliente'),
  statusUuid: zodUuid('status'),
})

export const projectDeleteSchema = z.object({
  uuid: zodUuid('projeto'),
  name: zodString('nome', true),
  description: zodString('descrição', true),
  register: zodRegex(
    'registro',
    /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/(\d{2}) ([01]\d|2[0-3]):[0-5]\d$/,
    true
  ).transform((s) => {
    const [date, time] = s.split(' ')
    const [hour, minute] = time.split(':')
    const [day, month, year] = date.split('/')

    return `20${year}-${month}-${day}T${hour}:${minute}:00`
  }),
  active: zodBoolean('ativo'),
  userUuid: zodUuid('usuário').nullable().optional(),
  clientUuid: zodUuid('cliente'),
  statusUuid: zodUuid('status'),
})

const taskSchema = {
  name: zodString('nome', true),
  description: zodString('descrição', true),
  beginDate: zodRegex(
    'data inicial',
    /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/(\d{2}) ([01]\d|2[0-3]):[0-5]\d$/,
    true
  ).transform((s) => {
    const [date, time] = s.split(' ')
    const [hour, minute] = time.split(':')
    const [day, month, year] = date.split('/')

    return `20${year}-${month}-${day}T${hour}:${minute}:00`
  }),
  endDate: zodRegex(
    'data final',
    /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/(\d{2}) ([01]\d|2[0-3]):[0-5]\d$/,
    true
  ).transform((s) => {
    const [date, time] = s.split(' ')
    const [hour, minute] = time.split(':')
    const [day, month, year] = date.split('/')

    return `20${year}-${month}-${day}T${hour}:${minute}:00`
  }),
  revenue: zodRegex('lucro', /^R\$\s\d{1,3}(\.\d{3})*(,\d{1,2})?$/, true),
  statusUuid: zodUuid('status'),
  projectUuid: zodUuid('projeto'),
  userUuid: zodUuid('usuário').optional(),
  budgetUuid: zodUuid('orçamento').optional(),
}

const taskExpenseSchema = z
  .object({
    uuid: zodUuid('tarefa de despesa'),
    amount: zodRegex('quantia', /^R\$\s\d{1,3}(\.\d{3})*(,\d{1,2})?$/, true),
    ...taskSchema,
  })
  .superRefine(({ beginDate, endDate }, ctx) => {
    if (beginDate > endDate) {
      ctx.addIssue({
        code: 'custom',
        message: 'A data final deve ser posterior a data inicial!',
        path: ['endDate'],
      })
    }
  })

const taskActivitySchema = z
  .object({
    uuid: zodUuid('tarefa de atividade'),
    hourlyRate: zodRegex('valor da hora', /^R\$\s\d{1,3}(\.\d{3})*(,\d{1,2})?$/, true),
    ...taskSchema,
  })
  .superRefine(({ beginDate, endDate }, ctx) => {
    if (beginDate > endDate) {
      ctx.addIssue({
        code: 'custom',
        message: 'A data final deve ser posterior a data inicial!',
        path: ['endDate'],
      })
    }
  })

export const tasksSchema = z.object({
  task: z
    .array(z.union([taskExpenseSchema, taskActivitySchema]))
    .min(1, { message: 'Insira as tarefas para prosseguir!' }),
})

export const budgetSchema = z.object({
  uuid: zodUuid('orçamento'),
  register: zodRegex(
    'registro',
    /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/(\d{2}) ([01]\d|2[0-3]):[0-5]\d$/,
    true
  )
    .transform((s) => {
      const [date, time] = s.split(' ')
      const [hour, minute] = time.split(':')
      const [day, month, year] = date.split('/')

      return `20${year}-${month}-${day}T${hour}:${minute}:00`
    })
    .nullable()
    .optional(),
  task: z
    .array(z.union([taskExpenseSchema, taskActivitySchema]))
    .min(1, { message: 'Insira as tarefas para prosseguir!' }),
})
