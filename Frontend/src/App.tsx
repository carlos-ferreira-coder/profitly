import { Routes, Route } from 'react-router-dom'
import { pages, PageProps } from './PagesConfig'
import DefaultLayout from './layout/DefaultLayout'
import PageTitle from './components/PageTitle'
import AuthGuard from './components/AuthGuard'

const App = () => {
  return (
    <DefaultLayout>
      <Routes>
        {pages.map((page: PageProps) => (
          <Route
            key={page.route}
            path={page.route}
            element={
              <>
                <PageTitle title={`Profitly | ${page.title}`} />
                {page.protection.includes('logged') ? (
                  <AuthGuard
                    admin={page.protection.includes('admin')}
                    project={page.protection.includes('project')}
                    personal={page.protection.includes('personal')}
                    financial={page.protection.includes('financial')}
                  >
                    <page.component />
                  </AuthGuard>
                ) : (
                  <page.component />
                )}
              </>
            }
          />
        ))}
      </Routes>
    </DefaultLayout>
  )
}

export default App
