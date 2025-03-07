import { z } from 'zod'
import { zodBoolean, zodEmail, zodEnum, zodRegex, zodString, zodUuid } from '@utils/z'

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

export const authCheckSchema = z.object({
  admin: zodEnum('admin', ['true', 'false']).refine((val) => val === 'true' || val === 'false', {
    message: "admin must be 'true' or 'false'",
  }),
  project: zodEnum('project', ['true', 'false']).refine(
    (val) => val === 'true' || val === 'false',
    {
      message: "project must be 'true' or 'false'",
    },
  ),
  personal: zodEnum('personal', ['true', 'false']).refine(
    (val) => val === 'true' || val === 'false',
    {
      message: "personal must be 'true' or 'false'",
    },
  ),
  financial: zodEnum('financial', ['true', 'false']).refine(
    (val) => val === 'true' || val === 'false',
    {
      message: "financial must be 'true' or 'false'",
    },
  ),
})

export const authSelectSchema = z.object({
  name: zodString('nome').optional(),
  auth: zodString('cargo/função').optional(),
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

export const userSelectSchema = z.object({
  username: zodString('nome de usuário').optional(),
  active: zodRegex('ativo', /\b(true|false)\b/g).optional(),
  hourlyRateMin: zodString('valor da hora').optional(),
  hourlyRateMax: zodString('valor da hora').optional(),
  auth: zodString('cargo/função').optional(),
  cpf: zodString('cpf').optional(),
  name: zodString('nome').optional(),
  email: zodString('email').optional(),
  phone: zodString('telefone').optional(),
  address: zodString('endereço').optional(),
})
