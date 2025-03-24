import { Link, useLocation } from 'react-router-dom'
import { AuthProps } from '../../types/Database'
import { getPagesByUseIn, PageProps } from '../../PagesConfig'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const NavigateHeader = ({ auth }: { auth: AuthProps }) => {
  const location = useLocation()

  return getPagesByUseIn('Navigate', auth).map((page: PageProps) => (
    <div
      key={`${page.route}`}
      className={`h-full px-2 ${
        location.pathname === page.route
          ? 'border-b-2 border-primary text-primary dark:border-primary-50 dark:text-primary-50'
          : 'scale-95 hover:scale-100 hover:border-b-2 border-blue-200 hover:text-blue-200 dark:border-white dark:text-white dark:hover:border-blue-200 dark:hover:text-blue-200'
      }`}
    >
      <Link to={`${page.route}`} className="flex items-center h-full">
        <FontAwesomeIcon icon={page.icon} className="h-5 w-5 mr-2" />
        {page.title}
      </Link>
    </div>
  ))
}

export default NavigateHeader
