import { useNavigate } from 'react-router-dom'
import Breadcrumb from '../../components/Breadcrumb'
import Button from '../../components/Form/Button'

const Transaction = () => {
  const navigate = useNavigate()

  return (
    <>
      <Breadcrumb pageName="Transações" />

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap items-center p-15">
          <div className="flex justify-between w-full mb-15">
            <div className="flex w-full">
              <Button
                color="primary"
                onClick={() => navigate('/transaction/income/select')}
                className="h-15 w-35"
              >
                Receita
              </Button>
            </div>
            <div className="flex w-full">
              <Button
                color="primary"
                onClick={() => navigate('/transaction/expense/select')}
                className="h-15 w-35"
              >
                Despesa
              </Button>
            </div>
          </div>
          <div className="flex justify-between gap-15 w-full">
            <div className="flex w-full">
              <Button
                color="primary"
                onClick={() => navigate('/transaction/refund/select')}
                className="h-15 w-35"
              >
                Reembolso
              </Button>
            </div>
            <div className="flex w-full">
              <Button
                color="primary"
                onClick={() => navigate('/transaction/loan/select')}
                className="h-15 w-35"
              >
                Empréstimo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Transaction
