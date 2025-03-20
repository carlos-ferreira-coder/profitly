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
          <div className="flex flex-col gap-6">
            <Button color="primary" onClick={() => navigate('/transaction/income/select')}>
              Receita
            </Button>
            <Button color="primary" onClick={() => navigate('/transaction/expense/select')}>
              Despesa
            </Button>
            <Button color="primary" onClick={() => navigate('/transaction/refund/select')}>
              Reembolso
            </Button>
            <Button color="primary" onClick={() => navigate('/transaction/loan/select')}>
              Empréstimo
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Transaction
