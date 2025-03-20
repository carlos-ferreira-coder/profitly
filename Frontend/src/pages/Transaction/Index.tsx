import { useNavigate } from 'react-router-dom'
import Breadcrumb from '../../components/Breadcrumb'
import Button from '../../components/Form/Button'

const Transaction = () => {
  const navigate = useNavigate()

  return (
    <>
      <Breadcrumb pageName="Transações" />

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap p-8 w-full items-center">
          <div className="flex flex-col space-y-5">
            <Button
              color="primary"
              onClick={() => navigate('/transaction/income/select')}
              className="h-12 w-full"
            >
              Receita
            </Button>
            <Button
              color="primary"
              onClick={() => navigate('/transaction/expense/select')}
              className="h-12 w-full"
            >
              Despesa
            </Button>
            <Button
              color="primary"
              onClick={() => navigate('/transaction/refund/select')}
              className="h-12 w-full"
            >
              Reembolso
            </Button>
            <Button
              color="primary"
              onClick={() => navigate('/transaction/loan/select')}
              className="h-12 w-full"
            >
              Empréstimo
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Transaction
