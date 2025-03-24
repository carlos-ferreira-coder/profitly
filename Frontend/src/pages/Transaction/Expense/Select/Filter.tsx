import Button from '../../../../components/Form/Button'
import { Controller, useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { Input, InputNumeric, InputPattern } from '../../../../components/Form/Input'
import { useEffect, useState } from 'react'
import { UserProps, ProjectProps, SupplierProps } from '../../../../types/Database'
import UserSearch from '../../../../hooks/search/useSearchUser'
import ProjectSearch from '../../../../hooks/search/useSearchProject'
import SupplierSearch from '../../../../hooks/search/useSearchSupplier'
import qs from 'qs'
import { currencyToNumber } from '../../../../hooks/useCurrency'
import {
  faAlignLeft,
  faCalendar,
  faDollarSign,
  faFileInvoiceDollar,
} from '@fortawesome/free-solid-svg-icons'

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
    transaction: {
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
    }
    supplierUuid: string
  }

  const defaultValues = {
    transaction: {
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
    },
    supplierUuid: '',
  }

  // Hookform
  const { reset, control, register, setValue, handleSubmit } = useForm<FilterProps>({
    defaultValues: defaultValues,
  })

  useEffect(() => {
    setValue('transaction.userUuid', user ? user.uuid : '')
  }, [user, setValue])

  useEffect(() => {
    setValue('transaction.projectUuid', project ? project.uuid : '')
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

    const transformDate = (str: string) => {
      if (!str) return undefined

      const [date, time] = str.split(' ')
      const [hour, minute] = time.split(':')
      const [day, month, year] = date.split('/')

      return `20${year}-${month}-${day}T${hour}:${minute}:00`
    }

    const query = {
      supplierUuid: data.supplierUuid || undefined,
      transaction: Object.values(data.transaction).some((value) => value !== '')
        ? {
            name: data.transaction.name || undefined,
            description: data.transaction.description || undefined,
            registerMin: transformDate(data.transaction.registerMin),
            registerMax: transformDate(data.transaction.registerMax),
            dateMin: transformDate(data.transaction.dateMin),
            dateMax: transformDate(data.transaction.dateMax),
            amountMin: data.transaction.amountMin
              ? currencyToNumber(data.transaction.amountMin, 'BRL')
              : undefined,
            amountMax: data.transaction.amountMax
              ? currencyToNumber(data.transaction.amountMax, 'BRL')
              : undefined,
            userUuid: data.transaction.userUuid || undefined,
            projectUuid: data.transaction.projectUuid || undefined,
          }
        : undefined,
    }

    navigate(`/transaction/expense/select?${qs.stringify(query, { encode: false })}`)
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
            <Input
              id="name"
              type="text"
              icon={faFileInvoiceDollar}
              iconPosition="left"
              {...register('transaction.name')}
              placeholder="Digite o nome"
            />
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
              icon={faAlignLeft}
              iconPosition="left"
              {...register('transaction.description')}
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
            <Controller
              name="transaction.registerMin"
              control={control}
              render={({ field }) => (
                <InputPattern
                  {...field}
                  id="date"
                  mask="_"
                  icon={faCalendar}
                  iconPosition="left"
                  format="##/##/## ##:##"
                  placeholder="dd/mm/aa --:--"
                />
              )}
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
            <Controller
              name="transaction.registerMax"
              control={control}
              render={({ field }) => (
                <InputPattern
                  {...field}
                  id="date"
                  mask="_"
                  icon={faCalendar}
                  iconPosition="left"
                  format="##/##/## ##:##"
                  placeholder="dd/mm/aa --:--"
                />
              )}
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
            <Controller
              name="transaction.dateMin"
              control={control}
              render={({ field }) => (
                <InputPattern
                  {...field}
                  id="date"
                  mask="_"
                  icon={faCalendar}
                  iconPosition="left"
                  format="##/##/## ##:##"
                  placeholder="dd/mm/aa --:--"
                />
              )}
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
            <Controller
              name="transaction.dateMax"
              control={control}
              render={({ field }) => (
                <InputPattern
                  {...field}
                  id="date"
                  mask="_"
                  icon={faCalendar}
                  iconPosition="left"
                  format="##/##/## ##:##"
                  placeholder="dd/mm/aa --:--"
                />
              )}
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
            <Controller
              name="transaction.amountMin"
              control={control}
              render={({ field }) => (
                <InputNumeric
                  {...field}
                  icon={faDollarSign}
                  iconPosition="left"
                  prefix={'R$ '}
                  fixedDecimalScale
                  decimalScale={2}
                  allowNegative={false}
                  decimalSeparator=","
                  thousandSeparator="."
                  placeholder="Digite a quantia minima"
                />
              )}
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
            <Controller
              name="transaction.amountMax"
              control={control}
              render={({ field }) => (
                <InputNumeric
                  {...field}
                  icon={faDollarSign}
                  iconPosition="left"
                  prefix={'R$ '}
                  fixedDecimalScale
                  decimalScale={2}
                  allowNegative={false}
                  decimalSeparator=","
                  thousandSeparator="."
                  placeholder="Digite a quantia maxima"
                />
              )}
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
            <Input
              type="text"
              id="userUuid"
              disabled
              hidden
              {...register('transaction.userUuid')}
            />

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
            <Input
              type="text"
              id="projectUuid"
              disabled
              hidden
              {...register('transaction.projectUuid')}
            />

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
