import { z, ZodSchema } from 'zod'

export const dataSchema = <T>(dataCheck: T, schema: ZodSchema<T>) => {
  let message: string = ''

  const { success, data, error } = schema.safeParse(dataCheck)
  if (!success) {
    message = `Parameters passed in the schema are invalid: ${error?.issues.map((issue) => issue.path.join('.') + ' - ' + issue.message).join(', ')}`
  }

  return { data: data, error: message }
}

const zodUuid = (name: string) => {
  return z
    .string({
      message: `O uuid do(a) ${name} deve ser um texto`,
    })
    .uuid({
      message: `Informe um uuid de ${name} válido`,
    })
    .nonempty({
      message: `O uuid do(a) ${name} é obrigatório(a)`,
    })
}

const zodEmail = (name: string, nonempty: boolean = false) => {
  const schema = z
    .string({
      message: `O email do(a) ${name} deve ser um texto`,
    })
    .email({
      message: `Informe um email de ${name} válido`,
    })

  if (nonempty) {
    return schema.nonempty({
      message: `O email do(a) ${name} é obrigatório`,
    })
  }

  return schema
}

const zodBoolean = (name: string) => {
  return z
    .boolean({
      message: `O(a) ${name} deve ser um boleano`,
    })
    .refine((b) => b !== undefined, {
      message: `O(a) ${name} é obrigatória`,
    })
}

const zodString = (name: string, nonempty: boolean = false) => {
  const schema = z.string({
    message: `O(a) ${name} deve ser um texto`,
  })

  if (nonempty) {
    return schema.nonempty({
      message: `O(a) ${name} é obrigatório(a)`,
    })
  }

  return schema
}

const zodRegex = (name: string, regex: RegExp, nonempty: boolean = false) => {
  const schema = z
    .string({
      message: `O(a) ${name} deve ser um texto`,
    })
    .regex(regex, {
      message: `Informe um(a) ${name} válido(a)}`,
    })

  if (nonempty) {
    return schema.nonempty({
      message: `O(a) ${name} é obrigatório(a)`,
    })
  }

  return schema
}

export const loginSchema = z
  .object({
    type: zodRegex('tipo', /^cpf$|^email$|^username$/),
    cpf: zodRegex('cpf', /^\d{3}\.\d{3}\.\d{3}-\d{2}$/).nullable(),
    email: zodEmail('usuário').nullable(),
    username: zodString('nome de usuário').nullable(),
    password: zodRegex('senha', /^(?=.*\d)(?=.*\W)[a-zA-Z\d\W]{8,}$/, true),
  })
  .superRefine(({ cpf, email, username }, ctx) => {
    if (!(cpf || email || username)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Informe um cpf ou email válido!',
        path: ['cpf', 'email', 'username'],
      })
    }
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
