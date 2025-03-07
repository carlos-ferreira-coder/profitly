import { z } from 'zod'
import { zodBoolean, zodEmail, zodRegex, zodString, zodUuid } from '@utils/z'

export const keySchema = z.object({
  key: zodRegex(
    'key',
    /^all$|^this$|^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    true,
    false,
  ),
})

export const uuidSchema = (name: string) => {
  return z.object({
    uuid: zodUuid(name),
  })
}

export const loginSchema = z
  .object({
    type: zodRegex('tipo', /^cpf$|^email$|^username$/, true, false),
    cpf: zodRegex('cpf', /^\d{3}\.\d{3}\.\d{3}-\d{2}$/, false, true),
    email: zodEmail('usuário', false, true),
    username: zodString('nome de usuário', false, true),
    password: zodRegex('senha', /^(?=.*\d)(?=.*\W)[a-zA-Z\d\W]{8,}$/, true, false),
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
  admin: zodRegex('admin', /^true$|^false$/, true, false),
  project: zodRegex('project', /^true$|^false$/, true, false),
  personal: zodRegex('personal', /^true$|^false$/, true, false),
  financial: zodRegex('financial', /^true$|^false$/, true, false),
})

export const authSelectSchema = z.object({
  name: zodString('nome', false, false).optional(),
  auth: zodString('cargo/função', false, false).optional(),
})

export const authCreateSchema = z.object({
  name: zodString('nome', true, false),
  admin: zodBoolean('autorização de administrador'),
  project: zodBoolean('autorização de editar projetos'),
  personal: zodBoolean('autorização de informações pessoais'),
  financial: zodBoolean('autorização de informações financeiras'),
})

export const authUpdateSchema = z.object({
  uuid: zodUuid('cargo/função'),
  name: zodString('nome', true, false),
  admin: zodBoolean('autorização de administrador'),
  project: zodBoolean('autorização de editar projetos'),
  personal: zodBoolean('autorização de informações pessoais'),
  financial: zodBoolean('autorização de informações financeiras'),
})

export const userSelectSchema = z.object({
  username: zodString('nome de usuário', false, false).optional(),
  active: zodRegex('ativo', /^true$|^false$/, false, false).optional(),
  hourlyRateMin: zodString('valor da hora', false, true).optional(),
  hourlyRateMax: zodString('valor da hora', false, true).optional(),
  auth: zodString('cargo/função', false, false).optional(),
  cpf: zodString('cpf', false, false).optional(),
  name: zodString('nome', false, false).optional(),
  email: zodString('email', false, false).optional(),
  phone: zodString('telefone', false, true).optional(),
  address: zodString('endereço', false, true).optional(),
})
