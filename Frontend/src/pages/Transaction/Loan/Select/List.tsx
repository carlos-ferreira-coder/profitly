import { useState } from 'react'
import { Pagination } from '../../../../hooks/usePagination'
import Button from '../../../../components/Form/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import { LoanProps } from '../../../../types/Database'

const LoanIdentifyInfo = ({ loan }: { loan: LoanProps }) => (
  <>
    <p>
      <b>Nome: </b> {loan.transaction.name}
    </p>
    <p>
      <b>Descrição: </b> {loan.transaction.description}
    </p>
    {loan.transaction.project && (
      <p>
        <b>Projeto: </b> {loan.transaction.project.name}
      </p>
    )}
  </>
)

const LoanRegisterInfo = ({ loan }: { loan: LoanProps }) => (
  <>
    <p>
      <b>Usuário: </b> {loan.transaction.user.username}
    </p>
    <p>
      <b>Data de registro: </b> {loan.transaction.register}
    </p>
    <p>
      <b>Data da transação: </b> {loan.transaction.date}
    </p>
  </>
)

const LoanMoneyInfo = ({ loan }: { loan: LoanProps }) => (
  <>
    <p>
      <b>Quantia: </b> {loan.transaction.amount}
    </p>
    <p>
      <b>Parcela: </b> {loan.installment}
    </p>
    <p>
      <b>Nº de meses: </b> {loan.months}
    </p>
    <p>
      <b>Fornecedor: </b>
      {loan.supplier.enterprise?.entity.name || loan.supplier.person?.entity.name}
    </p>
  </>
)

const List = ({ loans }: { loans: LoanProps[] }) => {
  const itemsPerPage = 10
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState<number>(0)

  const start = currentPage * itemsPerPage
  const end = Math.min((currentPage + 1) * itemsPerPage - 1, loans.length - 1)
  const pageRange = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  return (
    <>
      <div className="flex justify-end">
        <Button
          color="success"
          className="w-50 h-8"
          onClick={() => navigate('/transaction/loan/create/')}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-1" />
          Adicionar Empréstimo
        </Button>
      </div>

      {pageRange.map((key) => {
        const loan = loans[key]

        return (
          <div
            key={loans[key].uuid}
            className="grid grid-cols-5 lg:grid-cols-6 gap-2 my-3 px-3 lg:px-5 py-3 text-sm text-black dark:text-white shadow-1 rounded-md border border-stroke dark:border-strokedark dark:bg-form-input/50"
          >
            <div className="col-span-5 flex lg:hidden flex-col justify-center space-y-1">
              <LoanIdentifyInfo loan={loan} />

              <LoanRegisterInfo loan={loan} />

              <LoanMoneyInfo loan={loan} />
            </div>

            <div className="col-span-2 lg:flex hidden flex-col justify-center space-y-1">
              <LoanIdentifyInfo loan={loan} />
            </div>

            <div className="col-span-2 lg:flex hidden flex-col justify-center space-y-1">
              <LoanRegisterInfo loan={loan} />
            </div>

            <div className="col-span-2 lg:flex hidden flex-col justify-center space-y-1">
              <LoanMoneyInfo loan={loan} />
            </div>
          </div>
        )
      })}

      <Pagination
        itemsLength={loans.length}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </>
  )
}

export default List
