import { z } from 'zod'

export const zodUuid = (name: string) => {
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

export const zodEmail = (name: string, nonempty: boolean) => {
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

export const zodBoolean = (name: string) => {
  return z
    .boolean({
      message: `O(a) ${name} deve ser um boleano`,
    })
    .refine((b) => b !== undefined, {
      message: `O(a) ${name} é obrigatória`,
    })
}

export const zodString = (name: string, nonempty: boolean) => {
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

export const zodRegex = (name: string, regex: RegExp, nonempty: boolean) => {
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

export const zodPassword = (name: string) => {
  return z
    .string()
    .min(8, `O(a) ${name} deve ter pelo menos 8 caracteres.`)
    .refine((s) => /[a-zA-Z]/.test(s), {
      message: `O(a) ${name} deve conter pelo menos uma letra.`,
    })
    .refine((s) => /\d/.test(s), {
      message: `O(a) ${name} deve conter pelo menos um número.`,
    })
    .refine((s) => /\W/.test(s), {
      message: `O(a) ${name} deve conter pelo menos um caractere especial.`,
    })
}
