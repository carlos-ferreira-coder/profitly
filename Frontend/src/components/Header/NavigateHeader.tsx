import { Link } from 'react-router-dom'
import { AuthProps } from '../../types/Database'
import { getPagesByUseIn, PageProps } from '../../PagesConfig'

const NavigateHeader = ({ auth }: { auth: AuthProps }) => {
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
        {page.title}
      </Link>
    </div>
  ))
}

export default NavigateHeader
