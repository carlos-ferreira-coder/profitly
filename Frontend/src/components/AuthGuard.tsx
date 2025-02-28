import { useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { api as axios, handleAxiosError } from '../services/Axios'

type AuthGuardProps = {
  children: ReactNode
  admin: boolean
  project: boolean
  personal: boolean
  financial: boolean
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, admin, project, personal, financial }) => {
  const navigate = useNavigate()

  // TODO retificar acesso inrestrito

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const query = `admin=${admin}&project=${project}&personal=${personal}&financial=${financial}`

        await axios.get(`/auth/check?${query}`, {
          withCredentials: true,
        })
      } catch (error) {
        const errorMessage = handleAxiosError(error)
        navigate('/auth/login', { state: { warnings: errorMessage } })
      }
    }

    checkAuth()
  }, [navigate, admin, project, personal, financial])

  return <>{children}</>
}

export default AuthGuard
