import { useParams } from 'react-router-dom'
import Breadcrumb from '../../../components/Breadcrumb'
import Form from './Form'
import { useEffect, useState } from 'react'
import { api as axios, handleAxiosError } from '../../../services/Axios'
import Alert from '../../../components/Alert/Index'
import Loader from '../../../components/Loader'
import { TaskActivityProps, TaskExpenseProps } from '../../../types/Database'

const Tasks = () => {
  const { uuid } = useParams()
  const [tasks, setTasks] = useState<(TaskExpenseProps | TaskActivityProps)[] | null>(null)
  const [alertErrors, setAlertErrors] = useState<(string | JSX.Element)[] | null>(null)

  // Get tasks
  useEffect(() => {
    ;(async () => {
      try {
        const [{ data: resTaskExpenses }, { data: resTaskActivity }] = await Promise.all([
          axios.get(`task/expense/select/all?projectUuid=${uuid}`, { withCredentials: true }),
          axios.get(`task/activity/select/all?projectUuid=${uuid}`, { withCredentials: true }),
        ])

        setTasks([...resTaskExpenses, ...resTaskActivity])
      } catch (error) {
        setAlertErrors([handleAxiosError(error)])
      }
    })()
  }, [uuid])

  return (
    <>
      <Breadcrumb pageName="Tarefas" />

      <div className="border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap items-center">
          <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
            {alertErrors && <Alert type="danger" size="lg" data={alertErrors} />}

            {tasks ? (
              <>
                <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
                  Tarefas
                </h2>

                <Form tasks={tasks} projectUuid={uuid || ''} />
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

export default Tasks
