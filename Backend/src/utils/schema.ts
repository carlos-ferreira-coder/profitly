import { z, ZodSchema } from 'zod'

export const dataSchema = <T>(dataCheck: T, schema: ZodSchema<T>) => {
  let message: string = ''

  const { success, data, error } = schema.safeParse(dataCheck)
  if (!success) {
    message = `Parameters passed in the schema are invalid: ${error?.issues.map((issue) => issue.path.join('.') + ' - ' + issue.message).join(', ')}`
  }

  return { data: data, error: message }
}

const uuid = (name: String) => {
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

const str = (name: String) => {
  return z
    .string({
      message: `O(a) ${name} deve ser um texto`,
    })
    .nonempty({
      message: `O(a) ${name} é obrigatório(a)`,
    })
}

const email = (name: String) => {
  return z
    .string({
      message: `O email do(a) ${name} deve ser um texto`,
    })
    .email({
      message: `Informe um email de ${name} válido`,
    })
    .nonempty({
      message: `O email do(a) ${name} é obrigatório`,
    })
}

const regex = (name: String, regex: RegExp) => {
  return z
    .string({
      message: `O(a) ${name} deve ser um texto`,
    })
    .regex(regex, {
      message: `Informe um(a) ${name} válido(a)}`,
    })
    .nonempty({
      message: `O(a) ${name} é obrigatório(a)`,
    })
}

const auth = (name: String) => {
  return z
    .boolean({
      message: `A autorização de ${name} deve ser um boleano`,
    })
    .refine((b) => b !== undefined, {
      message: `A autorização de ${name} é obrigatória`,
    })
}

export const userSchema = {
  cpf: regex('cpf', /^\d{3}\.\d{3}\.\d{3}-\d{2}$/),
  email: email('usuário'),
  password: regex('senha', /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/),
}

export const authSchema = {
  uuid: uuid('cargo/função'),
  name: str('nome'),
  admin: auth('administrador'),
  project: auth('editar projetos'),
  personal: auth('informações pessoais'),
  financial: auth('informações financeiras'),
}
