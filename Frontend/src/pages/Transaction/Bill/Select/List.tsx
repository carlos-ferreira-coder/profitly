import { useState } from 'react'
import { Pagination } from '../../../../hooks/usePagination'
import Button from '../../../../components/Form/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import { BillProps } from '../../../../types/Database'

const BillIdentifyInfo = ({ bill }: { bill: BillProps }) => (
  <>
    <p>
      <b>Nome: </b> {bill.transaction.name}
    </p>
    <p>
      <b>Descrição: </b> {bill.transaction.description}
    </p>
    {bill.transaction.project && (
      <p>
        <b>Projeto: </b> {bill.transaction.project.name}
      </p>
    )}
  </>
)

const BillRegisterInfo = ({ bill }: { bill: BillProps }) => (
  <>
    <p>
      <b>Usuário: </b> {bill.transaction.user.username}
    </p>
    <p>
      <b>Data de registro: </b> {bill.transaction.register}
    </p>
    <p>
      <b>Data da transação: </b> {bill.transaction.date}
    </p>
  </>
)

const BillMoneyInfo = ({ bill }: { bill: BillProps }) => (
  <>
    <p>
      <b>Quantia: </b> {bill.transaction.amount}
    </p>
    <p>
      <b>Fornecedor: </b>
      {bill.supplier.enterprise?.entity.name || bill.supplier.person?.entity.name}
    </p>
  </>
)

const List = ({ bills }: { bills: BillProps[] }) => {
  const itemsPerPage = 10
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState<number>(0)

  const start = currentPage * itemsPerPage
  const end = Math.min((currentPage + 1) * itemsPerPage - 1, bills.length - 1)
  const pageRange = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  return (
    <>
      <div className="flex justify-end">
        <Button color="success" className="w-50 h-8" onClick={() => navigate('/bill/create/')}>
          <FontAwesomeIcon icon={faPlus} className="mr-1" />
          Adicionar Despesa
        </Button>
      </div>

      {pageRange.map((key) => {
        const bill = bills[key]

        return (
          <div
            key={bills[key].uuid}
            className="grid grid-cols-5 lg:grid-cols-6 gap-2 my-3 px-3 lg:px-5 py-3 text-sm text-black dark:text-white shadow-1 rounded-md border border-stroke dark:border-strokedark dark:bg-form-input/50"
          >
            <div className="col-span-5 flex lg:hidden flex-col justify-center space-y-1">
              <BillIdentifyInfo bill={bill} />

              <BillRegisterInfo bill={bill} />

              <BillMoneyInfo bill={bill} />
            </div>

            <div className="col-span-2 lg:flex hidden flex-col justify-center space-y-1">
              <BillIdentifyInfo bill={bill} />
            </div>

            <div className="col-span-2 lg:flex hidden flex-col justify-center space-y-1">
              <BillRegisterInfo bill={bill} />
            </div>

            <div className="col-span-2 lg:flex hidden flex-col justify-center space-y-1">
              <BillMoneyInfo bill={bill} />
            </div>
          </div>
        )
      })}

      <Pagination
        itemsLength={bills.length}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </>
  )
}

export default List
