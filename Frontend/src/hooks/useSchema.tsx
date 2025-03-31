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

export const authCreateSchema = z.object({
  name: zodString('cargo/função', true),
  admin: zodBoolean('autorização de administrador'),
  project: zodBoolean('autorização de editar projetos'),
  personal: zodBoolean('autorização de informações pessoais'),
  financial: zodBoolean('autorização de informações financeiras'),
})

export const authSchema = z.object({
  uuid: zodUuid('cargo/função'),
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
  priority: z.union([
    z.number(),
    zodRegex('prioridade', /^\d+$/, true).transform((s) => parseInt(s)),
  ]),
})

export const statusDeleteSchema = z.object({
  uuid: zodUuid('status'),
  name: zodString('nome', true),
  description: zodString('descrição', true),
  priority: zodString('prioridade', true),
})

const entitySchema = z.object({
  name: zodString('nome completo', true),
  email: zodEmail('email', true),
  phone: zodRegex('contato', /^$|^\(\d{2}\)\s\d{1}\s\d{4}-\d{4}$/, false).transform((s) =>
    s === '' ? undefined : s
  ),
  address: zodString('endereço', false).transform((s) => (s === '' ? undefined : s)),
})

const personSchema = z.object({
  cpf: zodRegex('cpf', /^\d{3}\.\d{3}\.\d{3}-\d{2}$/, true),
  entity: entitySchema,
})

const enterpriseSchema = z.object({
  cnpj: zodRegex('cpf', /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, true),
  fantasy: zodString('nome fantasia', true),
  entity: entitySchema,
})

