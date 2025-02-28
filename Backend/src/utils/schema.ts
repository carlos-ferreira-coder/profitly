import { z, ZodSchema } from 'zod'

export const dataSchema = <T>(dataCheck: T, schema: ZodSchema<T>) => {
  let message: string = ''

  const { success, data, error } = schema.safeParse(dataCheck)
  if (!success) {
    message = `Parameters passed in the schema are invalid: ${error?.issues.map((issue) => issue.path.join('.') + ' - ' + issue.message).join(', ')}`
  }

  return { data: data, error: message }
}

const uuid = (name: string) => {
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

const email = (name: string, nonempty: boolean = false) => {
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

const boolean = (name: string) => {
  return z
    .boolean({
      message: `O(a) ${name} deve ser um boleano`,
    })
    .refine((b) => b !== undefined, {
      message: `O(a) ${name} é obrigatória`,
    })
}

const str = (name: string, nonempty: boolean = false) => {
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

const regex = (name: string, regex: RegExp, nonempty: boolean = false) => {
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

export const loginSchema = {
  type: regex('tipo', /^cpf$|^email$|^username$/),
  cpf: regex('cpf', /^\d{3}\.\d{3}\.\d{3}-\d{2}$/).nullable(),
  email: email('usuário').nullable(),
  username: str('nome de usuário').nullable(),
  password: regex('senha', /^(?=.*\d)(?=.*\W)[a-zA-Z\d\W]{8,}$/, true),
}

export const authSchema = {
  uuid: uuid('cargo/função'),
  name: str('nome', true),
  admin: boolean('autorização de administrador'),
  project: boolean('autorização de editar projetos'),
  personal: boolean('autorização de informações pessoais'),
  financial: boolean('autorização de informações financeiras'),
}
