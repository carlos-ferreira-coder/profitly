import { useState } from 'react'
import { Pagination } from '../../../hooks/usePagination'
import Button from '../../../components/Form/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { faCircleCheck, faCircleXmark } from '@fortawesome/free-regular-svg-icons'
import { useNavigate } from 'react-router-dom'
import { UserProps } from '../../../types/Database'
import { userPhotoURL } from '../../../services/Axios'

const List = ({ users, auth }: { users: UserProps[]; auth: boolean }) => {
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

      {pageRange.map((key) => (
        <div
          key={users[key].uuid}
          className="grid grid-cols-8 gap-2 my-3 px-3 lg:px-5 py-3 text-sm text-black dark:text-white shadow-1 rounded-md border border-stroke dark:border-strokedark dark:bg-form-input/50"
        >
          <div className="col-span-2 lg:col-span-1 flex items-center justify-center">
            <img
              src={userPhotoURL(users[key].photo)}
              alt={`Usuário ${users[key].uuid}`}
              className="h-12 w-12 rounded-full"
            />
            {users[key].active ? (
              <FontAwesomeIcon icon={faCircleCheck} className="absolute mt-12 ml-12 text-success" />
            ) : (
              <FontAwesomeIcon icon={faCircleXmark} className="absolute mt-12 ml-12 text-danger" />
            )}
          </div>

          <div className="col-span-5 lg:hidden flex flex-col justify-center space-y-1">
            {auth ? (
              <>
                <p>
                  <b>CPF:</b> {users[key].person.cpf}
                </p>
                <p>
                  <b>Nome:</b> {users[key].person.entity.name}
                </p>
              </>
            ) : (
              <p>
                <b>Usuário:</b> {users[key].username}
              </p>
            )}
            <p>
              <b>Email:</b> {users[key].person.entity.email}
            </p>
            <p>
              <b>Cargo / Função:</b> {users[key].auth.name}
            </p>
            {auth ? (
              <>
                {users[key].hourlyRate ? (
                  <p>
                    <b>Valor da Hora:</b> {users[key].hourlyRate}
                  </p>
                ) : null}
                {users[key].person.entity.phone ? (
                  <p>
                    <b>Contato:</b> {users[key].person.entity.phone}
                  </p>
                ) : null}
              </>
            ) : null}
          </div>

          <div className="col-span-3 hidden lg:flex flex-col justify-center space-y-1">
            {auth ? (
              <>
                <p>
                  <b>CPF:</b> {users[key].person.cpf}
                </p>
                <p>
                  <b>Nome:</b> {users[key].person.entity.name}
                </p>
              </>
            ) : (
              <p>
                <b>Usuário:</b> {users[key].username}
              </p>
            )}
            <p>
              <b>Email:</b> {users[key].person.entity.email}
            </p>
          </div>

          <div className="col-span-3 hidden lg:flex flex-col justify-center space-y-1">
            <p>
              <b>Cargo / Função:</b> {users[key].auth.name}
            </p>
            {auth ? (
              <>
                {users[key].hourlyRate ? (
                  <p>
                    <b>Valor da Hora:</b> {users[key].hourlyRate}
                  </p>
                ) : null}
                {users[key].person.entity.phone ? (
                  <p>
                    <b>Contato:</b> {users[key].person.entity.phone}
                  </p>
                ) : null}
              </>
            ) : null}
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
      ))}

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
