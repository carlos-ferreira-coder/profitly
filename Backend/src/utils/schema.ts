import { z } from 'zod'
import { zodBoolean, zodEmail, zodNumber, zodRegex, zodString, zodUuid } from '@utils/z'
import { currencyToNumber } from './currency'

export const keySchema = z.object({
  key: zodRegex(
    'key',
    /^all$|^this$|^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    true,
  ),
})

export const uuidSchema = (name: string) => {
  return z.object({
    uuid: zodUuid(name),
  })
}

export const loginSchema = z
  .object({
    type: zodRegex('tipo', /^(cpf|email|username)$/, true),
    cpf: zodRegex('cpf', /^\d{3}\.\d{3}\.\d{3}-\d{2}$/, true).optional(),
    email: zodEmail('usuário', true).optional(),
    username: zodString('nome de usuário', true).optional(),
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

export const authCheckSchema = z.object({
  admin: zodRegex('admin', /^(true|false)$/, true),
  project: zodRegex('project', /^(true|false)$/, true),
  personal: zodRegex('personal', /^(true|false)$/, true),
  financial: zodRegex('financial', /^(true|false)$/, true),
})

export const authSelectSchema = z.object({
  name: zodString('nome', false).optional(),
  auth: z.array(zodRegex('cargo/função', /^(admin|project|personal|financial)$/, false)).optional(),
  notAuth: z
    .array(zodRegex('cargo/função', /^(admin|project|personal|financial)$/, false))
    .optional(),
})

export const authCreateSchema = z.object({
  name: zodString('nome', true),
  admin: zodBoolean('autorização de administrador'),
  project: zodBoolean('autorização de editar projetos'),
  personal: zodBoolean('autorização de informações pessoais'),
  financial: zodBoolean('autorização de informações financeiras'),
})

export const authUpdateSchema = z.object({
  uuid: zodUuid('cargo/função'),
  name: zodString('nome', true),
  admin: zodBoolean('autorização de administrador'),
  project: zodBoolean('autorização de editar projetos'),
  personal: zodBoolean('autorização de informações pessoais'),
  financial: zodBoolean('autorização de informações financeiras'),
})

export const statusSelectSchema = z.object({
  name: zodString('nome', false).optional(),
  description: zodString('descrição', false).optional(),
  priority: z
    .array(zodRegex('prioridade', /^\d+$/, false).transform((s) => parseInt(s, 10)))
    .optional(),
})

export const statusCreateSchema = z.object({
  name: zodString('nome', true),
  description: zodString('descrição', true),
  priority: zodNumber('prioridade', 1),
})

export const statusUpdateSchema = z.object({
  uuid: zodUuid('status'),
  name: zodString('nome', true),
  description: zodString('descrição', true),
  priority: zodNumber('prioridade', 1),
})

const entitySelectSchema = z.object({
  name: zodString('nome', false).optional(),
  email: zodString('email', false).optional(),
  phone: zodString('contato', false).optional(),
  address: zodString('endereço', false).optional(),
})

const entityCreateSchema = z.object({
  name: zodString('nome', true),
  email: zodEmail('email', true),
  phone: zodRegex('contato', /^\(\d{2}\)\s\d{1}\s\d{4}-\d{4}$/, false).optional(),
  address: zodString('endereço', false).optional(),
})

const entityUpdateSchema = z.object({
  name: zodString('nome', true),
  email: zodEmail('email', true),
  phone: zodRegex('contato', /^\(\d{2}\)\s\d{1}\s\d{4}-\d{4}$/, false).optional(),
  address: zodString('endereço', false).optional(),
})

const personSelectSchema = z.object({
  cpf: zodString('cpf', false).optional(),
  entity: entitySelectSchema.optional(),
})

const personCreateSchema = z.object({
  cpf: zodRegex('cpf', /^\d{3}\.\d{3}\.\d{3}-\d{2}$/, true),
  entity: entityCreateSchema,
})

const personUpdateSchema = z.object({
  entity: entityUpdateSchema,
})

const enterpriseSelectSchema = z.object({
  cnpj: zodString('cpf', false).optional(),
  fantasy: zodString('nome fantasia', false).optional(),
  entity: entitySelectSchema.optional(),
})

const enterpriseCreateSchema = z.object({
  cnpj: zodRegex('cpf', /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, true),
  fantasy: zodString('nome fantasia', true),
  entity: entityCreateSchema,
})

const enterpriseUpdateSchema = z.object({
  fantasy: zodString('nome fantasia', true),
  entity: entityUpdateSchema,
})

export const userSelectSchema = z.object({
  username: zodString('nome de usuário', false).optional(),
  active: z
    .array(zodRegex('ativo', /^(true|false)$/, false).transform((s) => s === 'true'))
    .optional(),
  hourlyRateMin: zodString('valor da hora', false)
    .transform((s) => parseInt(s, 10))
    .optional(),
  hourlyRateMax: zodString('valor da hora', false)
    .transform((s) => parseInt(s, 10))
    .optional(),
  authUuid: z.array(zodUuid('autorização')).optional(),
  person: personSelectSchema.optional(),
})

export const userCreateSchema = z
  .object({
    username: zodString('nome de usuário', true),
    password: zodRegex('senha', /^(?=.*\d)(?=.*\W)[a-zA-Z\d\W]{8,}$/, true),
    passwordCheck: zodRegex('senha de confirmação', /^(?=.*\d)(?=.*\W)[a-zA-Z\d\W]{8,}$/, true),
    active: zodBoolean('ativo'),
    hourlyRate: zodRegex('valor da hora', /^R\$\s\d{1,3}(\.\d{3})*(,\d{1,2})?$/, false)
      .transform((s) => currencyToNumber(s, 'BRL'))
      .optional(),
    authUuid: zodUuid('cargo/função'),
    person: personCreateSchema,
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
  hourlyRate: zodRegex('valor da hora', /^R\$\s\d{1,3}(\.\d{3})*(,\d{1,2})?$/, false)
    .transform((s) => currencyToNumber(s, 'BRL'))
    .optional(),
  authUuid: zodUuid('cargo/função'),
  person: personUpdateSchema,
})

export const userUpdatePasswordSchema = z
  .object({
    uuid: zodUuid('usuário'),
    passwordCurrent: zodRegex(
      'senha antiga',
      /^(?=.*\d)(?=.*\W)[a-zA-Z\d\W]{8,}$/,
      true,
    ).optional(),
    password: zodRegex('senha nova', /^(?=.*\d)(?=.*\W)[a-zA-Z\d\W]{8,}$/, true),
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

export const userUpdatePhotoSchema = z.object({
  uuid: zodUuid('usuário'),
  photo: z
    .instanceof(File, {
      message: 'Selecione um arquivo de imagem.',
    })
    .refine((f) => f.size <= 5 * 1024 * 1024, {
      message: 'O arquivo deve ser menor que 5MB.',
    })
    .refine((f) => ['image/svg+xml', 'image/png', 'image/jpg', 'image/jpeg'].includes(f.type), {
      message: 'O arquivo deve ser uma imagem (SVG, JPG ou PNG).',
    }),
})

export const clientSelectSchema = z.object({
  active: z
    .array(zodRegex('ativo', /^(false|true)$/, false).transform((s) => s === 'true'))
    .optional(),
  person: personSelectSchema.optional(),
  enterprise: enterpriseSelectSchema.optional(),
})

export const clientCreateSchema = z
  .object({
    active: zodBoolean('ativo'),
    person: personCreateSchema.optional(),
    enterprise: enterpriseCreateSchema.optional(),
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

export const clientUpdateSchema = z.object({
  uuid: zodUuid('cliente'),
  active: zodBoolean('ativo'),
  person: personUpdateSchema.optional(),
  enterprise: enterpriseUpdateSchema.optional(),
})

export const supplierSelectSchema = z.object({
  active: z
    .array(zodRegex('ativo', /^(false|true)$/, false).transform((s) => s === 'true'))
    .optional(),
  person: personSelectSchema.optional(),
  enterprise: enterpriseSelectSchema.optional(),
})

export const supplierCreateSchema = z
  .object({
    active: zodBoolean('ativo'),
    person: personCreateSchema.optional(),
    enterprise: enterpriseCreateSchema.optional(),
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

export const supplierUpdateSchema = z.object({
  uuid: zodUuid('fornecedor'),
  active: zodBoolean('ativo'),
  person: personUpdateSchema.optional(),
  enterprise: enterpriseUpdateSchema.optional(),
})

const transactionSelectSchema = z.object({
  name: zodString('nome', false).optional(),
  description: zodString('descrição', false).optional(),
  registerMin: zodRegex('registro', /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, false)
    .transform((s) => new Date(s))
    .optional(),
  registerMax: zodRegex('registro', /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, false)
    .transform((s) => new Date(s))
    .optional(),
  dateMin: zodRegex('data', /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, false)
    .transform((s) => new Date(s))
    .optional(),
  dateMax: zodRegex('data', /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, false)
    .transform((s) => new Date(s))
    .optional(),
  amountMin: zodRegex('quantia', /^\d+$/, false)
    .transform((s) => parseInt(s, 10))
    .optional(),
  amountMax: zodRegex('quantia', /^\d+$/, false)
    .transform((s) => parseInt(s, 10))
    .optional(),
  userUuid: z.array(zodUuid('usuário')).optional(),
  projectUuid: z.array(zodUuid('projeto')).optional(),
})

const transactionCreateSchema = z.object({
  name: zodString('nome', true),
  description: zodString('descrição', true),
  date: zodRegex('data', /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, true).transform(
    (s) => new Date(s),
  ),
  amount: zodRegex('quantia', /^R\$\s\d{1,3}(\.\d{3})*(,\d{1,2})?$/, true).transform((s) =>
    currencyToNumber(s, 'BRL'),
  ),
  projectUuid: zodUuid('cargo/função').optional(),
})

export const expenseSelectSchema = z.object({
  supplierUuid: z.array(zodUuid('fornecedor')).optional(),
  transaction: transactionSelectSchema.optional(),
})

export const expenseCreateSchema = z.object({
  supplierUuid: zodUuid('cargo/função'),
  transaction: transactionCreateSchema,
})

export const incomeSelectSchema = z.object({
  clientUuid: z.array(zodUuid('cliente')).optional(),
  transaction: transactionSelectSchema.optional(),
})

export const incomeCreateSchema = z.object({
  clientUuid: zodUuid('cargo/função'),
  transaction: transactionCreateSchema,
})

export const refundSelectSchema = z.object({
  clientUuid: z.array(zodUuid('cliente')).optional(),
  supplierUuid: z.array(zodUuid('fornecedor')).optional(),
  transaction: transactionSelectSchema.optional(),
})

export const refundCreateSchema = z
  .object({
    clientUuid: zodUuid('cargo/função').optional(),
    supplierUuid: zodUuid('cargo/função').optional(),
    trasaction: transactionCreateSchema,
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

export const loanSelectSchema = z.object({
  supplierUuid: z.array(zodUuid('fornecedor')).optional(),
  installmentMin: zodRegex('parcela', /^\d+$/, false)
    .transform((s) => parseInt(s, 10))
    .optional(),
  installmentMax: zodRegex('parcela', /^\d+$/, false)
    .transform((s) => parseInt(s, 10))
    .optional(),
  monthsMin: zodRegex('meses', /^\d+$/, false)
    .transform((s) => parseInt(s, 10))
    .optional(),
  monthsMax: zodRegex('meses', /^\d+$/, false)
    .transform((s) => parseInt(s, 10))
    .optional(),
  transaction: transactionSelectSchema.optional(),
})

export const loanCreateSchema = z.object({
  supplierUuid: zodUuid('cargo/função'),
  installment: zodRegex('parcela', /^R\$\s\d{1,3}(\.\d{3})*(,\d{1,2})?$/, true).transform((s) =>
    currencyToNumber(s, 'BRL'),
  ),
  months: zodRegex('meses', /^\d+$/, true).transform((s) => parseInt(s)),
  transaction: transactionCreateSchema,
})

export const projectSelectSchema = z.object({
  name: zodString('nome', false).optional(),
  description: zodString('descrição', false).optional(),
  registerMin: zodRegex('registro', /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, false).optional(),
  registerMax: zodRegex('registro', /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, false).optional(),
  active: z
    .array(zodRegex('ativo', /^(false|true)$/, false).transform((s) => s === 'true'))
    .optional(),
  userUuid: z.array(zodUuid('usuário')).optional(),
  clientUuid: z.array(zodUuid('cliente')).optional(),
  statusUuid: z.array(zodUuid('status')).optional(),
})

export const projectCreateSchema = z.object({
  name: zodString('nome', true),
  description: zodString('descrição', true),
  active: zodBoolean('ativo'),
  userUuid: zodUuid('usuário').optional(),
  clientUuid: zodUuid('client'),
  statusUuid: zodUuid('status'),
})

export const projectUpdateSchema = z.object({
  uuid: zodUuid('projeto'),
  name: zodString('nome', true),
  description: zodString('descrição', true),
  active: zodBoolean('ativo'),
  userUuid: zodUuid('usuário').optional(),
  clientUuid: zodUuid('client'),
  statusUuid: zodUuid('status'),
})

export const budgetSelectSchema = z.object({
  projectUuid: z.array(zodUuid('projeto')).optional(),
})

export const tasksSelectSchema = z.object({
  projectUuid: z.array(zodUuid('projeto')).optional(),
  taskExpense: z
    .object({
      uuid: z.array(zodUuid('tarefa de despesa')).optional(),
    })
    .optional(),
  taskActivity: z
    .object({
      uuid: z.array(zodUuid('tarefa de atividade')).optional(),
    })
    .optional(),
})

const taskUpdateSchema = z
  .object({
    name: zodString('nome', true),
    description: zodString('descrição', true),
    finished: zodBoolean('finalizado'),
    beginDate: zodRegex('data inicial', /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, true).transform(
      (s) => new Date(s),
    ),
    endDate: zodRegex('data inicial', /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, true).transform(
      (s) => new Date(s),
    ),
    revenue: zodRegex('lucro', /^R\$\s\d{1,3}(\.\d{3})*(,\d{1,2})?$/, false).transform((s) =>
      currencyToNumber(s, 'BRL'),
    ),
    statusUuid: zodUuid('status'),
    projectUuid: zodUuid('projeto'),
    userUuid: zodUuid('usuário').optional(),
    budgetUuid: zodUuid('orçamento').optional(),
    taskExpense: z
      .object({
        uuid: zodRegex(
          'uuid de tarefa de despesa',
          /^$|^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
          false,
        ),
        amount: zodRegex('quantia', /^R\$\s\d{1,3}(\.\d{3})*(,\d{1,2})?$/, true).transform((s) =>
          currencyToNumber(s, 'BRL'),
        ),
      })
      .optional(),
    taskActivity: z
      .object({
        uuid: zodRegex(
          'uuid de tarefa de despesa',
          /^$|^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
          false,
        ),
        hourlyRate: zodRegex(
          'valor da hora',
          /^R\$\s\d{1,3}(\.\d{3})*(,\d{1,2})?$/,
          true,
        ).transform((s) => currencyToNumber(s, 'BRL')),
      })
      .optional(),
  })
  .superRefine(({ taskExpense, taskActivity }, ctx) => {
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

export const budgetTasksUpdateSchema = z.object({
  uuid: zodUuid('orçamento'),
  tasks: z.array(taskUpdateSchema),
})

export const tasksUpdateSchema = z.object({
  tasks: z.array(taskUpdateSchema),
})

export const doneExpenseSchema = z.object({
  taskUuid: zodUuid('tarefa de despesa'),
  amount: zodRegex('quantia', /^R\$\s\d{1,3}(\.\d{3})*(,\d{1,2})?$/, true).transform((s) =>
    currencyToNumber(s, 'BRL'),
  ),
  date: zodRegex('data', /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, true).transform(
    (s) => new Date(s),
  ),
  supplierUuid: zodUuid('fornecedor'),
})

export const doneActivitySchema = z.object({
  taskUuid: zodUuid('tarefa de despesa'),
  hourlyRate: zodRegex('valor da hora', /^R\$\s\d{1,3}(\.\d{3})*(,\d{1,2})?$/, true).transform(
    (s) => currencyToNumber(s, 'BRL'),
  ),
  beginDate: zodRegex('data inicial', /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, true).transform(
    (s) => new Date(s),
  ),
  endDate: zodRegex('data inicial', /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, true).transform(
    (s) => new Date(s),
  ),
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
