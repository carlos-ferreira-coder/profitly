import Breadcrumb from '../../../components/Breadcrumb'
import { useEffect, useState } from 'react'
import { UserProps, AuthProps } from '../../../types/Database'
import { api as axios, handleAxiosError } from '../../../services/Axios'
import { useParams } from 'react-router-dom'
import FormUser from './FormUser'
import FormPhoto from './FormPhoto'
import FormPassword from './FormPassword'
import Loader from '../../../components/Loader'
import Alert from '../../../components/Alert/Index'
import { Options } from '../../../components/Form/Select'

const Update = () => {
  const { uuid } = useParams()
  const [auth, setAuth] = useState<AuthProps | null>(null)
  const [user, setUser] = useState<UserProps | null>(null)
  const [authOptions, setAuthOptions] = useState<Options[] | null>(null)
  const [alertErrors, setAlertErrors] = useState<(string | JSX.Element)[] | null>(null)

  // Get user
  useEffect(() => {
    ;(async () => {
      try {
        const {
          data: { 0: resUser },
        } = await axios.get(`user/select/${uuid}`, {
          withCredentials: true,
        })
        setUser(resUser)
      } catch (error) {
        setAlertErrors([handleAxiosError(error)])
      }
    })()
  }, [uuid])

  // Get auths
  useEffect(() => {
    ;(async () => {
      try {
        const [
          {
            data: [resAuth],
          },
          { data: resAuths },
        ] = await Promise.all([
          axios.get('/auth/select/this', { withCredentials: true }),
          axios.get('/auth/select/all', { withCredentials: true }),
        ])

        // Configure options
        const options: Options[] = [
          ...resAuths.map((auth: AuthProps) => ({
            value: auth.uuid,
            label: auth.name,
            disabled: false,
          })),
        ]

        setAuth(resAuth)
        setAuthOptions(options)
      } catch (error) {
        setAlertErrors([handleAxiosError(error)])
      }
    })()
  }, [])

  return (
    <div className="mx-auto max-w-270">
      <Breadcrumb pageName="Configurações" />

      <div className="grid grid-cols-5 gap-8">
        <div className="col-span-5 xl:col-span-2">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">Foto</h3>
            </div>
            {user ? (
              <div className="p-7">
                <FormPhoto user={user} />
              </div>
            ) : (
              <Loader />
            )}
          </div>

          <div className="mt-8 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">Alterar Senha</h3>
            </div>
            {user && auth ? (
              <div className="p-7">
                <FormPassword user={user} auth={auth.personal} />
              </div>
            ) : (
              <Loader />
            )}
          </div>
        </div>

        <div className="col-span-5 xl:col-span-3">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">Informações Pessoais</h3>
            </div>
            {alertErrors && <Alert type="danger" size="lg" data={alertErrors} />}

            {user && authOptions ? (
              <div className="p-7">
                <FormUser user={user} authOptions={authOptions} />
              </div>
            ) : (
              <Loader />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Update
