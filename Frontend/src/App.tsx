import { Routes, Route } from 'react-router-dom'
import { pages, PageProps } from './PagesConfig'
import DefaultLayout from './layout/DefaultLayout'
import PageTitle from './components/PageTitle'
import AuthGuard from './hooks/useAuthGuard'
import { UserProvider } from './context/UserContext'
import { AuthProvider } from './context/AuthContext'

const App = () => {
  return (
    <UserProvider>
      <AuthProvider>
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
      </AuthProvider>
    </UserProvider>
  )
}

export default App
