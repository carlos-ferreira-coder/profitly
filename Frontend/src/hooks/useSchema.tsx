import z from 'zod'

const email = (name: string) => {
  return z
    .string({
      message: `O email do(a) ${name} deve ser um texto`,
    })
    .email({
      message: `Informe um email de ${name} válido`,
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
      message: `Informe um(a) ${name} válido(a)`,
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
  username: str('nome do usuário').nullable(),
  password: regex('senha', /^(?=.*\d)(?=.*\W)[a-zA-Z\d\W]{8,}$/),
}
