import { useNavigate } from 'react-router-dom'
import Breadcrumb from '../../components/Breadcrumb'
import Button from '../../components/Form/Button'

const Transaction = () => {
  const navigate = useNavigate()

  return (
    <>
      <Breadcrumb pageName="Transações" />

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap items-center p-8">
          <div className="flex justify-between gap-8 w-full">
            <Button color="primary" onClick={() => navigate('/income/select')}>
              Receita
            </Button>
            <Button color="primary" onClick={() => navigate('/expense/select')}>
              Despesa
            </Button>
          </div>
          <div className="flex justify-between gap-8 w-full">
            <Button color="primary" onClick={() => navigate('/refund/select')}>
              Reembolso
            </Button>
            <Button color="primary" onClick={() => navigate('/loan/select')}>
              Empréstimo
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Transaction
