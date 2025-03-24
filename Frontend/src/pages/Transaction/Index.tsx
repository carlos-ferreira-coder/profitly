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
          <div className="flex flex-col lg:hidden w-full space-y-5">
            <Button
              color="primary"
              onClick={() => navigate('/transaction/income/select')}
              className="h-12"
            >
              Receita
            </Button>
            <Button
              color="primary"
              onClick={() => navigate('/transaction/expense/select')}
              className="h-12"
            >
              Despesa
            </Button>
            <Button
              color="primary"
              onClick={() => navigate('/transaction/refund/select')}
              className="h-12"
            >
              Reembolso
            </Button>
            <Button
              color="primary"
              onClick={() => navigate('/transaction/loan/select')}
              className="h-12"
            >
              Empréstimo
            </Button>
          </div>

          <div className="lg:flex gap-8 hidden w-full">
            <div className="flex flex-col w-full items-center space-y-8">
              <Button
                color="primary"
                onClick={() => navigate('/transaction/income/select')}
                className="h-12"
              >
                Receita
              </Button>
              <Button
                color="primary"
                onClick={() => navigate('/transaction/refund/select')}
                className="h-12"
              >
                Reembolso
              </Button>
            </div>
            <div className="flex flex-col w-full items-center space-y-8">
              <Button
                color="primary"
                onClick={() => navigate('/transaction/expense/select')}
                className="h-12"
              >
                Despesa
              </Button>
              <Button
                color="primary"
                onClick={() => navigate('/transaction/loan/select')}
                className="h-12"
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