export const userCreateSchema = z
  .object({
    username: zodString('nome de usuário', true),
    password: zodPassword('senha'),
    passwordCheck: zodRegex('senha', /^(?=.*\d)(?=.*\W)[a-zA-Z\d\W]{8,}$/, true),
    active: zodBoolean('ativo'),
    hourlyRate: zodRegex(
      'valor da hora',
      /^$|^R\$\s\d{1,3}(\.\d{3})*(,\d{1,2})?$/,
      false
    ).transform((s) => (s === '' ? undefined : s)),
    authUuid: zodUuid('cargo/função'),
    person: personSchema,
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

export const userSchema = z.object({
  uuid: zodUuid('usuário'),
  username: zodString('nome de usuário', true),
  active: zodBoolean('ativo'),
  hourlyRate: zodRegex('valor da hora', /^$|^R\$\s\d{1,3}(\.\d{3})*(,\d{1,2})?$/, false).transform(
    (s) => (s === '' ? undefined : s)
  ),
  authUuid: zodUuid('cargo/função'),
  person: personSchema,
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
    type: zodRegex('tipo', /^(person|enterprise)$/, true),
    person: personSchema.optional(),
    enterprise: enterpriseSchema.optional(),
  })
  .superRefine(({ person, enterprise }, ctx) => {
    if (!(person || enterprise)) {
      ctx.addIssue({
        code: 'custom',
        message: 'O cliente precisa ser pessoa fisica ou juridica!',
        path: ['person', 'enterprise'],
      })
    }

    if (person && enterprise) {
      ctx.addIssue({
        code: 'custom',
        message: 'Cadastre separadamente pessoa fisica e juridica!',
        path: ['person', 'enterprise'],
      })
    }
  })

export const clientSchema = z.object({
  uuid: zodUuid('cliente'),
  active: zodBoolean('ativo'),
  person: personSchema.optional(),
  enterprise: enterpriseSchema.optional(),
})

export const supplierCreateSchema = z
  .object({
    active: zodBoolean('ativo'),
    type: zodRegex('tipo', /^(person|enterprise)$/, true),
    person: personSchema.optional(),
    enterprise: enterpriseSchema.optional(),
  })
  .superRefine(({ person, enterprise }, ctx) => {
    if (!(person || enterprise)) {
      ctx.addIssue({
        code: 'custom',
        message: 'O cliente precisa ser pessoa fisica ou juridica!',
        path: ['person', 'enterprise'],
      })
    }

    if (person && enterprise) {
      ctx.addIssue({
        code: 'custom',
        message: 'Cadastre separadamente pessoa fisica e juridica!',
        path: ['person', 'enterprise'],
      })
    }
  })

export const supplierSchema = z.object({
  uuid: zodUuid('fornecedor'),
  active: zodBoolean('ativo'),
  person: personSchema.optional(),
  enterprise: enterpriseSchema.optional(),
})

const transactionSchema = z.object({
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
  projectUuid: zodUuid('projeto'),
})

export const expenseCreateSchema = z.object({
  supplierUuid: zodUuid('fornecedor'),
  transaction: transactionSchema,
})

export const incomeCreateSchema = z.object({
  clientUuid: zodUuid('cliente'),
  transaction: transactionSchema,
})

export const refundCreateSchema = z
  .object({
    clientUuid: zodRegex(
      'uuid de cliente',
      /^$|^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
      false
    )
      .transform((s) => (s === '' ? undefined : s))
      .optional(),
    supplierUuid: zodRegex(
      'uuid de fornecedor',
      /^$|^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
      false
    )
      .transform((s) => (s === '' ? undefined : s))
      .optional(),
    transaction: transactionSchema,
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
  installment: zodRegex('parcela', /^R\$\s\d{1,3}(\.\d{3})*(,\d{1,2})?$/, true),
  months: zodRegex('nº de meses', /^\d+$/, true),
  supplierUuid: zodUuid('fornecedor'),
  transaction: transactionSchema,
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
    .optional(),
  clientUuid: zodUuid('cliente'),
  statusUuid: zodUuid('status'),
})

export const projectUpdateSchema = z.object({
  uuid: zodUuid('projeto'),
  name: zodString('nome', true),
  description: zodString('descrição', true),
  active: zodBoolean('ativo'),
  userUuid: zodUuid('usuário').optional(),
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
  userUuid: zodUuid('usuário').optional(),
  clientUuid: zodUuid('cliente'),
  statusUuid: zodUuid('status'),
})

const doneExpenseSchema = z.object({
  taskUuid: zodUuid('tarefa de despesa'),
  amount: zodRegex('quantia', /^R\$\s\d{1,3}(\.\d{3})*(,\d{1,2})?$/, true),
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
  supplierUuid: zodUuid('fornecedor'),
})

const doneActivitySchema = z.object({
  taskUuid: zodUuid('tarefa de despesa'),
  hourlyRate: zodRegex('valor da hora', /^R\$\s\d{1,3}(\.\d{3})*(,\d{1,2})?$/, true),
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
})

export const doneSchema = z
  .object({
    name: zodString('nome', true),
    description: zodString('descrição', true),
    userUuid: zodUuid('usuário'),
    doneExpense: doneExpenseSchema.optional(),
    doneActivity: doneActivitySchema.optional(),
  })
  .superRefine(({ doneExpense, doneActivity }, ctx) => {
    if (!(doneExpense || doneActivity)) {
      ctx.addIssue({
        code: 'custom',
        message: 'O realizado precisa ser despesa ou atividade!',
        path: ['doneExpense', 'doneActivity'],
      })
    }

    if (doneExpense && doneActivity) {
      ctx.addIssue({
        code: 'custom',
        message: 'Cadastre separadamente despesa e atividade!',
        path: ['doneExpense', 'doneActivity'],
      })
    }
  })

const taskExpenseSchema = z.object({
  uuid: zodRegex(
    'uuid de tarefa de despesa',
    /^$|^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    false
  ),
  amount: zodRegex('quantia', /^R\$\s\d{1,3}(\.\d{3})*(,\d{1,2})?$/, true),
})

const taskActivitySchema = z.object({
  uuid: zodRegex(
    'uuid de tarefa de atividade',
    /^$|^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    false
  ),
  hourlyRate: zodRegex('valor da hora', /^R\$\s\d{1,3}(\.\d{3})*(,\d{1,2})?$/, true),
})

const taskSchema = z
  .object({
    name: zodString('nome', true),
    description: zodString('descrição', true),
    finished: zodBoolean('finalizado'),
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
    userUuid: zodRegex(
      'uuid de usuário',
      /^$|^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
      false
    )
      .transform((s) => (s === '' ? undefined : s))
      .optional(),
    budgetUuid: zodRegex(
      'uuid de orçamento',
      /^$|^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
      false
    )
      .transform((s) => (s === '' ? undefined : s))
      .optional(),
    taskExpense: taskExpenseSchema.optional(),
    taskActivity: taskActivitySchema.optional(),
    dones: z.array(doneSchema).optional(),
  })
  .superRefine(({ beginDate, endDate, taskExpense, taskActivity }, ctx) => {
    if (beginDate > endDate) {
      ctx.addIssue({
        code: 'custom',
        message: 'A data final deve ser posterior a data inicial!',
        path: ['endDate'],
      })
    }

    if (!(taskExpense || taskActivity)) {
      ctx.addIssue({
        code: 'custom',
        message: 'A tarefa precisa ser despesa ou atividade!',
        path: ['taskExpense', 'taskActivity'],
      })
    }

    if (taskExpense && taskActivity) {
      ctx.addIssue({
        code: 'custom',
        message: 'Cadastre separadamente despesa e atividade!',
        path: ['taskExpense', 'taskActivity'],
      })
    }
  })

export const tasksSchema = z.object({
  tasks: z.array(taskSchema),
})

export const budgetSchema = z.object({
  uuid: zodUuid('orçamento'),
  tasks: z.array(taskSchema),
})
