import { useState } from 'react'
import { Pagination } from '../../../../hooks/usePagination'
import Button from '../../../../components/Form/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import { ExpenseProps } from '../../../../types/Database'

const ExpenseIdentifyInfo = ({ expense }: { expense: ExpenseProps }) => (
  <>
    <p>
      <b>Nome: </b> {expense.transaction.name}
    </p>
    <p>
      <b>Descrição: </b> {expense.transaction.description}
    </p>
    {expense.transaction.project && (
      <p>
        <b>Projeto: </b> {expense.transaction.project.name}
      </p>
    )}
  </>
)

const ExpenseRegisterInfo = ({ expense }: { expense: ExpenseProps }) => (
  <>
    <p>
      <b>Usuário: </b> {expense.transaction.user.username}
    </p>
    <p>
      <b>Data de registro: </b> {expense.transaction.register}
    </p>
    <p>
      <b>Data da transação: </b> {expense.transaction.date}
    </p>
  </>
)

const ExpenseMoneyInfo = ({ expense }: { expense: ExpenseProps }) => (
  <>
    <p>
      <b>Quantia: </b> {expense.transaction.amount}
    </p>
    <p>
      <b>Fornecedor: </b>
      {expense.supplier.enterprise?.entity.name || expense.supplier.person?.entity.name}
    </p>
  </>
)

const List = ({ expenses }: { expenses: ExpenseProps[] }) => {
  const itemsPerPage = 10
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState<number>(0)

  const start = currentPage * itemsPerPage
  const end = Math.min((currentPage + 1) * itemsPerPage - 1, expenses.length - 1)
  const pageRange = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  return (
    <>
      <div className="flex justify-end">
        <Button
          color="success"
          className="w-50 h-8"
          onClick={() => navigate('/transaction/expense/create/')}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-1" />
          Adicionar Despesa
        </Button>
      </div>

      {pageRange.map((key) => {
        const expense = expenses[key]

        return (
          <div
            key={expenses[key].uuid}
            className="grid grid-cols-5 lg:grid-cols-6 gap-2 my-3 px-3 lg:px-5 py-3 text-sm text-black dark:text-white shadow-1 rounded-md border border-stroke dark:border-strokedark dark:bg-form-input/50"
          >
            <div className="col-span-5 flex lg:hidden flex-col justify-center space-y-1">
              <ExpenseIdentifyInfo expense={expense} />

              <ExpenseRegisterInfo expense={expense} />

              <ExpenseMoneyInfo expense={expense} />
            </div>

            <div className="col-span-2 lg:flex hidden flex-col justify-center space-y-1">
              <ExpenseIdentifyInfo expense={expense} />
            </div>

            <div className="col-span-2 lg:flex hidden flex-col justify-center space-y-1">
              <ExpenseRegisterInfo expense={expense} />
            </div>

            <div className="col-span-2 lg:flex hidden flex-col justify-center space-y-1">
              <ExpenseMoneyInfo expense={expense} />
            </div>
          </div>
        )
      })}

      <Pagination
        itemsLength={expenses.length}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </>
  )
}

export default List
