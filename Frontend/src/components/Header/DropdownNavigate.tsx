import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faBarsStaggered } from '@fortawesome/free-solid-svg-icons'
import { getPagesByUseIn, PageProps } from '../../PagesConfig'
import ClickOutside from '../ClickOutside'
import LogoIcon from '../../images/logo/logo.png'
import LogoIconDark from '../../images/logo/logo-dark.png'
import { AuthProps } from '../../types/Database'

const DropdownNavigate = ({ auth }: { auth: AuthProps }) => {
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <div className="hidden lg:block">
        <Link to="#" onClick={() => setDropdownOpen(!dropdownOpen)}>
          <img src={LogoIcon} alt="Logo" className="w-12 h-12 block dark:hidden" />
          <img src={LogoIconDark} alt="Logo" className="w-12 h-12 hidden dark:block" />
        </Link>
      </div>
      <div className="block md:hidden">
        <Link
          to="#"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="relative flex h-8.5 w-8.5 items-center justify-center rounded-md border-[0.5px] border-stroke bg-gray hover:text-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
        >
          <FontAwesomeIcon icon={dropdownOpen ? faBarsStaggered : faBars} />
        </Link>
      </div>

      {auth && dropdownOpen && (
        <div
          className={`absolute left-0 mt-4.5 flex w-62.5 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark`}
        >
          <ul className="flex flex-col gap-5 border-b border-stroke px-6 py-7.5 dark:border-strokedark">
            {getPagesByUseIn('Navigate', auth).map((page: PageProps) => (
              <li key={`${page.route}`}>
                <Link
                  to={page.route}
                  className={`flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out ${
                    location.pathname === page.route
                      ? 'text-primary dark:text-primary'
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

export default DropdownNavigate
