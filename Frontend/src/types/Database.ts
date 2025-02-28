export type AuthProps = {
  // AuthGuard
  uuid: string
  name: string
  admin: boolean
  project: boolean
  personal: boolean
  financial: boolean
}

export type UserProps = {
  // DropdownUser
  uuid: string
  username: string
  photo: string
  type: string
}
