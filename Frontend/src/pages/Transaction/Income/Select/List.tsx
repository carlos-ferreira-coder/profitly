import { useState } from 'react'
import { Pagination } from '../../../../hooks/usePagination'
import Button from '../../../../components/Form/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import { IncomeProps } from '../../../../types/Database'

const IncomeIdentifyInfo = ({ income }: { income: IncomeProps }) => (
  <>
    <p>
      <b>Nome: </b> {income.transaction.name}
    </p>
    <p>
      <b>Descrição: </b> {income.transaction.description}
    </p>
    {income.transaction.project && (
      <p>
        <b>Projeto: </b> {income.transaction.project.name}
      </p>
    )}
  </>
)

const IncomeRegisterInfo = ({ income }: { income: IncomeProps }) => (
  <>
    <p>
      <b>Usuário: </b> {income.transaction.user.username}
    </p>
    <p>
      <b>Data de registro: </b> {income.transaction.register}
    </p>
    <p>
      <b>Data da transação: </b> {income.transaction.date}
    </p>
  </>
)

const IncomeMoneyInfo = ({ income }: { income: IncomeProps }) => (
  <>
    <p>
      <b>Quantia: </b> {income.transaction.amount}
    </p>
    <p>
      <b>Fornecedor: </b>
      {income.client.enterprise?.entity.name || income.client.person?.entity.name}
    </p>
  </>
)

const List = ({ incomes }: { incomes: IncomeProps[] }) => {
  const itemsPerPage = 10
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState<number>(0)

  const start = currentPage * itemsPerPage
  const end = Math.min((currentPage + 1) * itemsPerPage - 1, incomes.length - 1)
  const pageRange = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  return (
    <>
      <div className="flex justify-end">
        <Button
          color="success"
          className="w-50 h-8"
          onClick={() => navigate('/transaction/income/create/')}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-1" />
          Adicionar Receita
        </Button>
      </div>

      {pageRange.map((key) => {
        const income = incomes[key]

        return (
          <div
            key={incomes[key].uuid}
            className="grid grid-cols-5 lg:grid-cols-6 gap-2 my-3 px-3 lg:px-5 py-3 text-sm text-black dark:text-white shadow-1 rounded-md border border-stroke dark:border-strokedark dark:bg-form-input/50"
          >
            <div className="col-span-5 flex lg:hidden flex-col justify-center space-y-1">
              <IncomeIdentifyInfo income={income} />

              <IncomeRegisterInfo income={income} />

              <IncomeMoneyInfo income={income} />
            </div>

            <div className="col-span-2 lg:flex hidden flex-col justify-center space-y-1">
              <IncomeIdentifyInfo income={income} />
            </div>

            <div className="col-span-2 lg:flex hidden flex-col justify-center space-y-1">
              <IncomeRegisterInfo income={income} />
            </div>

            <div className="col-span-2 lg:flex hidden flex-col justify-center space-y-1">
              <IncomeMoneyInfo income={income} />
            </div>
          </div>
        )
      })}

      <Pagination
        itemsLength={incomes.length}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </>
  )
}

export default List
