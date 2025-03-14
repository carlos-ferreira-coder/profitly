import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Input } from '../../../components/Form/Input'
import { api as axios, handleAxiosError } from '../../../services/Axios'
import Alert from '../../../components/Alert/Index'
import Button from '../../../components/Form/Button'
import { faAlignLeft, faProjectDiagram } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ClientProps, ProjectProps, StatusProps, UserProps } from '../../../types/Database'
import Switcher from '../../../components/Form/Switcher'
import { projectUpdateSchema } from '../../../hooks/useSchema'
import UserSearch from '../../../hooks/search/useSearchUser'
import ClientSearch from '../../../hooks/search/useSearchClient'
import StatusSearch from '../../../hooks/search/useSearchStatus'

const Form = ({ project }: { project: ProjectProps }) => {
  const navigate = useNavigate()
  const [request, setRequest] = useState<'idle' | 'request' | 'loanding'>('idle')
  const [user, setUser] = useState<UserProps | null>(null)
  const [client, setClient] = useState<ClientProps | null>(null)
  const [status, setStatus] = useState<StatusProps | null>(null)
  const [alertErrors, setAlertErrors] = useState<(string | JSX.Element)[] | null>(null)
  const [alertSuccesses, setAlertSuccesses] = useState<(string | JSX.Element)[] | null>(null)

  const getDefaultData = async () => {
    setRequest('loanding')

    try {
      const [
        {
          data: { 0: resClient },
        },
        {
          data: { 0: resStatus },
        },
      ] = await Promise.all([
        axios.get(`client/select/${project.clientUuid}`, { withCredentials: true }),
        axios.get(`status/select/${project.statusUuid}`, { withCredentials: true }),
      ])

      setClient(resClient)
      setStatus(resStatus)

      if (project.userUuid) {
        const {
          data: { 0: resUser },
        } = await axios.get(`user/select/${project.userUuid}`, { withCredentials: true })

        setUser(resUser)
      }
    } catch (error) {
      setAlertErrors([handleAxiosError(error)])
    }

    setRequest('idle')
  }

  useEffect(() => {
    getDefaultData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Project schema
  const schema = projectUpdateSchema
  type SchemaProps = z.infer<typeof schema>

  const defaultValues = {
    uuid: project.uuid,
    name: project.name,
    description: project.description,
    active: project.active,
    userUuid: project.userUuid,
    clientUuid: project.clientUuid,
    statusUuid: project.statusUuid,
  }

  // Hookform
  const {
    reset,
    control,
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<SchemaProps>({
    resolver: zodResolver(schema),
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
  const handleReset = async () => {
    setAlertErrors(null)
    setAlertSuccesses(null)

    reset(defaultValues)

    getDefaultData()
  }

  // Update transaction in backend
  const updateProject = async (data: SchemaProps) => {
    setRequest('request')
    setAlertErrors(null)
    setAlertSuccesses(null)

    try {
      const response = await axios.put('/project/update', data, {
        withCredentials: true,
      })

      setAlertSuccesses([
        response.data.message,
        <Button
          type="button"
          color="success"
          onClick={() => navigate('/project/select')}
          className="h-8 w-50 bg-green-400 dark:text-form-input dark:bg-green-400"
        >
          Listar projetos
        </Button>,
      ])
    } catch (error) {
      setAlertErrors([handleAxiosError(error)])
    }

    setRequest('idle')
  }

  return (
    <form onSubmit={handleSubmit(updateProject)}>
      <Input id="uuid" type="text" hidden disabled {...register('uuid')} />
      {errors.uuid && <Alert type="danger" size="sm" data={[errors.uuid.message || '']} />}

      <div className="flex justify-between gap-5 mb-6">
        <div className="w-full">
          <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="name">
            Nome <span className="text-danger">*</span>
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
          {errors.name && <Alert type="danger" size="sm" data={[errors.name.message || '']} />}
        </div>

        <div className="relative">
          <div className="flex justify-center">
            <label
              className="mb-2.5 block font-medium text-black dark:text-white text-center"
              htmlFor="active"
            >
              Ativo
            </label>
          </div>

          <div className="flex items-center h-13">
            <Controller
              name="active"
              control={control}
              render={({ field }) => <Switcher {...field} />}
            />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label
          className="mb-2.5 block font-medium text-black dark:text-white"
          htmlFor="description"
        >
          Descrição <span className="text-danger">*</span>
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
        {errors.description && (
          <Alert type="danger" size="sm" data={[errors.description.message || '']} />
        )}
      </div>

      <div className="mb-6">
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="userUuid">
          Usuário <span className="text-slate-400">?</span>
        </label>
        <div className="relative">
          <Input type="text" id="userUuid" disabled hidden {...register('userUuid')} />

          <UserSearch user={user} setUser={setUser} />
        </div>
        {errors.userUuid && (
          <Alert type="danger" size="sm" data={[errors.userUuid.message || '']} />
        )}
      </div>

      <div className="mb-6">
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="clientUuid">
          Cliente <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <Input type="text" id="clientUuid" disabled hidden {...register('clientUuid')} />

          <ClientSearch client={client} setClient={setClient} />
        </div>
        {errors.clientUuid && (
          <Alert type="danger" size="sm" data={[errors.clientUuid.message || '']} />
        )}
      </div>

      <div className="mb-6">
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="statusUuid">
          Status <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <Input type="text" id="statusUuid" disabled hidden {...register('statusUuid')} />

          <StatusSearch status={status} setStatus={setStatus} />
        </div>
        {errors.statusUuid && (
          <Alert type="danger" size="sm" data={[errors.statusUuid.message || '']} />
        )}
      </div>

      {alertErrors && <Alert type="danger" size="lg" data={alertErrors} />}
      {alertSuccesses && <Alert type="success" size="lg" data={alertSuccesses} />}

      <div className="flex justify-between gap-5">
        <Button
          type="button"
          color="white"
          onClick={() => handleReset()}
          disabled={request === 'loanding'}
          loading={request === 'loanding'}
        >
          Resetar
        </Button>
        <Button
          color="primary"
          disabled={request !== 'idle'}
          loading={request === 'request' || request === 'loanding'}
        >
          Editar
        </Button>
      </div>
    </form>
  )
}

export default Form
