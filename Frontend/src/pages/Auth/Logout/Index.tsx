import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from '../../../components/Alert/Index'
import { api as axios, handleAxiosError } from '../../../services/Axios'
import Loader from '../../../components/Loader'
import { useUser } from '../../../context/UserContext'
import { useAuth } from '../../../context/AuthContext'

const Logout = () => {
  const navigate = useNavigate()
  const { setUser } = useUser()
  const { setAuth } = useAuth()
  const [alertErrors, setAlertErrors] = useState<(string | JSX.Element)[] | null>(null)

  // logout on backend
  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await axios.get('/auth/logout', {
          withCredentials: true,
        })

        setUser(null)
        setAuth(null)

        sessionStorage.setItem('successes', data.message)

        navigate('/login')
      } catch (error) {
        setAlertErrors([handleAxiosError(error)])
      }
    })()
  }, [navigate, setUser, setAuth])

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
