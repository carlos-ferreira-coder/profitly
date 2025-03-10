import DropdownNavigate from './DropdownNavigate'
import DropdownUser from './DropdownUser'
import DarkModeSwitcher from './DarkModeSwitcher'
import { api as axios, handleAxiosError } from '../../services/Axios'
import { useEffect, useState } from 'react'
import { AuthProps, UserProps } from '../../types/Database'
import NavigateHeader from './NavigateHeader'

const Header = () => {
  const [user, setUser] = useState<UserProps | null>(null)
  const [auth, setAuth] = useState<AuthProps | null>(null)
  const [errors, setErrors] = useState<string[] | null>(null)
  const [isLogged, setIsLogged] = useState<boolean>(sessionStorage.getItem('logged') === 'true')

  window.addEventListener('isLogged', () => {
    setIsLogged(window.localStorage.getItem('isLogged') === 'true')
  })

  useEffect(() => {
    ;(async () => {
      try {
        // TODO retificar
        if (isLogged) {
          const [thisUser, thisAuth] = await Promise.all([
            axios.get('/user/select/this', { withCredentials: true }),
            axios.get('/auth/select/this', { withCredentials: true }),
          ])

          setUser(thisUser.data[0])
          setAuth(thisAuth.data[0])
        } else {
          setUser(null)
          setAuth(null)
        }
      } catch (error) {
        setUser(null)
        setAuth(null)
        setErrors([handleAxiosError(error)])
      }
    })()
  }, [isLogged])

  return (
    <header className="sticky top-0 z-999 flex w-full bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
      <div className="flex flex-grow items-center justify-between px-2.5 shadow-2 md:px-4">
        <div className="left-0 mt-2.5 mb-2.5">{auth && <DropdownNavigate auth={auth} />}</div>

        <div className="hidden h-full md:flex md:items-center md:justify-between md:gap-1.5 lg:gap-3 xl:gap-5">
          {auth && user ? <NavigateHeader auth={auth}></NavigateHeader> : errors}
        </div>

        <div className="flex items-center gap-3 2xsm:gap-5 mt-2.5 mb-2.5">
          <ul className="flex items-center gap-2 2xsm:gap-4">
            <DarkModeSwitcher />
          </ul>
          {user && auth && <DropdownUser user={user} auth={auth} />}
        </div>
      </div>
    </header>
  )
}

export default Header
