export type AuthProps = {
  uuid: string
  name: string
  admin: boolean
  project: boolean
  personal: boolean
  financial: boolean
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
