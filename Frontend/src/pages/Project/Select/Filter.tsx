import Button from '../../../components/Form/Button'
import { Controller, useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { Input, InputPattern } from '../../../components/Form/Input'
import Alert from '../../../components/Alert/Index'
import { useEffect, useState } from 'react'
import { ClientProps, StatusProps, UserProps } from '../../../types/Database'
import StatusSearch from '../../../hooks/search/useSearchStatus'
import { Checkbox } from '../../../components/Form/Checkbox'
import ClientSearch from '../../../hooks/search/useSearchClient'
import UserSearch from '../../../hooks/search/useSearchUser'
import qs from 'qs'
import { faAlignLeft, faCalendar, faProjectDiagram } from '@fortawesome/free-solid-svg-icons'

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
  const [client, setClient] = useState<ClientProps | null>(null)
  const [status, setStatus] = useState<StatusProps | null>(null)

  // Filter props
  type FilterProps = {
    allActive: boolean
    active: {
      key: boolean
      name: string
      value: boolean
    }[]
    name: string
    description: string
    registerMin: string
    registerMax: string
    userUuid: string
    clientUuid: string
    statusUuid: string
  }

  const defaultValues = {
    allActive: true,
    active: [
      { key: true, name: 'active', value: true },
      { key: false, name: 'inactive', value: true },
    ],
    name: '',
    description: '',
    registerMin: '',
    registerMax: '',
    userUuid: '',
    clientUuid: '',
    statusUuid: '',
  }

  // Hookform
  const {
    reset,
    control,
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<FilterProps>({
    defaultValues: defaultValues,
  })

  useEffect(() => {
    setValue('userUuid', user ? user.uuid : '')
  }, [user, setValue])

  useEffect(() => {
    setValue('clientUuid', client ? client.uuid : '')
  }, [client, setValue])

  useEffect(() => {
    setValue('statusUuid', status ? status.uuid : '')
  }, [status, setValue])

  // Handle reset
  const handleReset = () => {
    if (location.search) {
      setFiltering('reset')

      setUser(null)
      setClient(null)
      setStatus(null)

      reset(defaultValues)

      navigate('/project/select')
    }
  }

  // Pass filter on url
  const filter = (data: FilterProps) => {
    setFiltering('filter')

    const query = {
      active: data.active.filter(({ value }) => value).map(({ key }) => key),
      name: data.name || undefined,
      description: data.description || undefined,
      registerMin: data.registerMin || undefined,
      registerMax: data.registerMax || undefined,
      userUuid: data.userUuid || undefined,
      clientUuid: data.clientUuid || undefined,
      statusUuid: data.statusUuid || undefined,
    }

    navigate(`/project/select?${qs.stringify(query, { encode: false })}`)
  }

  return (
    <>
      <form onSubmit={handleSubmit(filter)}>
        <div className="mb-5.5">
          <label
            htmlFor="allStatus"
            className="mb-3 block text-sm font-medium text-black dark:text-white"
          >
            Status
          </label>
          <div className="relative">
            <div className="mb-1">
              <Controller
                name="allActive"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    label="Selecionar Todos"
                    name={field.name}
                    value={field.value}
                    onChange={(e) => {
                      const isChecked = e.target.checked

                      setValue('active.0.value', isChecked)
                      setValue('active.1.value', isChecked)

                      field.onChange(isChecked)
                    }}
                  />
                )}
              />
            </div>

            <div className="ml-2 pl-3 border-l-2">
              <Controller
                name="active.0.value"
                control={control}
                render={({ field }) => <Checkbox label="Ativo" {...field} />}
              />
              <Controller
                name="active.1.value"
                control={control}
                render={({ field }) => <Checkbox label="Inativo" {...field} />}
              />
            </div>
          </div>
        </div>

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
              icon={faProjectDiagram}
              iconPosition="left"
              {...register('name')}
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
            Data de registro minima
          </label>
          <div className="relative">
            <Controller
              name="registerMin"
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
            Data de registro máxima
          </label>
          <div className="relative">
            <Controller
              name="registerMax"
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
            htmlFor="userUuid"
            className="mb-3 block text-sm font-medium text-black dark:text-white"
          >
            Usuário
          </label>
          <div className="relative">
            <Input type="text" id="userUuid" disabled hidden {...register('userUuid')} />

            <UserSearch user={user} setUser={setUser} />
          </div>
          {errors.userUuid && (
            <Alert type="danger" size="sm" data={[errors.userUuid.message || '']} />
          )}
        </div>

        <div className="mb-5.5">
          <label
            htmlFor="clientUuid"
            className="mb-3 block text-sm font-medium text-black dark:text-white"
          >
            Cliente
          </label>
          <div className="relative">
            <Input type="text" id="clientUuid" disabled hidden {...register('clientUuid')} />

            <ClientSearch client={client} setClient={setClient} />
          </div>
          {errors.clientUuid && (
            <Alert type="danger" size="sm" data={[errors.clientUuid.message || '']} />
          )}
        </div>

        <div className="mb-5.5">
          <label
            htmlFor="statusUuid"
            className="mb-3 block text-sm font-medium text-black dark:text-white"
          >
            Status
          </label>
          <div className="relative">
            <Input type="text" id="statusUuid" disabled hidden {...register('statusUuid')} />

            <StatusSearch status={status} setStatus={setStatus} />
          </div>
          {errors.statusUuid && (
            <Alert type="danger" size="sm" data={[errors.statusUuid.message || '']} />
          )}
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
