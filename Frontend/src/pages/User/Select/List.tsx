import { useState } from 'react'
import { Pagination } from '../../../hooks/usePagination'
import Button from '../../../components/Form/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { faCircleCheck, faCircleXmark } from '@fortawesome/free-regular-svg-icons'
import { useNavigate } from 'react-router-dom'
import { AuthProps, UserProps } from '../../../types/Database'
import { userPhotoURL } from '../../../services/Axios'
import { useAuth } from '../../../context/AuthContext'

const UserInfo = ({ user, auth }: { user: UserProps; auth: AuthProps | null }) => (
  <>
    {auth?.personal && (
      <p>
        <b>CPF: </b> {user.person.cpf}
      </p>
    )}
    <p>
      <b>Nome de usuário: </b> {user.username}
    </p>
    {auth?.personal && (
      <p>
        <b>Nome completo: </b> {user.person.entity.name}
      </p>
    )}
    <p>
      <b>Cargo/Função: </b> {user.auth.name}
    </p>
    {auth?.financial && user.hourlyRate && (
      <p>
        <b>Valor da hora: </b> {user.hourlyRate}
      </p>
    )}
  </>
)

const UserContactInfo = ({ user, auth }: { user: UserProps; auth: AuthProps | null }) => (
  <>
    <p>
      <b>Email: </b> {user.person.entity.email}
    </p>
    {auth?.personal && (
      <>
        {user.person.entity.phone && (
          <p>
            <b>Contato: </b> {user.person.entity.phone}
          </p>
        )}
        {user.person.entity.address && (
          <p>
            <b>Endereço: </b> {user.person.entity.address}
          </p>
        )}
      </>
    )}
  </>
)

const List = ({ users }: { users: UserProps[] }) => {
  const { auth } = useAuth()

  const itemsPerPage = 10
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState<number>(0)

  const start = currentPage * itemsPerPage
  const end = Math.min((currentPage + 1) * itemsPerPage - 1, users.length - 1)
  const pageRange = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  return (
    <>
      <div className="flex justify-end">
        <Button color="success" className="w-50 h-8" onClick={() => navigate('/user/create/')}>
          <FontAwesomeIcon icon={faPlus} className="mr-1" />
          Adicionar Usuário
        </Button>
      </div>

      {pageRange.map((key) => {
        const user = users[key]

        return (
          <div
            key={user.uuid}
            className="grid grid-cols-8 gap-2 my-3 px-3 lg:px-5 py-3 text-sm text-black dark:text-white shadow-1 rounded-md border border-stroke dark:border-strokedark dark:bg-form-input/50"
          >
            <div className="col-span-2 lg:col-span-1 flex items-center justify-center">
              <img
                src={userPhotoURL(user.photo)}
                alt={`Usuário ${user.uuid}`}
                className="h-12 w-12 rounded-full"
              />
              {user.active ? (
                <FontAwesomeIcon
                  icon={faCircleCheck}
                  className="absolute mt-12 ml-12 text-success"
                />
              ) : (
                <FontAwesomeIcon
                  icon={faCircleXmark}
                  className="absolute mt-12 ml-12 text-danger"
                />
              )}
            </div>

            <div className="col-span-5 lg:hidden flex flex-col justify-center space-y-1">
              <UserInfo user={user} auth={auth} />
            </div>

            <div className="col-span-3 hidden lg:flex flex-col justify-center space-y-1">
              <UserInfo user={user} auth={auth} />
            </div>

            <div className="col-span-3 hidden lg:flex flex-col justify-center space-y-1">
              <UserContactInfo user={user} auth={auth} />
            </div>

            <div
              className={`col-span-1 ${
                auth ? 'flex' : 'hidden'
              } flex-col justify-center items-center space-y-2`}
            >
              <Button
                color="primary"
                className="w-8 h-8"
                onClick={() => navigate(`/user/update/${users[key].uuid}`)}
              >
                <FontAwesomeIcon icon={faPenToSquare} />
              </Button>

              <Button
                color="danger"
                className="w-8 h-8"
                onClick={() => navigate(`/user/delete/${users[key].uuid}`)}
              >
                <FontAwesomeIcon icon={faTrashCan} />
              </Button>
            </div>
          </div>
        )
      })}

      <Pagination
        itemsLength={users.length}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </>
  )
}

export default List
