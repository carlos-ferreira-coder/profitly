export type EntityProps = {
  name: string
  email: string
  phone?: string
  address?: string
}

export type PersonProps = {
  cpf: string
  entity: EntityProps
}

export type EnterpriseProps = {
  cnpj: string
  fantasy: string
  entity: EntityProps
}

export type ClientProps = {
  uuid: string
  active: boolean
  person?: PersonProps
  enterprise?: EnterpriseProps
}

export type SupplierProps = {
  uuid: string
  active: boolean
  person?: PersonProps
  enterprise?: EnterpriseProps
}

export type UserProps = {
  uuid: string
  username: string
  active: boolean
  photo?: string
  hourlyRate?: string
  authUuid: string
  person: PersonProps
  auth: AuthProps
}

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

export type ProjectProps = {
  uuid: string
  name: string
  description: string
  register: string
  active: boolean
  userUuid?: string
  clientUuid: string
  statusUuid: string
  budgetUuid: string
  user?: UserProps
  client: ClientProps
  status: StatusProps
  // metods
  dates: {
    beginDate: string
    endDate: string
  }
  budget: BudgetProps & {
    total: string
    cost: string
    revenue: string
  }
  tx: {
    income: string
    expense: string
    revenue: string
  }
  proj: {
    total: string
    cost: string
    revenue: string
  }
}

export type BudgetProps = {
  uuid: string
  register?: string
  project: ProjectProps
  tasks: TaskProps[]
}

export type TaskProps = {
  name: string
  description: string
  finished: boolean
  beginDate: string
  endDate: string
  revenue: string
  statusUuid: string
  projectUuid: string
  userUuid?: string
  budgetUuid?: string
  status: StatusProps
  project: ProjectProps
  user: UserProps
  budget: BudgetProps
  taskExpense?: TaskExpenseProps
  taskActivity?: TaskActivityProps
  dones?: DoneProps[]
}

export type TaskExpenseProps = {
  uuid: string
  amount: string
  task: TaskProps
}

export type TaskActivityProps = {
  uuid: string
  hourlyRate: string
  task: TaskProps
}

export type DoneProps = {
  name: string
  description: string
  register: string
  userUuid: string
  user: UserProps
  doneExpense?: DoneExpenseProps
  doneActivity?: DoneActivityProps
}

export type DoneActivityProps = {
  uuid: string
  beginDate: string
  endDate: string
  hourlyRate: string
  taskActivityUuid: string
  taskActivity: string
  done: DoneProps
}

export type DoneExpenseProps = {
  uuid: string
  amount: string
  date: string
  supplierUuid: string
  taskExpenseUuid: string
  supplier: SupplierProps
  taskExpense: TaskExpenseProps
  done: DoneProps
}

export type TransactionProps = {
  name: string
  description: string
  register: string
  date: string
  amount: string
  userUuid: string
  projectUuid?: string
  user: UserProps
  project?: ProjectProps
}

export type ExpenseProps = {
  uuid: string
  supplierUuid: string
  supplier: SupplierProps
  transaction: TransactionProps
}

export type IncomeProps = {
  uuid: string
  clientUuid: string
  client: ClientProps
  transaction: TransactionProps
}

export type RefundProps = {
  uuid: string
  clientUuid?: string
  supplierUuid?: string
  client?: ClientProps
  supplier?: SupplierProps
  transaction: TransactionProps
}

export type LoanProps = {
  uuid: string
  installment: number
  months: number
  supplierUuid: string
  supplier: SupplierProps
  transaction: TransactionProps
}
