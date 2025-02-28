import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from '../../../components/Alert/Index'
import { api as axios, handleAxiosError } from '../../../services/Axios'
import Loader from '../../../components/Loader'

const Logout = () => {
  const navigate = useNavigate()
  const [alertErrors, setAlertErrors] = useState<(string | JSX.Element)[] | null>(null)

  // logout on backend
  useEffect(() => {
    const logout = async () => {
      try {
        const { data } = await axios.get('/auth/logout', {
          withCredentials: true,
        })
        navigate('/auth/login', { state: { logged: false, successes: [data.message] } })
      } catch (error) {
        setAlertErrors([handleAxiosError(error)])
      }
    }

    logout()
  }, [navigate])

  return (
    <div className="mx-auto max-w-150">
      <div className="rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">Deslogar</h3>
        </div>
        <div className="p-7">
          {alertErrors && <Alert type="danger" size="lg" data={alertErrors} />}
          <Loader />
        </div>
      </div>
    </div>
  )
}

export default Logout
