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

const AuthGuard: React.FC<AuthGuardProps> = ({ children, ...permissions }) => {
  const navigate = useNavigate()

  useEffect(() => {
    ;(async () => {
      try {
        const query = new URLSearchParams(
          Object.entries(permissions).map(([key, value]) => [key, String(value)])
        ).toString()

        await axios.get(`/auth/check?${query}`, {
          withCredentials: true,
        })
      } catch (error) {
        sessionStorage.setItem('errors', handleAxiosError(error))
        navigate('/login')
      }
    })()
  }, [navigate, permissions])

  return <>{children}</>
}

export default AuthGuard
