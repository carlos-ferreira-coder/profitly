import Button from '../../../../components/Form/Button'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { Input } from '../../../../components/Form/Input'
import { useEffect, useState } from 'react'
import { UserProps, ProjectProps, SupplierProps } from '../../../../types/Database'
import UserSearch from '../../../../hooks/search/useSearchUser'
import ProjectSearch from '../../../../hooks/search/useSearchProject'
import SupplierSearch from '../../../../hooks/search/useSearchSupplier'

const Filter = ({
  filtering,
  setFiltering,
}: {
  filtering: 'idle' | 'filter' | 'reset'
  setFiltering: (value: 'idle' | 'filter' | 'reset') => void
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState<UserProps | null>(null)
  const [project, setProject] = useState<ProjectProps | null>(null)
  const [supplier, setSupplier] = useState<SupplierProps | null>(null)

  // Filter props
  type FilterProps = {
    name: string
    description: string
    registerMin: string
    registerMax: string
    dateMin: string
    dateMax: string
    amountMin: string
    amountMax: string
    userUuid: string
    projectUuid: string
    supplierUuid: string
  }

  const defaultValues = {
    name: '',
    description: '',
    registerMin: '',
    registerMax: '',
    dateMin: '',
    dateMax: '',
    amountMin: '',
    amountMax: '',
    userUuid: '',
    projectUuid: '',
    supplierUuid: '',
  }

  // Hookform
  const { reset, register, setValue, handleSubmit } = useForm<FilterProps>({
    defaultValues: defaultValues,
  })

  useEffect(() => {
    setValue('userUuid', user ? user.uuid : '')
  }, [user, setValue])

  useEffect(() => {
    setValue('projectUuid', project ? project.uuid : '')
  }, [project, setValue])

  useEffect(() => {
    setValue('supplierUuid', supplier ? supplier.uuid : '')
  }, [supplier, setValue])

  // Handle reset
  const handleReset = () => {
    if (location.search) {
      setUser(null)
      setProject(null)
      setSupplier(null)

      reset(defaultValues)

      navigate('/expense/select')
    }
  }

  // Pass filter on url
  const filter = (data: FilterProps) => {
    setFiltering('filter')
    let urlQuery = ''

    // Function to add query in url
    const appendQuery = (key: string, value: string) => {
      const encodeKey = encodeURIComponent(key)
      const encodeValue = encodeURIComponent(value)

      if (urlQuery === '') {
        return `?${encodeKey}=${encodeValue}`
      }
      return `${urlQuery}&${encodeKey}=${encodeValue}`
    }

    // Get all filters
    ;(Object.keys(data) as Array<keyof FilterProps>).forEach((key) => {
      const value = data[key]

      if (typeof value === 'string') {
        if (value !== '') urlQuery = appendQuery(key, value)
      }
    })

    if (location.search === urlQuery) {
      setFiltering('idle')
    } else {
      navigate(`/expense/select${urlQuery}`)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(filter)}>
        <div className="mb-5.5">
          <label
            htmlFor="name"
            className="mb-3 block text-sm font-medium text-black dark:text-white"
          >
            Nome
          </label>
          <div className="relative">
            <Input id="name" type="text" {...register('name')} placeholder="Digite o nome" />
          </div>
        </div>

        <div className="mb-5.5">
          <label
            htmlFor="description"
            className="mb-3 block text-sm font-medium text-black dark:text-white"
          >
            Descrição
          </label>
          <div className="relative">
            <Input
              id="description"
              type="text"
              {...register('description')}
              placeholder="Digite a descrição"
            />
          </div>
        </div>

        <div className="mb-5.5">
          <label
            htmlFor="registerMin"
            className="mb-3 block text-sm font-medium text-black dark:text-white"
          >
            Data minima do registro
          </label>
          <div className="relative">
            <Input
              id="registerMin"
              type="text"
              {...register('registerMin')}
              placeholder="Data minima do registro"
            />
          </div>
        </div>

        <div className="mb-5.5">
          <label
            htmlFor="registerMax"
            className="mb-3 block text-sm font-medium text-black dark:text-white"
          >
            Data máxima do registro
          </label>
          <div className="relative">
            <Input
              id="registerMax"
              type="text"
              {...register('registerMax')}
              placeholder="Data máxima do registro"
            />
          </div>
        </div>

        <div className="mb-5.5">
          <label
            htmlFor="dateMin"
            className="mb-3 block text-sm font-medium text-black dark:text-white"
          >
            Data minima da transação
          </label>
          <div className="relative">
            <Input
              id="dateMin"
              type="text"
              {...register('dateMin')}
              placeholder="Data minima da transação"
            />
          </div>
        </div>

        <div className="mb-5.5">
          <label
            htmlFor="dateMax"
            className="mb-3 block text-sm font-medium text-black dark:text-white"
          >
            Data máxima da transação
          </label>
          <div className="relative">
            <Input
              id="dateMax"
              type="text"
              {...register('dateMax')}
              placeholder="Data máxima da transação"
            />
          </div>
        </div>

        <div className="mb-5.5">
          <label
            htmlFor="amountMin"
            className="mb-3 block text-sm font-medium text-black dark:text-white"
          >
            Quantia minima
          </label>
          <div className="relative">
            <Input
              id="amountMin"
              type="text"
              {...register('amountMin')}
              placeholder="Quantia minima"
            />
          </div>
        </div>

        <div className="mb-5.5">
          <label
            htmlFor="amountMax"
            className="mb-3 block text-sm font-medium text-black dark:text-white"
          >
            Quantia máxima
          </label>
          <div className="relative">
            <Input
              id="amountMax"
              type="text"
              {...register('amountMax')}
              placeholder="Quantia máxima"
            />
          </div>
        </div>

        <div className="mb-5.5">
          <label
            htmlFor="userUuid"
            className="mb-3 block text-sm font-medium text-black dark:text-white"
          >
            Usuário
          </label>
          <div className="relative">
            <Input type="text" id="userUuid" disabled hidden {...register('userUuid')} />

            <UserSearch user={user} setUser={setUser} />
          </div>
        </div>

        <div className="mb-5.5">
          <label
            htmlFor="projectUuid"
            className="mb-3 block text-sm font-medium text-black dark:text-white"
          >
            Projeto
          </label>
          <div className="relative">
            <Input type="text" id="projectUuid" disabled hidden {...register('projectUuid')} />

            <ProjectSearch project={project} setProject={setProject} />
          </div>
        </div>

        <div className="mb-5.5">
          <label
            htmlFor="supplierUuid"
            className="mb-3 block text-sm font-medium text-black dark:text-white"
          >
            Fornecedor
          </label>
          <div className="relative">
            <Input type="text" id="supplierUuid" disabled hidden {...register('supplierUuid')} />

            <SupplierSearch supplier={supplier} setSupplier={setSupplier} />
          </div>
        </div>

        <div className="flex gap-5.5">
          <Button
            color="white"
            type="button"
            onClick={() => handleReset()}
            disabled={filtering !== 'idle'}
            loading={filtering === 'reset'}
          >
            Limpar
          </Button>
          <Button color="primary" disabled={filtering !== 'idle'} loading={filtering === 'filter'}>
            Filtrar
          </Button>
        </div>
      </form>
    </>
  )
}

export default Filter
