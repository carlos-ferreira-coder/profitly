import { useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { useAuth } from '../context/AuthContext'
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
  const { user, setUser } = useUser()
  const { setAuth } = useAuth()

  useEffect(() => {
    ;(async () => {
      try {
        const query = new URLSearchParams(
          Object.entries(permissions).map(([key, value]) => [key, String(value)])
        ).toString()

        await axios.get(`/auth/check?${query}`, {
          withCredentials: true,
        })

        if (!user) {
          const [thisUser, thisAuth] = await Promise.all([
            axios.get('/user/select/this', { withCredentials: true }),
            axios.get('/auth/select/this', { withCredentials: true }),
          ])

          setUser(thisUser.data[0])
          setAuth(thisAuth.data[0])

          console.log(user)
        }
      } catch (error) {
        sessionStorage.setItem('errors', handleAxiosError(error))
        navigate('/login')
      }
    })()
  }, [navigate, permissions, user, setUser, setAuth])

  return <>{children}</>
}

export default AuthGuard
