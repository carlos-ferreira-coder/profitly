import { z } from 'zod'
import { zodBoolean, zodEmail, zodNumber, zodRegex, zodString, zodUuid } from '@utils/z'

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
    type: zodRegex('tipo', /^cpf$|^email$|^username$/, true),
    cpf: zodRegex('cpf', /^\d{3}\.\d{3}\.\d{3}-\d{2}$/, false).optional(),
    email: zodEmail('usuário', false).optional(),
    username: zodString('nome de usuário', false).optional(),
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
  admin: zodRegex('admin', /^true$|^false$/, true),
  project: zodRegex('project', /^true$|^false$/, true),
  personal: zodRegex('personal', /^true$|^false$/, true),
  financial: zodRegex('financial', /^true$|^false$/, true),
})

export const authSelectSchema = z.object({
  name: zodString('nome', false).optional(),
  auth: zodRegex(
    'cargo/função',
    /^(admin|project|personal|financial)(,(admin|project|personal|financial))*$/,
    false,
  ).optional(),
  notAuth: zodRegex(
    'cargo/função',
    /^(admin|project|personal|financial)(,(admin|project|personal|financial))*$/,
    false,
  ).optional(),
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
  priority: zodRegex('prioridade', /^\d+(,\d+)*$/, false)
    .transform((s) => s.split(',').map((i) => parseInt(i, 10)))
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

export const userSelectSchema = z.object({
  username: zodString('nome de usuário', false).optional(),
  active: zodRegex('ativo', /^(false|true)(,(false|true))?$/, false)
    .transform((s) => s.split(',').map((i) => i === 'true'))
    .optional(),
  hourlyRateMin: zodString('valor da hora', false).optional(),
  hourlyRateMax: zodString('valor da hora', false).optional(),
  auth: zodRegex(
    'uuid(s) de permissões',
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}(,([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}))*$/,
    false,
  )
    .transform((s) => s.split(','))
    .optional(),
  cpf: zodString('cpf', false).optional(),
  name: zodString('nome', false).optional(),
  email: zodString('email', false).optional(),
  phone: zodString('contato', false).optional(),
  address: zodString('endereço', false).optional(),
})

export const userCreateSchema = z
  .object({
    username: zodString('nome de usuário', true),
    password: zodRegex('senha', /^(?=.*\d)(?=.*\W)[a-zA-Z\d\W]{8,}$/, true),
    passwordCheck: zodRegex('senha de confirmação', /^(?=.*\d)(?=.*\W)[a-zA-Z\d\W]{8,}$/, true),
    active: zodBoolean('ativo'),
    hourlyRate: zodRegex('valor da hora', /^R\$\s\d{1,3}(\.\d{3})*(,\d{1,2})?$/, false).optional(),
    authUuid: zodUuid('cargo/função'),
    cpf: zodRegex('cpf', /^\d{3}\.\d{3}\.\d{3}-\d{2}$/, true),
    name: zodString('nome', true),
    email: zodEmail('email', true),
    phone: zodRegex('contato', /^\(\d{2}\)\s\d{1}\s\d{4}-\d{4}$/, false).optional(),
    address: zodString('endereço', false).optional(),
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
    .nullable()
    .optional(),
  authUuid: zodUuid('cargo/função'),
  name: zodString('nome', true),
  email: zodEmail('email', true),
  phone: zodRegex('contato', /^\(\d{2}\)\s\d{1}\s\d{4}-\d{4}$/, false)
    .nullable()
    .optional(),
  address: zodString('endereço', false).nullable().optional(),
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
  active: zodRegex('ativo', /^(false|true)(,(false|true))?$/, false)
    .transform((s) => s.split(',').map((i) => i === 'true'))
    .optional(),
  type: zodRegex('tipo', /^(Person|Enterprise)(,(Person|Enterprise))?$/, false)
    .transform((s) => s.split(','))
    .optional(),
  cpf: zodString('cpf', false).optional(),
  cnpj: zodString('cnpj', false).optional(),
  fantasy: zodString('nome fantasia', false).optional(),
  name: zodString('nome', false).optional(),
  email: zodString('email', false).optional(),
  phone: zodString('telefone', false).optional(),
  address: zodString('endereço', false).optional(),
})

export const clientCreateSchema = z
  .object({
    active: zodBoolean('ativo'),
    type: zodRegex('tipo', /^(Person|Enterprise)$/, true),
    cpf: zodRegex('cpf', /^\d{3}\.\d{3}\.\d{3}-\d{2}$/, true).optional(),
    cnpj: zodRegex('cpf', /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, true).optional(),
    fantasy: zodString('nome fantasia', true).optional(),
    name: zodString('nome completo', true),
    email: zodEmail('email', true),
    phone: zodRegex('contato', /^$|^\(\d{2}\)\s\d{1}\s\d{4}-\d{4}$/, false).optional(),
    address: zodString('endereço', false).optional(),
  })
  .superRefine(({ cpf, cnpj, fantasy }, ctx) => {
    if (!(cpf || (cnpj && fantasy))) {
      ctx.addIssue({
        code: 'custom',
        message: 'O cliente precisa ser pessoa fisica ou juridica!',
        path: ['cpf', 'cnpj'],
      })
    }

    if (cpf && cnpj) {
      ctx.addIssue({
        code: 'custom',
        message: 'Cadastre separadamente pessoa fisica e juridica!',
        path: ['cpf', 'cnpj'],
      })
    }
  })

export const clientUpdateSchema = z
  .object({
    uuid: zodUuid('cliente'),
    active: zodBoolean('ativo'),
    cpf: zodRegex('cpf', /^\d{3}\.\d{3}\.\d{3}-\d{2}$/, true).optional(),
    cnpj: zodRegex('cpf', /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, true).optional(),
    fantasy: zodString('nome fantasia', true).optional(),
    name: zodString('nome completo', true),
    email: zodEmail('email', true),
    phone: zodRegex('contato', /^$|^\(\d{2}\)\s\d{1}\s\d{4}-\d{4}$/, false)
      .nullable()
      .optional(),
    address: zodString('endereço', false).nullable().optional(),
  })
  .superRefine(({ cnpj, fantasy }, ctx) => {
    if (!cnpj && fantasy) {
      ctx.addIssue({
        code: 'custom',
        message: 'O cnpj é obrigatório!',
        path: ['cnpj'],
      })
    }

    if (cnpj && !fantasy) {
      ctx.addIssue({
        code: 'custom',
        message: 'O nome fantasia é obrigatório!',
        path: ['fantasy'],
      })
    }
  })
