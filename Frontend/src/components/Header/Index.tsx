import DropdownNavigate from './DropdownNavigate'
import DropdownUser from './DropdownUser'
import DarkModeSwitcher from './DarkModeSwitcher'
import NavigateHeader from './NavigateHeader'
import { useUser } from '../../context/UserContext'
import { useAuth } from '../../context/AuthContext'

const Header = () => {
  const { user } = useUser()
  const { auth } = useAuth()

  return (
    <header className="sticky top-0 z-999 flex w-full bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
      <div className="flex flex-grow items-center justify-between px-2.5 shadow-2 md:px-4">
        <div className="left-0 mt-2.5 mb-2.5">{auth && <DropdownNavigate auth={auth} />}</div>

        <div className="hidden h-full lg:flex lg:items-center lg:justify-between lg:gap-3 xl:gap-5">
          {user && auth && <NavigateHeader auth={auth} />}
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
