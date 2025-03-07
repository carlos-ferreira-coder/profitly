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
        const query = new URLSearchParams({
          admin: String(admin),
          project: String(project),
          personal: String(personal),
          financial: String(financial),
        }).toString()

        await axios.get(`/auth/check?${query}`, {
          withCredentials: true,
        })
      } catch (error) {
        navigate('/login', { state: { warnings: handleAxiosError(error) } })
      }
    }

    checkAuth()
  }, [navigate, admin, project, personal, financial])

  return <>{children}</>
}

export default AuthGuard
