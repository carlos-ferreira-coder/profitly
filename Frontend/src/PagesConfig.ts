import { ComponentType } from 'react'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { AuthProps } from './types/Database'
import Login from './pages/Auth/Login/Index'
import { faArrowRightToBracket } from '@fortawesome/free-solid-svg-icons'

export type PageProps = {
  icon: IconProp
  title: string
  route: string
  useIn: string[]
  protection: string[]
  component: ComponentType
}

export const pages: PageProps[] = [
  {
    title: 'Login',
    route: '/',
    protection: [],
    useIn: ['Settings'],
    icon: faArrowRightToBracket,
    component: Login,
  },
]

export const getPagesByUseIn = (useIn: string, auth: AuthProps) => {
  return pages
    .filter((page) => page.useIn.includes(useIn))
    .filter((page) => {
      const protections: (keyof AuthProps)[] = ['admin', 'project', 'personal', 'financial']
      return protections.every((protection) => {
        return !page.protection.includes(protection) || auth[protection]
      })
    })
}
