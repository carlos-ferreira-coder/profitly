import { useState } from 'react'
import { Pagination } from '../../../../hooks/usePagination'
import Button from '../../../../components/Form/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import { RefundProps } from '../../../../types/Database'

const RefundIdentifyInfo = ({ refund }: { refund: RefundProps }) => (
  <>
    <p>
      <b>Nome: </b> {refund.transaction.name}
    </p>
    <p>
      <b>Descrição: </b> {refund.transaction.description}
    </p>
    {refund.transaction.project && (
      <p>
        <b>Projeto: </b> {refund.transaction.project.name}
      </p>
    )}
  </>
)

const RefundRegisterInfo = ({ refund }: { refund: RefundProps }) => (
  <>
    <p>
      <b>Usuário: </b> {refund.transaction.user.username}
    </p>
    <p>
      <b>Data de registro: </b> {refund.transaction.register}
    </p>
    <p>
      <b>Data da transação: </b> {refund.transaction.date}
    </p>
  </>
)

const RefundMoneyInfo = ({ refund }: { refund: RefundProps }) => (
  <>
    <p>
      <b>Quantia: </b> {refund.transaction.amount}
    </p>
    {refund.supplier && (
      <p>
        <b>Fornecedor: </b>
        {refund.supplier.enterprise?.entity.name || refund.supplier.person?.entity.name}
      </p>
    )}
    {refund.client && (
      <p>
        <b>Cliente: </b>
        {refund.client.enterprise?.entity.name || refund.client.person?.entity.name}
      </p>
    )}
  </>
)

const List = ({ refunds }: { refunds: RefundProps[] }) => {
  const itemsPerPage = 10
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState<number>(0)

  const start = currentPage * itemsPerPage
  const end = Math.min((currentPage + 1) * itemsPerPage - 1, refunds.length - 1)
  const pageRange = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  return (
    <>
      <div className="flex justify-end">
        <Button
          color="success"
          className="w-50 h-8"
          onClick={() => navigate('/transaction/refund/create/')}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-1" />
          Adicionar Reembolso
        </Button>
      </div>

      {pageRange.map((key) => {
        const refund = refunds[key]

        return (
          <div
            key={refunds[key].uuid}
            className="grid grid-cols-5 lg:grid-cols-6 gap-2 my-3 px-3 lg:px-5 py-3 text-sm text-black dark:text-white shadow-1 rounded-md border border-stroke dark:border-strokedark dark:bg-form-input/50"
          >
            <div className="col-span-5 flex lg:hidden flex-col justify-center space-y-1">
              <RefundIdentifyInfo refund={refund} />

              <RefundRegisterInfo refund={refund} />

              <RefundMoneyInfo refund={refund} />
            </div>

            <div className="col-span-2 lg:flex hidden flex-col justify-center space-y-1">
              <RefundIdentifyInfo refund={refund} />
            </div>

            <div className="col-span-2 lg:flex hidden flex-col justify-center space-y-1">
              <RefundRegisterInfo refund={refund} />
            </div>

            <div className="col-span-2 lg:flex hidden flex-col justify-center space-y-1">
              <RefundMoneyInfo refund={refund} />
            </div>
          </div>
        )
      })}

      <Pagination
        itemsLength={refunds.length}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </>
  )
}

export default List
