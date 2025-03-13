import { useEffect, useState } from 'react'
import { Input } from '../../components/Form/Input'
import { UserProps } from '../../types/Database'
import { api as axios, handleAxiosError, userPhotoURL } from '../../services/Axios'
import Alert from '../../components/Alert/Index'
import Loader from '../../components/Loader'
import Button from '../../components/Form/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleRight, faXmark } from '@fortawesome/free-solid-svg-icons'

const UserInfo = ({ user }: { user: UserProps }) => (
  <>
    <div className="col-span-2 flex flex-col justify-center items-center">
      <img
        src={userPhotoURL(user.photo)}
        alt="User"
        className="h-12 w-12 rounded-full object-cover"
      />
    </div>

    <div className="col-span-6 flex flex-col justify-center space-y-1">
      <p>
        <b>Usuário: </b> {user.username}
      </p>
      <p>
        <b>Email: </b> {user.person.entity.email}
      </p>
    </div>
  </>
)

const UserSearch = ({
  user,
  setUser,
}: {
  user: UserProps | null
  setUser: (value: UserProps | null) => void
}) => {
  const [search, setSearch] = useState<string | null>('')
  const [users, setUsers] = useState<UserProps[] | null>(null)
  const [alertErrors, setAlertErrors] = useState<(string | JSX.Element)[] | null>(null)

  // Get users
  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await axios.get('user/select/all', {
          withCredentials: true,
        })

        setUsers(data)
      } catch (error) {
        setAlertErrors([handleAxiosError(error)])
      }
    })()
  }, [])

  useEffect(() => {
    if (!user) setSearch('')
  }, [user])

  return (
    <>
      {user ? (
        <div className="grid grid-cols-9 gap-1 p-3 text-sm text-black dark:text-white shadow-1 rounded-md border border-stroke dark:border-strokedark dark:bg-form-input/50">
          <UserInfo user={user} />

          <div className="col-span-1 flex flex-col justify-center items-center">
            <Button
              color="danger"
              type="button"
              className="w-8 h-8"
              onClick={() => {
                setUser(null)
                setSearch('')
              }}
            >
              <FontAwesomeIcon icon={faXmark} />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col p-3 text-sm text-black dark:text-white shadow-1 rounded-md border border-stroke dark:border-strokedark dark:bg-form-input/50">
          {alertErrors && <Alert type="danger" size="lg" data={alertErrors} />}

          <Input
            placeholder="Buscar..."
            value={search || ''}
            onChange={(e) => setSearch(e.target.value)}
          />

          {users ? (
            search === '' ? (
              <Button
                color="primary"
                type="button"
                className="mt-2"
                onClick={() => setSearch(null)}
              >
                Mostrar todos
              </Button>
            ) : (
              (search
                ? users.filter(
                    (user) =>
                      user.username.includes(search) || user.person.entity.email.includes(search)
                  )
                : users
              ).map((user) => (
                <div
                  key={user.uuid}
                  className="grid grid-cols-9 mt-2 w-full gap-1 p-3 shadow-1 rounded-md border border-stroke dark:border-strokedark dark:bg-form-input/50"
                >
                  <UserInfo user={user} />

                  <div className="col-span-1 flex flex-col justify-center items-center">
                    <Button
                      color="primary"
                      type="button"
                      className="w-8 h-8"
                      onClick={() => setUser(user)}
                    >
                      <FontAwesomeIcon icon={faAngleRight} />
                    </Button>
                  </div>
                </div>
              ))
            )
          ) : (
            <Loader />
          )}
        </div>
      )}
    </>
  )
}

export default UserSearch
