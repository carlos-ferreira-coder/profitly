import { useState } from 'react'
import { Pagination } from '../../../hooks/usePagination'
import Button from '../../../components/Form/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleCheck,
  faCircleXmark,
  faPenToSquare,
  faPlus,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import { ClientProps, EntityProps } from '../../../types/Database'

const ClientTypeInfo = ({ client }: { client: ClientProps }) => (
  <p>
    <b>Tipo: </b> {client.enterprise ? 'Empresa' : 'Pessoa'}
  </p>
)

const ClientEntityInfo = ({ client, entity }: { client: ClientProps; entity: EntityProps }) => (
  <>
    <p>
      <b>Nome: </b>
      {entity.name}
      {client.active ? (
        <FontAwesomeIcon icon={faCircleCheck} className="ml-2 text-success" />
      ) : (
        <FontAwesomeIcon icon={faCircleXmark} className="ml-2 text-danger" />
      )}
    </p>
    {client.enterprise ? (
      <>
        <p>
          <b>Nome fantasia: </b> {client.enterprise?.fantasy}
        </p>
        <p>
          <b>CNPJ: </b> {client.enterprise?.fantasy}
        </p>
      </>
    ) : (
      <>
        <p>
          <b>CPF: </b> {client.person?.cpf}
        </p>
      </>
    )}
  </>
)

const ClientContactInfo = ({ entity }: { entity: EntityProps }) => (
  <>
    <p>
      <b>Email: </b> {entity.email}
    </p>
    {entity.phone && (
      <p>
        <b>Contato: </b> {entity.phone}
      </p>
    )}
    {entity.address && (
      <p>
        <b>Endereço: </b> {entity.address}
      </p>
    )}
  </>
)

const List = ({ clients }: { clients: ClientProps[] }) => {
  const itemsPerPage = 10
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState<number>(0)
  const start = currentPage * itemsPerPage
  const end = Math.min((currentPage + 1) * itemsPerPage - 1, clients.length - 1)
  const pageRange = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  return (
    <>
      <div className="flex justify-end">
        <Button color="success" className="w-50 h-8" onClick={() => navigate('/client/create/')}>
          <FontAwesomeIcon icon={faPlus} className="mr-1" /> Adicionar Cliente
        </Button>
      </div>

      {pageRange.map((key) => {
        const client = clients[key]
        const entity = (client.enterprise?.entity || client.person?.entity)!

        return (
          <div
            key={client.uuid}
            className="grid grid-cols-6 lg:grid-cols-7 gap-2 my-3 px-3 lg:px-5 py-3 text-sm text-black dark:text-white shadow-1 rounded-md border border-stroke dark:border-strokedark dark:bg-form-input/50"
          >
            <div className="col-span-5 lg:hidden flex flex-col justify-center space-y-2">
              <ClientTypeInfo client={client} />

              <ClientEntityInfo client={client} entity={entity} />

              <ClientContactInfo entity={entity} />
            </div>

            <div className="col-span-1 hidden lg:flex flex-col justify-center space-y-2">
              <ClientTypeInfo client={client} />
            </div>

            <div className="col-span-3 hidden lg:flex flex-col justify-center space-y-2">
              <ClientEntityInfo client={client} entity={entity} />
            </div>

            <div className="col-span-2 hidden lg:flex flex-col justify-center space-y-2">
              <ClientContactInfo entity={entity} />
            </div>

            <div className="col-span-1 flex flex-col justify-center items-center space-y-6 lg:space-y-2">
              <Button
                color="primary"
                className="w-8 h-8"
                onClick={() => navigate(`/client/update/${client.uuid}`)}
              >
                <FontAwesomeIcon icon={faPenToSquare} />
              </Button>

              <Button
                color="danger"
                className="w-8 h-8"
                onClick={() => navigate(`/client/delete/${client.uuid}`)}
              >
                <FontAwesomeIcon icon={faTrashCan} />
              </Button>
            </div>
          </div>
        )
      })}

      <Pagination
        itemsLength={clients.length}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </>
  )
}

export default List
