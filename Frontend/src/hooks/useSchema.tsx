import { z } from 'zod'
import { zodEmail, zodRegex, zodString } from './useZod'

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
        message: 'Informe um cpf ou email ou nome de usuário válido!',
        path: ['cpf', 'email', 'username'],
      })
    }
  })
