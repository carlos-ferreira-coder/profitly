import { useState } from 'react'
import { Pagination } from '../../../hooks/usePagination'
import Button from '../../../components/Form/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import { AuthProps } from '../../../types/Database'

const AuthInfo1 = ({ auth }: { auth: AuthProps }) => (
  <>
    <p>
      <b>Administração: </b> {auth.admin === true ? 'sim' : 'não'}
    </p>
    <p>
      <b>Editar Projetos: </b> {auth.project === true ? 'sim' : 'não'}
    </p>
  </>
)

const AuthInfo2 = ({ auth }: { auth: AuthProps }) => (
  <>
    <p>
      <b>Informações pessoais: </b> {auth.personal === true ? 'sim' : 'não'}
    </p>
    <p>
      <b>Informações financeiras: </b> {auth.financial === true ? 'sim' : 'não'}
    </p>
  </>
)

const List = ({ auths }: { auths: AuthProps[] }) => {
  const itemsPerPage = 8
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState<number>(0)

  const start = currentPage * itemsPerPage
  const end = Math.min((currentPage + 1) * itemsPerPage - 1, auths.length - 1)
  const pageRange = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  return (
    <>
      <div className="flex justify-end">
        <Button color="success" className="w-60 h-8" onClick={() => navigate('/auth/create/')}>
          <FontAwesomeIcon icon={faPlus} className="mr-1" />
          Adicionar Cargo / Função
        </Button>
      </div>

      {auths.length &&
        pageRange.map((key) => {
          const auth = auths[key]

          return (
            <div
              key={auth.uuid}
              className="grid grid-cols-4 gap-4 my-3 px-3 lg:px-5 py-3 text-sm text-black dark:text-white shadow-1 rounded-md border border-stroke dark:border-strokedark dark:bg-form-input/50"
            >
              <div className="col-span-1 flex flex-col justify-center space-y-1">
                <b>{auth.name}: </b>
              </div>

              <div className="col-span-2 lg:hidden flex flex-col justify-center space-y-1">
                <AuthInfo1 auth={auth} />
                <AuthInfo2 auth={auth} />
              </div>

              <div className="col-span-1 hidden lg:flex flex-col justify-center space-y-1">
                <AuthInfo1 auth={auth} />
              </div>
              <div className="col-span-1 hidden lg:flex flex-col justify-center space-y-1">
                <AuthInfo2 auth={auth} />
              </div>

              <div className="col-span-1 flex flex-col justify-center items-center space-y-2">
                <Button
                  color="primary"
                  className="w-8 h-8"
                  onClick={() => navigate(`/auth/update/${auths[key].uuid}`)}
                >
                  <FontAwesomeIcon icon={faPenToSquare} />
                </Button>

                <Button
                  color="danger"
                  className="w-8 h-8"
                  onClick={() => navigate(`/auth/delete/${auths[key].uuid}`)}
                >
                  <FontAwesomeIcon icon={faTrashCan} />
                </Button>
              </div>
            </div>
          )
        })}

      <Pagination
        itemsLength={auths.length}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </>
  )
}

export default List
