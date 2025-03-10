import { useState } from 'react'
import { Pagination } from '../../../hooks/usePagination'
import Button from '../../../components/Form/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faAnglesDown,
  faAnglesRight,
  faAnglesUp,
  faPenToSquare,
  faPlus,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import { StatusProps } from '../../../types/Database'

const List = ({ status }: { status: StatusProps[] }) => {
  const itemsPerPage = 8
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState<number>(0)

  const start = currentPage * itemsPerPage
  const end = Math.min((currentPage + 1) * itemsPerPage - 1, status.length - 1)
  const pageRange = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  return (
    <>
      <div className="flex justify-end">
        <Button color="success" className="w-45 h-8" onClick={() => navigate('/status/create/')}>
          <FontAwesomeIcon icon={faPlus} className="mr-1" />
          Adicionar Status
        </Button>
      </div>

      {pageRange.map((key) => (
        <div
          key={status[key].uuid}
          className="grid grid-cols-5 gap-4 lg:grid-cols-8 lg:gap-4 my-3 px-3 lg:px-5 py-3 text-sm text-black dark:text-white shadow-1 rounded-md border border-stroke dark:border-strokedark dark:bg-form-input/50"
        >
          <div className="col-span-2 hidden lg:flex flex-col justify-center">
            <p>
              <b>Status:</b> {status[key].name}
            </p>
          </div>

          <div className="col-span-4 hidden lg:flex flex-col justify-center">
            <p>
              <b>Descrição:</b> {status[key].description}
            </p>
          </div>

          <div className="col-span-4 lg:col-span-1 flex flex-col justify-center lg:items-center space-y-2">
            <p className="lg:hidden">
              <b>Status:</b> {status[key].name}
            </p>
            <p className="lg:hidden">
              <b>Descrição:</b> {status[key].description}
            </p>

            <p>
              <b>Prioridade: </b> {status[key].priority}
            </p>
            <p
              className={`p-1 w-4/6 lg:w-5/6 text-center text-white shadow-1 rounded-md border border-stroke dark:border-strokedark ${
                status[key].priority < 4
                  ? 'bg-danger'
                  : status[key].priority < 8
                  ? 'bg-warning'
                  : 'bg-success'
              }`}
            >
              {status[key].priority < 4 ? (
                <>
                  <FontAwesomeIcon icon={faAnglesUp} className="mr-2" />
                  Alta
                </>
              ) : status[key].priority < 8 ? (
                <>
                  <FontAwesomeIcon icon={faAnglesRight} className="mr-2" />
                  Média
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faAnglesDown} className="mr-2" />
                  Baixa
                </>
              )}
            </p>
          </div>

          <div className="col-span-1 flex flex-col justify-center items-center space-y-2">
            <Button
              color="primary"
              className="w-8 h-8"
              onClick={() => navigate(`/status/update/${status[key].uuid}`)}
            >
              <FontAwesomeIcon icon={faPenToSquare} />
            </Button>

            <Button
              color="danger"
              className="w-8 h-8"
              onClick={() => navigate(`/status/delete/${status[key].uuid}`)}
            >
              <FontAwesomeIcon icon={faTrashCan} />
            </Button>
          </div>
        </div>
      ))}

      <Pagination
        itemsLength={status.length}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </>
  )
}

export default List
