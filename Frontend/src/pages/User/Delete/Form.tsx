import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input, InputPattern } from '../../../components/Form/Input'
import Switcher from '../../../components/Form/Switcher'
import { faAddressCard, faEnvelope, faUser, faUserTie } from '@fortawesome/free-solid-svg-icons'
import { api as axios, handleAxiosError } from '../../../services/Axios'
import Alert from '../../../components/Alert/Index'
import Button from '../../../components/Form/Button'
import { AxiosError } from 'axios'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { userDeleteSchema } from '../../../hooks/useSchema'
import { UserProps } from '../../../types/Database'

const Form = ({ user }: { user: UserProps }) => {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'idle' | 'request' | 'complete'>('idle')
  const [alertErrors, setAlertErrors] = useState<(string | JSX.Element)[] | null>(null)
  const [alertSuccesses, setAlertSuccesses] = useState<(string | JSX.Element)[] | null>(null)

  // User schema
  const schema = userDeleteSchema
  type SchemaProps = z.infer<typeof schema>

  const defaultValues = {
    uuid: user.uuid,
    username: user.username,
    active: user.active,
    cpf: user.person.cpf,
    name: user.person.entity.name,
    email: user.person.entity.email,
  }

  // Hookform
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SchemaProps>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues,
  })

  // Delete user in backend
  const deleteUser = async (data: SchemaProps) => {
    setStatus('request')
    setAlertErrors(null)
    setAlertSuccesses(null)

    try {
      const response = await axios.delete(`/user/delete/${data.uuid}`, {
        withCredentials: true,
      })

      setAlertSuccesses([
        response.data.message,
        <Button
          type="button"
          color="success"
          onClick={() => navigate('/user/select')}
          className="h-8 w-35 bg-green-400 dark:text-form-input dark:bg-green-400"
        >
          Listar usuários
        </Button>,
      ])

      setStatus('complete')
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 418) {
        sessionStorage.setItem('errors', handleAxiosError(error))

        sessionStorage.setItem('isLogged', 'false')
        window.dispatchEvent(new Event('isLogged'))

        navigate('/login')
      }
      setAlertErrors([handleAxiosError(error)])
      setStatus('idle')
    }
  }

  return (
    <form onSubmit={handleSubmit(deleteUser)}>
      <Input id="uuid" type="text" hidden disabled {...register('uuid')} />
      {errors.uuid && <Alert type="danger" size="sm" data={[errors.uuid.message || '']} />}

      <div className="flex justify-between gap-5 mb-6">
        <div className="w-full">
          <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="cpf">
            CPF
          </label>
          <div className="relative">
            <Controller
              name="cpf"
              control={control}
              render={({ field }) => (
                <InputPattern
                  {...field}
                  disabled
                  id="cpf"
                  mask="_"
                  icon={faAddressCard}
                  iconPosition="left"
                  format="###.###.###-##"
                  className="bg-slate-200 dark:bg-slate-700"
                />
              )}
            />
          </div>
          {errors.cpf && <Alert type="danger" size="sm" data={[errors.cpf.message || '']} />}
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
              render={({ field }) => <Switcher disabled {...field} />}
            />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="username">
          Nome de usuário
        </label>
        <div className="relative">
          <Input
            disabled
            id="username"
            type="text"
            icon={faUserTie}
            iconPosition="left"
            {...register('username')}
            className="bg-slate-200 dark:bg-slate-700"
          />
        </div>
        {errors.username && (
          <Alert type="danger" size="sm" data={[errors.username.message || '']} />
        )}
      </div>

      <div className="mb-6">
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="name">
          Nome completo
        </label>
        <div className="relative">
          <Input
            disabled
            id="name"
            type="text"
            icon={faUser}
            iconPosition="left"
            {...register('name')}
            className="bg-slate-200 dark:bg-slate-700"
          />
        </div>
        {errors.name && <Alert type="danger" size="sm" data={[errors.name.message || '']} />}
      </div>

      <div className="mb-6">
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="email">
          Email
        </label>
        <div className="relative">
          <Input
            disabled
            id="email"
            type="text"
            icon={faEnvelope}
            iconPosition="left"
            {...register('email')}
            className="bg-slate-200 dark:bg-slate-700"
          />
        </div>
        {errors.email && <Alert type="danger" size="sm" data={[errors.email.message || '']} />}
      </div>

      {alertErrors && <Alert type="danger" size="lg" data={alertErrors} />}
      {alertSuccesses && <Alert type="success" size="lg" data={alertSuccesses} />}

      <div className="flex justify-between gap-5">
        <Button
          color="danger"
          disabled={status === 'request' || status === 'complete'}
          loading={status === 'request'}
        >
          Deletar
        </Button>
      </div>
    </form>
  )
}

export default Form
