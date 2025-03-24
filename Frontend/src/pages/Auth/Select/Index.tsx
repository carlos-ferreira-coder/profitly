import { useLocation } from 'react-router-dom'
import Breadcrumb from '../../../components/Breadcrumb'
import Filter from './Filter'
import List from './List'
import { useEffect, useState } from 'react'
import { AuthProps } from '../../../types/Database'
import { api as axios, handleAxiosError } from '../../../services/Axios'
import Alert from '../../../components/Alert/Index'
import Loader from '../../../components/Loader'

const Select = () => {
  const location = useLocation()
  const [filtering, setFiltering] = useState<'idle' | 'filter' | 'reset'>('idle')
  const [auths, setAuths] = useState<AuthProps[] | null>(null)
  const [alertErrors, setAlertErrors] = useState<(string | JSX.Element)[]>([])

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await axios.get(`/auth/select/all${location.search}`, {
          withCredentials: true,
        })

        setAuths(data)
      } catch (error) {
        setAlertErrors((prevErrors) => [...prevErrors, handleAxiosError(error)])
      }

      setFiltering('idle')
    })()
  }, [location.search])

  return (
    <>
      <Breadcrumb pageName="Listar Cargos|Funções" />

      <div className="border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap items-center">
          {auths ? (
            <>
              {alertErrors.length > 0 && <Alert type="danger" size="lg" data={alertErrors} />}

              <div className="block w-full md:w-2/6 lg:w-3/12 md:border-r-2 border-stroke dark:border-strokedark">
                <div className="p-7">
                  <Filter filtering={filtering} setFiltering={setFiltering} />
                </div>
              </div>

              <div className="block w-full md:w-4/6 lg:w-9/12">
                <div className="p-7">
                  <List auths={auths} />
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
