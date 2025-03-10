import { ComponentType } from 'react'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import {
  faArrowRightFromBracket,
  faArrowRightToBracket,
  faBarsProgress,
  faHouse,
  faQuestion,
  faUserGear,
  faUserPen,
  faUserTie,
  faUserXmark,
} from '@fortawesome/free-solid-svg-icons'
import { AuthProps } from './types/Database'
import Home from './pages/Home/Index'
import Login from './pages/Auth/Login/Index'
import Logout from './pages/Auth/Logout/Index'
import UserSelect from './pages/User/Select/Index'
import UserCreate from './pages/User/Create/Index'
import UserUpdate from './pages/User/Update/Index'
import UserDelete from './pages/User/Delete/Index'
import AuthSelect from './pages/Auth/Select/Index'
import AuthCreate from './pages/Auth/Create/Index'
import AuthUpdate from './pages/Auth/Update/Index'
import AuthDelete from './pages/Auth/Delete/Index'
import StatusSelect from './pages/Status/Select/Index'
import StatusCreate from './pages/Status/Create/Index'
import StatusUpdate from './pages/Status/Update/Index'
import StatusDelete from './pages/Status/Delete/Index'

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
    title: 'Usuários',
    route: '/user/select',
    protection: ['logged'],
    useIn: ['Navigate', 'Settings'],
    icon: faUserTie,
    component: UserSelect,
  },
  {
    title: 'Cadastrar Usuário',
    route: '/user/create',
    protection: ['logged', 'personal'],
    useIn: [],
    icon: faQuestion,
    component: UserCreate,
  },
  {
    title: 'Editar Usuário',
    route: '/user/update/:uuid',
    protection: ['logged'],
    useIn: ['Settings'],
    icon: faUserPen,
    component: UserUpdate,
  },
  {
    title: 'Deletar Usuário',
    route: '/user/delete/:uuid',
    protection: ['logged', 'personal'],
    useIn: [],
    icon: faUserXmark,
    component: UserDelete,
  },
  {
    title: 'Cargos/Funções',
    route: '/auth/select',
    protection: ['logged', 'admin'],
    useIn: ['Settings'],
    icon: faUserGear,
    component: AuthSelect,
  },
  {
    title: 'Cadastrar Cargo/Função',
    route: '/auth/create',
    protection: ['logged', 'admin'],
    useIn: [],
    icon: faQuestion,
    component: AuthCreate,
  },
  {
    title: 'Editar Cargo/Função',
    route: '/auth/update/:uuid',
    protection: ['logged', 'admin'],
    useIn: [],
    icon: faQuestion,
    component: AuthUpdate,
  },
  {
    title: 'Deletar Cargo/Função',
    route: '/auth/delete/:uuid',
    protection: ['logged', 'admin'],
    useIn: [],
    icon: faQuestion,
    component: AuthDelete,
  },
  {
    title: 'Status',
    route: '/status/select',
    protection: ['logged', 'admin'],
    useIn: ['Settings'],
    icon: faBarsProgress,
    component: StatusSelect,
  },
  {
    title: 'Cadastrar Status',
    route: '/status/create',
    protection: ['logged', 'admin'],
    useIn: [],
    icon: faQuestion,
    component: StatusCreate,
  },
  {
    title: 'Editar Status',
    route: '/status/update/:id',
    protection: ['logged', 'admin'],
    useIn: [],
    icon: faQuestion,
    component: StatusUpdate,
  },
  {
    title: 'Deletar Status',
    route: '/status/delete/:id',
    protection: ['logged', 'admin'],
    useIn: [],
    icon: faQuestion,
    component: StatusDelete,
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
    useIn: [],
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
