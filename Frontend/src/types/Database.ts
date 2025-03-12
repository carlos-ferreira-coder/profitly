export type AuthProps = {
  uuid: string
  name: string
  admin: boolean
  project: boolean
  personal: boolean
  financial: boolean
}

export type StatusProps = {
  uuid: string
  name: string
  description: string
  priority: number
}

export type UserProps = {
  uuid: string
  username: string
  active: boolean
  photo?: string
  hourlyRate?: string
  authUuid: string
  person: {
    cpf: string
    entity: {
      name: string
      email: string
      phone?: string
      address?: string
    }
  }
  auth: {
    uuid: string
    name: string
  }
}

export type ClientProps = {
  uuid: string
  active: boolean
  person?: {
    cpf: string
    entity: {
      name: string
      email: string
      phone?: string
      address?: string
    }
  }
  enterprise?: {
    cnpj: string
    fantasy: string
    entity: {
      name: string
      email: string
      phone?: string
      address?: string
    }
  }
}

export type SupplierProps = {
  uuid: string
  active: boolean
  person?: {
    cpf: string
    entity: {
      name: string
      email: string
      phone?: string
      address?: string
    }
  }
  enterprise?: {
    cnpj: string
    fantasy: string
    entity: {
      name: string
      email: string
      phone?: string
      address?: string
    }
  }
}
