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
import { EntityProps, SupplierProps } from '../../../types/Database'

const SupplierTypeInfo = ({ supplier }: { supplier: SupplierProps }) => (
  <p>
    <b>Tipo: </b> {supplier.enterprise ? 'Empresa' : 'Pessoa'}
  </p>
)

const SupplierEntityInfo = ({
  supplier,
  entity,
}: {
  supplier: SupplierProps
  entity: EntityProps
}) => {
  return (
    <>
      <p>
        <b>Nome: </b>
        {entity.name}
        {supplier.active ? (
          <FontAwesomeIcon icon={faCircleCheck} className="ml-2 text-success" />
        ) : (
          <FontAwesomeIcon icon={faCircleXmark} className="ml-2 text-danger" />
        )}
      </p>
      {supplier.enterprise ? (
        <>
          <p>
            <b>Nome fantasia: </b> {supplier.enterprise?.fantasy}
          </p>
          <p>
            <b>CNPJ: </b> {supplier.enterprise?.fantasy}
          </p>
        </>
      ) : (
        <>
          <p>
            <b>CPF: </b> {supplier.person?.cpf}
          </p>
        </>
      )}
    </>
  )
}

const SupplierContactInfo = ({ entity }: { entity: EntityProps }) => {
  return (
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
}

const List = ({ suppliers }: { suppliers: SupplierProps[] }) => {
  const itemsPerPage = 10
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState<number>(0)
  const start = currentPage * itemsPerPage
  const end = Math.min((currentPage + 1) * itemsPerPage - 1, suppliers.length - 1)
  const pageRange = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  return (
    <>
      <div className="flex justify-end">
        <Button color="success" className="w-50 h-8" onClick={() => navigate('/supplier/create/')}>
          <FontAwesomeIcon icon={faPlus} className="mr-1" /> Adicionar Fornecedor
        </Button>
      </div>

      {pageRange.map((key) => {
        const supplier = suppliers[key]
        const entity = (supplier.enterprise?.entity || supplier.person?.entity)!

        return (
          <div
            key={supplier.uuid}
            className="grid grid-cols-6 lg:grid-cols-7 gap-2 my-3 px-3 lg:px-5 py-3 text-sm text-black dark:text-white shadow-1 rounded-md border border-stroke dark:border-strokedark dark:bg-form-input/50"
          >
            <div className="col-span-5 lg:hidden flex flex-col justify-center space-y-2">
              <SupplierTypeInfo supplier={supplier} />

              <SupplierEntityInfo supplier={supplier} entity={entity} />

              <SupplierContactInfo entity={entity} />
            </div>

            <div className="col-span-1 hidden lg:flex flex-col justify-center space-y-2">
              <SupplierTypeInfo supplier={supplier} />
            </div>

            <div className="col-span-3 hidden lg:flex flex-col justify-center space-y-2">
              <SupplierEntityInfo supplier={supplier} entity={entity} />
            </div>

            <div className="col-span-2 hidden lg:flex flex-col justify-center space-y-2">
              <SupplierContactInfo entity={entity} />
            </div>

            <div className="col-span-1 flex flex-col justify-center items-center space-y-6 lg:space-y-2">
              <Button
                color="primary"
                className="w-8 h-8"
                onClick={() => navigate(`/supplier/update/${supplier.uuid}`)}
              >
                <FontAwesomeIcon icon={faPenToSquare} />
              </Button>

              <Button
                color="danger"
                className="w-8 h-8"
                onClick={() => navigate(`/supplier/delete/${supplier.uuid}`)}
              >
                <FontAwesomeIcon icon={faTrashCan} />
              </Button>
            </div>
          </div>
        )
      })}

      <Pagination
        itemsLength={suppliers.length}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </>
  )
}

export default List
