import { useParams } from 'react-router-dom'
import Breadcrumb from '../../../components/Breadcrumb'
import Form from './Form'
import { useEffect, useState } from 'react'
import { api as axios, handleAxiosError } from '../../../services/Axios'
import Alert from '../../../components/Alert/Index'
import Loader from '../../../components/Loader'
import { BudgetProps } from '../../../types/Database'

const Budget = () => {
  const { uuid } = useParams()
  const [budget, setBudget] = useState<BudgetProps | null>(null)
  const [alertErrors, setAlertErrors] = useState<(string | JSX.Element)[] | null>(null)

  // Get budget
  useEffect(() => {
    ;(async () => {
      try {
        const {
          data: { 0: resBudget },
        } = await axios.get(`budget/select/${uuid}`, {
          withCredentials: true,
        })

        setBudget(resBudget)
      } catch (error) {
        setAlertErrors([handleAxiosError(error)])
      }
    })()
  }, [uuid])

  return (
    <>
      <Breadcrumb pageName="Orçamento" />

      <div className="border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap items-center">
          <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
            {alertErrors && <Alert type="danger" size="lg" data={alertErrors} />}

            {budget ? (
              <>
                <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
                  Orçamento / {budget.project.name}
                </h2>

                <Form budget={budget} />
              </>
            ) : (
              <Loader />
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Budget
