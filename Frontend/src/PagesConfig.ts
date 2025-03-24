import { ComponentType } from 'react'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import {
  faArrowRightFromBracket,
  faArrowRightToBracket,
  faBarsProgress,
  faDiagramProject,
  faHouse,
  faMoneyBillTransfer,
  faParachuteBox,
  faQuestion,
  faUser,
  faUserGear,
  faUserPen,
  faUserTie,
  faUserXmark,
} from '@fortawesome/free-solid-svg-icons'
import { AuthProps } from './types/Database'
import Home from './pages/Home/Index'
import Login from './pages/Auth/Login/Index'
import Logout from './pages/Auth/Logout/Index'
import ClientSelect from './pages/Client/Select/Index'
import ClientCreate from './pages/Client/Create/Index'
import ClientUpdate from './pages/Client/Update/Index'
import ClientDelete from './pages/Client/Delete/Index'
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
import SupplierSelect from './pages/Supplier/Select/Index'
import SupplierCreate from './pages/Supplier/Create/Index'
import SupplierUpdate from './pages/Supplier/Update/Index'
import SupplierDelete from './pages/Supplier/Delete/Index'
import Transaction from './pages/Transaction/Index'
import ExpenseSelect from './pages/Transaction/Expense/Select/Index'
import ExpenseCreate from './pages/Transaction/Expense/Create/Index'
import IncomeSelect from './pages/Transaction/Income/Select/Index'
import IncomeCreate from './pages/Transaction/Income/Create/Index'
import RefundSelect from './pages/Transaction/Refund/Select/Index'
import RefundCreate from './pages/Transaction/Refund/Create/Index'
import LoanSelect from './pages/Transaction/Loan/Select/Index'
import LoanCreate from './pages/Transaction/Loan/Create/Index'
import ProjectSelect from './pages/Project/Select/Index'
import ProjectCreate from './pages/Project/Create/Index'
import ProjectUpdate from './pages/Project/Update/Index'
import ProjectDelete from './pages/Project/Delete/Index'
import ProjectBudget from './pages/Project/Budget/Index'
import ProjectTasks from './pages/Project/Tasks/Index'
import ProjectExpense from './pages/Project/Tasks/Expense/Index'
import ProjectActivity from './pages/Project/Tasks/Activity/Index'

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
    useIn: [], //['Navigate'],
    icon: faHouse,
    component: Home,
  },
  {
    title: 'Projetos',
    route: '/project/select',
    protection: ['logged'],
    useIn: ['Navigate'],
    icon: faDiagramProject,
    component: ProjectSelect,
  },
  {
    title: 'Orçamento',
    route: '/project/budget/:uuid',
    protection: ['logged', 'project'],
    useIn: [],
    icon: faQuestion,
    component: ProjectBudget,
  },
  {
    title: 'Tarefas',
    route: '/project/tasks/:uuid',
    protection: ['logged', 'project'],
    useIn: [],
    icon: faQuestion,
    component: ProjectTasks,
  },
  {
    title: 'Realizado',
    route: '/project/tasks/expense/:uuid',
    protection: ['logged'],
    useIn: [],
    icon: faQuestion,
    component: ProjectExpense,
  },
  {
    title: 'Realizado',
    route: '/project/tasks/activity/:uuid',
    protection: ['logged'],
    useIn: [],
    icon: faQuestion,
    component: ProjectActivity,
  },
  {
    title: 'Cadastrar Projeto',
    route: '/project/create',
    protection: ['logged', 'project'],
    useIn: [],
    icon: faQuestion,
    component: ProjectCreate,
  },
  {
    title: 'Editar Projeto',
    route: '/project/update/:uuid',
    protection: ['logged', 'project'],
    useIn: [],
    icon: faQuestion,
    component: ProjectUpdate,
  },
  {
    title: 'Deletar Projeto',
    route: '/project/delete/:uuid',
    protection: ['logged', 'project'],
    useIn: [],
    icon: faQuestion,
    component: ProjectDelete,
  },
  {
    title: 'Transações',
    route: '/transaction',
    protection: ['logged', 'financial'],
    useIn: ['Navigate'],
    icon: faMoneyBillTransfer,
    component: Transaction,
  },
  {
    title: 'Receita',
    route: '/transaction/income/select',
    protection: ['logged', 'financial'],
    useIn: [],
    icon: faQuestion,
    component: IncomeSelect,
  },
  {
    title: 'Cadastrar Receita',
    route: '/transaction/income/create',
    protection: ['logged', 'financial'],
    useIn: [],
    icon: faQuestion,
    component: IncomeCreate,
  },
  {
    title: 'Despesa',
    route: '/transaction/expense/select',
    protection: ['logged', 'financial'],
    useIn: [],
    icon: faQuestion,
    component: ExpenseSelect,
  },
  {
    title: 'Cadastrar Despesa',
    route: '/transaction/expense/create',
    protection: ['logged', 'financial'],
    useIn: [],
    icon: faQuestion,
    component: ExpenseCreate,
  },
  {
    title: 'Empréstimo',
    route: '/transaction/loan/select',
    protection: ['logged', 'financial'],
    useIn: [],
    icon: faQuestion,
    component: LoanSelect,
  },
  {
    title: 'Cadastrar Empréstimo',
    route: '/transaction/loan/create',
    protection: ['logged', 'financial'],
    useIn: [],
    icon: faQuestion,
    component: LoanCreate,
  },
  {
    title: 'Reembolso',
    route: '/transaction/refund/select',
    protection: ['logged', 'financial'],
    useIn: [],
    icon: faQuestion,
    component: RefundSelect,
  },
  {
    title: 'Cadastrar Reembolso',
    route: '/transaction/refund/create',
    protection: ['logged', 'financial'],
    useIn: [],
    icon: faQuestion,
    component: RefundCreate,
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
    title: 'Clientes',
    route: '/client/select',
    protection: ['logged'],
    useIn: ['Navigate'],
    icon: faUser,
    component: ClientSelect,
  },
  {
    title: 'Cadastrar Cliente',
    route: '/client/create',
    protection: ['logged'],
    useIn: [],
    icon: faQuestion,
    component: ClientCreate,
  },
  {
    title: 'Editar Cliente',
    route: '/client/update/:uuid',
    protection: ['logged'],
    useIn: [],
    icon: faQuestion,
    component: ClientUpdate,
  },
  {
    title: 'Deletar Cliente',
    route: '/client/delete/:uuid',
    protection: ['logged'],
    useIn: [],
    icon: faQuestion,
    component: ClientDelete,
  },
  {
    title: 'Fornecedores',
    route: '/supplier/select',
    protection: ['logged'],
    useIn: ['Navigate'],
    icon: faParachuteBox,
    component: SupplierSelect,
  },
  {
    title: 'Cadastrar Fornecedor',
    route: '/supplier/create',
    protection: ['logged'],
    useIn: [],
    icon: faQuestion,
    component: SupplierCreate,
  },
  {
    title: 'Editar Fornecedor',
    route: '/supplier/update/:uuid',
    protection: ['logged'],
    useIn: [],
    icon: faQuestion,
    component: SupplierUpdate,
  },
  {
    title: 'Deletar Fornecedor',
    route: '/supplier/delete/:uuid',
    protection: ['logged'],
    useIn: [],
    icon: faQuestion,
    component: SupplierDelete,
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
    route: '/status/update/:uuid',
    protection: ['logged', 'admin'],
    useIn: [],
    icon: faQuestion,
    component: StatusUpdate,
  },
  {
    title: 'Deletar Status',
    route: '/status/delete/:uuid',
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
