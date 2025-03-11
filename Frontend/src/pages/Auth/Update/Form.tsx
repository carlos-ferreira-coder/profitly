import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { authSchema } from '../../../hooks/useSchema'
import { Controller, useForm } from 'react-hook-form'
import { Input } from '../../../components/Form/Input'
import { api as axios, handleAxiosError } from '../../../services/Axios'
import Alert from '../../../components/Alert/Index'
import Button from '../../../components/Form/Button'
import { faBriefcase } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { AuthProps } from '../../../types/Database'
import { Checkbox } from '../../../components/Form/Checkbox'
import { AxiosError } from 'axios'
import { useUser } from '../../../context/UserContext'
import { useAuth } from '../../../context/AuthContext'

const Form = ({ auth }: { auth: AuthProps }) => {
  const navigate = useNavigate()
  const { setUser } = useUser()
  const { setAuth } = useAuth()
  const [status, setStatus] = useState<'idle' | 'request'>('idle')
  const [alertErrors, setAlertErrors] = useState<(string | JSX.Element)[] | null>(null)
  const [alertSuccesses, setAlertSuccesses] = useState<(string | JSX.Element)[] | null>(null)

  // Auth schema
  const schema = authSchema
  type SchemaProps = z.infer<typeof schema>

  const defaultValues = {
    uuid: auth.uuid,
    name: auth.name,
    admin: auth.admin,
    project: auth.project,
    personal: auth.personal,
    financial: auth.financial,
  }

  // Hookform
  const {
    reset,
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SchemaProps>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues,
  })

  // Handle reset
  const handleReset = () => {
    setAlertErrors(null)
    setAlertSuccesses(null)
    reset(defaultValues)
  }

  // Update auth in backend
  const updateAuth = async (data: SchemaProps) => {
    setStatus('request')
    setAlertErrors(null)
    setAlertSuccesses(null)

    try {
      const response = await axios.put('/auth/update/', data, {
        withCredentials: true,
      })
      setAlertSuccesses([
        response.data.message,
        <Button
          type="button"
          color="success"
          onClick={() => navigate('/auth/select')}
          className="h-8 w-50 bg-green-400 dark:text-form-input dark:bg-green-400"
        >
          Listar cargos / funções
        </Button>,
      ])
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 418) {
        setUser(null)
        setAuth(null)

        sessionStorage.setItem('errors', handleAxiosError(error))

        navigate('/login')
      }
      setAlertErrors([handleAxiosError(error)])
    }

    setStatus('idle')
  }

  return (
    <form onSubmit={handleSubmit(updateAuth)}>
      <Input id="uuid" type="text" disabled hidden {...register('uuid')} />
      {errors.uuid && <Alert type="danger" size="sm" data={[errors.uuid.message || '']} />}

      <div className="mb-6">
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="name">
          Cargo / Função <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <Input
            id="name"
            type="text"
            icon={faBriefcase}
            iconPosition="left"
            {...register('name')}
            placeholder="Digite o cargo / função"
          />
        </div>
        {errors.name && <Alert type="danger" size="sm" data={[errors.name.message || '']} />}
      </div>

      <div className="mb-6">
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="type">
          Autorizações <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <Controller
            name="admin"
            control={control}
            render={({ field }) => <Checkbox label="Administração" {...field} />}
          />
          <Controller
            name="project"
            control={control}
            render={({ field }) => <Checkbox label="Editar Projetos" {...field} />}
          />
          <Controller
            name="personal"
            control={control}
            render={({ field }) => <Checkbox label="Informações pessoais" {...field} />}
          />
          <Controller
            name="financial"
            control={control}
            render={({ field }) => <Checkbox label="Informações financeiras" {...field} />}
          />
        </div>
      </div>

      {alertErrors && <Alert type="danger" size="lg" data={alertErrors} />}
      {alertSuccesses && <Alert type="success" size="lg" data={alertSuccesses} />}

      <div className="flex justify-between gap-5">
        <Button type="button" color="white" onClick={() => handleReset()}>
          Resetar
        </Button>
        <Button color="primary" disabled={status === 'request'} loading={status === 'request'}>
          Editar
        </Button>
      </div>
    </form>
  )
}

export default Form
