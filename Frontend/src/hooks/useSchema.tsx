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

export const authSchema = z.object({
  uuid: zodUuid('cargo/função'),
  name: zodString('cargo/função', true),
  admin: zodBoolean('autorização de administrador'),
  project: zodBoolean('autorização de editar projetos'),
  personal: zodBoolean('autorização de informações pessoais'),
  financial: zodBoolean('autorização de informações financeiras'),
})

export const authCreateSchema = z.object({
  name: zodString('cargo/função', true),
  admin: zodBoolean('autorização de administrador'),
  project: zodBoolean('autorização de editar projetos'),
  personal: zodBoolean('autorização de informações pessoais'),
  financial: zodBoolean('autorização de informações financeiras'),
})

export const userCreateSchema = z
  .object({
    username: zodString('nome de usuário', true),
    password: zodPassword('senha'),
    passwordCheck: zodRegex('senha', /^(?=.*\d)(?=.*\W)[a-zA-Z\d\W]{8,}$/, true),
    active: zodBoolean('ativo'),
    hourlyRate: zodRegex(
      'valor da hora',
      /^$|R?\$?\s?\d{1,3}(\.\d{3})*(,\d{1,2})?$/,
      false
    ).transform((s) => (s === '' ? undefined : s)),
    authUuid: zodUuid('cargo/função'),
    cpf: zodRegex('cpf', /^\d{3}\.\d{3}\.\d{3}-\d{2}$/, true),
    name: zodString('nome completo', true),
    email: zodEmail('email', true),
    phone: zodRegex('contato', /^$|^\(\d{2}\)\s\d{1}\s\d{4}-\d{4}$/, false).transform((s) =>
      s === '' ? undefined : s
    ),
    address: zodString('endereço', false).transform((s) => (s === '' ? undefined : s)),
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
  hourlyRate: zodRegex(
    'valor da hora',
    /^$|R?\$?\s?\d{1,3}(\.\d{3})*(,\d{1,2})?$/,
    false
  ).transform((s) => (s === '' ? undefined : s)),
  authUuid: zodUuid('cargo/função'),
  cpf: zodRegex('cpf', /^\d{3}\.\d{3}\.\d{3}-\d{2}$/, true),
  name: zodString('nome completo', true),
  email: zodEmail('email', true),
  phone: zodRegex('contato', /^$|^\(\d{2}\)\s\d{1}\s\d{4}-\d{4}$/, false).transform((s) =>
    s === '' ? undefined : s
  ),
  address: zodString('endereço', false).transform((s) => (s === '' ? undefined : s)),
})

export const userUpdatePasswordSchema = (auth: boolean) => {
  return z
    .object({
      uuid: zodUuid('usuário'),
      passwordCurrent: zodRegex('senha', /^(?=.*\d)(?=.*\W)[a-zA-Z\d\W]{8,}$/, !auth).transform(
        (s) => (s === '' ? undefined : s)
      ),
      password: zodPassword('senha'),
      passwordCheck: zodRegex('senha', /^(?=.*\d)(?=.*\W)[a-zA-Z\d\W]{8,}$/, true),
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

export const userDeleteSchema = z.object({
  uuid: zodUuid('usuário'),
  username: zodString('nome de usuário', true),
  active: zodBoolean('ativo'),
  cpf: zodRegex('cpf', /^\d{3}\.\d{3}\.\d{3}-\d{2}$/, true),
  name: zodString('nome completo', true),
  email: zodEmail('email', true),
})
