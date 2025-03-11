import { useEffect, useState } from 'react'
import Breadcrumb from '../../../components/Breadcrumb'
import Filter from './Filter'
import List from './List'
import { api as axios, handleAxiosError } from '../../../services/Axios'
import { useLocation } from 'react-router-dom'
import { ClientProps } from '../../../types/Database'
import Alert from '../../../components/Alert/Index'
import Loader from '../../../components/Loader'

const Select = () => {
  const location = useLocation()
  const [clients, setClients] = useState<ClientProps[] | null>(null)
  const [filtering, setFiltering] = useState<'idle' | 'filter' | 'reset'>('idle')
  const [alertErrors, setAlertErrors] = useState<(string | JSX.Element)[] | null>(null)

  // Get Clients
  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await axios.get(`client/select/all${location.search}`, {
          withCredentials: true,
        })

        setClients(data)
      } catch (error) {
        setAlertErrors([handleAxiosError(error)])
      }

      setFiltering('idle')
    })()
  }, [location.search])

  return (
    <>
      <Breadcrumb pageName="Listar Clientes" />

      <div className="border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap items-center">
          {alertErrors && <Alert type="danger" size="lg" data={alertErrors} />}

          {clients ? (
            <>
              <div className="block w-full md:w-2/6 lg:w-3/12 md:border-r-2 border-stroke dark:border-strokedark">
                <div className="p-7">
                  <Filter filtering={filtering} setFiltering={setFiltering} />
                </div>
              </div>

              <div className="block w-full md:w-4/6 lg:w-9/12">
                <div className="p-7">
                  <List clients={clients} />
                </div>
              </div>
            </>
          ) : (
            <Loader />
          )}
        </div>
      </div>
    </>
  )
}

export default Select
