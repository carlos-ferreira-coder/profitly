import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons'
import { getPagesByUseIn, PageProps } from '../../PagesConfig'
import ClickOutside from '../ClickOutside'
import { userPhotoURL } from '../../services/Axios'
import { UserProps } from '../../types/Database'
import { AuthProps } from '../../types/Database'
import Button from '../Form/Button'

const DropdownUser = ({ user, auth }: { user: UserProps; auth: AuthProps }) => {
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false)

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <Button
        color="none"
        base="none"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-3"
      >
        <span className="hidden text-right lg:block">
          <span className="block text-sm font-medium text-black dark:text-white">
            {user?.username}
          </span>
          <span className="block text-xs">{user?.auth.name}</span>
        </span>

        <span className="h-12 w-12 rounded-full">
          <img
            src={userPhotoURL(user?.photo)}
            alt="User"
            className="h-12 w-12 rounded-full object-cover"
          />
        </span>

        <FontAwesomeIcon
          icon={dropdownOpen ? faAngleUp : faAngleDown}
          className="dark:text-white"
        />
      </Button>

      {dropdownOpen && user && auth && (
        <div
          className={`absolute right-0 mt-2.5 flex w-62.5 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark`}
        >
          <ul className="flex flex-col gap-6 border-b border-stroke p-6 dark:border-strokedark">
            {getPagesByUseIn('Settings', auth).map((page: PageProps) => (
              <li key={`${page.route}`}>
                <Link
                  to={page.route.replace(':uuid', user.uuid)}
                  className={`flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out ${
                    location.pathname === page.route.replace(':uuid', user.uuid)
                      ? 'text-primary dark:text-blue-500'
                      : 'dark:text-white hover:text-primary-50 dark:hover:text-primary-50'
                  }`}
                >
                  <FontAwesomeIcon icon={page.icon} className="w-6" />
                  {page.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </ClickOutside>
  )
}

export default DropdownUser
