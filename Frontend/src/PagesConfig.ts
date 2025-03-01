import { ComponentType } from 'react'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import {
  faArrowRightFromBracket,
  faArrowRightToBracket,
  faHouse,
  faQuestion,
} from '@fortawesome/free-solid-svg-icons'
import { AuthProps } from './types/Database'
import Home from './pages/Home/Index'
import Login from './pages/Auth/Login/Index'
import Logout from './pages/Auth/Logout/Index'

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
    title: 'Home',
    route: '/home',
    protection: ['logged'],
    useIn: ['Navigate'],
    icon: faHouse,
    component: Home,
  },
  {
    title: 'Login',
    route: '/',
    protection: [],
    useIn: [],
    icon: faQuestion,
    component: Login,
  },
  {
    title: 'Login',
    route: '/login',
    protection: [],
    useIn: ['Settings'],
    icon: faArrowRightToBracket,
    component: Login,
  },
  {
    title: 'Deslogar',
    route: '/logout',
    protection: [],
    useIn: ['Settings'],
    icon: faArrowRightFromBracket,
    component: Logout,
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
