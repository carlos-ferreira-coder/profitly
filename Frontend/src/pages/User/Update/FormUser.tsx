import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  faAddressCard,
  faBriefcase,
  faDollarSign,
  faEnvelope,
  faLocationDot,
  faPhone,
  faUser,
  faUserTie,
} from '@fortawesome/free-solid-svg-icons'
import { api as axios, handleAxiosError } from '../../../services/Axios'
import { Select, Options } from '../../../components/Form/Select'
import Alert from '../../../components/Alert/Index'
import { Input, InputNumeric, InputPattern } from '../../../components/Form/Input'
import Switcher from '../../../components/Form/Switcher'
import Button from '../../../components/Form/Button'
import { userSchema } from '../../../hooks/useSchema'
import { UserProps } from '../../../types/Database'
import { useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios'

const FormUser = ({ user, authOptions }: { user: UserProps; authOptions: Options[] }) => {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'idle' | 'request'>('idle')
  const [alertErrors, setAlertErrors] = useState<(string | JSX.Element)[] | null>(null)
  const [alertSuccesses, setAlertSuccesses] = useState<(string | JSX.Element)[] | null>(null)

  // User schema
  const schema = userSchema
  type SchemaProps = z.infer<typeof schema>

  const defaultValues = {
    uuid: user.uuid,
    username: user.username,
    active: user.active,
    hourlyRate: user.hourlyRate || '',
    authUuid: user.authUuid,
    person: {
      cpf: user.person.cpf,
      entity: {
        name: user.person.entity.name,
        email: user.person.entity.email,
        phone: user.person.entity.phone || '',
        address: user.person.entity.address || '',
      },
    },
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

  // Handele reset
  const handleReset = () => {
    setAlertErrors(null)
    setAlertSuccesses(null)
    reset(defaultValues)
  }

  // Update user in backend
  const updateUser = async (data: SchemaProps) => {
    setStatus('request')

    setAlertErrors(null)
    setAlertSuccesses(null)

    try {
      const response = await axios.put('/user/update', data, {
        withCredentials: true,
      })

      // logout
      if (response.status === 418) {
        sessionStorage.setItem('errors', response.data.message)

        window.localStorage.setItem('isLogged', 'false')
        window.dispatchEvent(new Event('isLogged'))

        navigate('/login')
      }

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
    } catch (error) {
      // logout
      if (error instanceof AxiosError && error.response?.status === 418) {
        sessionStorage.setItem('errors', handleAxiosError(error))

        window.localStorage.setItem('isLogged', 'false')
        window.dispatchEvent(new Event('isLogged'))

        navigate('/login')
      }

      setAlertErrors([handleAxiosError(error)])
    }

    setStatus('idle')
  }

  return (
    <form onSubmit={handleSubmit(updateUser)}>
      <Input type="text" hidden disabled {...register('uuid')} />
      {errors.uuid && <Alert type="danger" size="sm" data={[errors.uuid.message || '']} />}

      <div className="mb-5.5 flex justify-between gap-5.5">
        <div className="w-full">
          <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="cpf">
            CPF <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <Controller
              name="person.cpf"
              control={control}
              render={({ field }) => (
                <InputPattern
                  {...field}
                  id="cpf"
                  mask="_"
                  disabled
                  icon={faAddressCard}
                  iconPosition="left"
                  format="###.###.###-##"
                  placeholder="Digite o cpf"
                />
              )}
            />
          </div>
          {errors.person?.cpf && (
            <Alert type="danger" size="sm" data={[errors.person.cpf.message || '']} />
          )}
        </div>

        <div className="relative">
          <div className="mb-3 block">
            <label
              className="flex justify-center items-center text-sm font-medium text-black dark:text-white"
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

      <div className="mb-5.5">
        <label
          className="mb-3 block text-sm font-medium text-black dark:text-white"
          htmlFor="username"
        >
          Usuário <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <Input
            id="username"
            type="text"
            icon={faUserTie}
            iconPosition="left"
            {...register('username')}
            placeholder="Digite o nome do usuário"
          />
        </div>
        {errors.username && (
          <Alert type="danger" size="sm" data={[errors.username.message || '']} />
        )}
      </div>

      <div className="mb-5.5">
        <label className="mb-3 block text-sm font-medium text-black dark:text-white" htmlFor="name">
          Nome completo <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <Input
            id="name"
            type="text"
            icon={faUser}
            iconPosition="left"
            {...register('person.entity.name')}
            placeholder="Digite o nome completo"
          />
        </div>
        {errors.person?.entity?.name && (
          <Alert type="danger" size="sm" data={[errors.person.entity.name.message || '']} />
        )}
      </div>

      <div className="mb-5.5">
        <label
          className="mb-3 block text-sm font-medium text-black dark:text-white"
          htmlFor="email"
        >
          Email <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <Input
            id="email"
            type="text"
            icon={faEnvelope}
            iconPosition="left"
            {...register('person.entity.email')}
            placeholder="Digite o email"
          />
        </div>
        {errors.person?.entity?.email && (
          <Alert type="danger" size="sm" data={[errors.person.entity.email.message || '']} />
        )}
      </div>

      <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
        <div className="w-full sm:w-1/2">
          <label
            className="mb-3 block text-sm font-medium text-black dark:text-white"
            htmlFor="authUuid"
          >
            Cargo atual <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <Controller
              name="authUuid"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  id="authUuid"
                  icon={faBriefcase}
                  iconPosition="left"
                  isSelected={true}
                  options={authOptions || []}
                />
              )}
            />
          </div>
          {errors.authUuid && (
            <Alert type="danger" size="sm" data={[errors.authUuid.message || '']} />
          )}
        </div>

        <div className="w-full sm:w-1/2">
          <label
            className="mb-3 block text-sm font-medium text-black dark:text-white"
            htmlFor="hourlyRate"
          >
            Valor da hora <span className="text-slate-400">?</span>
          </label>
          <div className="relative">
            <Controller
              name="hourlyRate"
              control={control}
              render={({ field }) => (
                <InputNumeric
                  {...field}
                  id="hourlyRate"
                  icon={faDollarSign}
                  iconPosition="left"
                  prefix={'R$ '}
                  fixedDecimalScale
                  decimalScale={2}
                  allowNegative={false}
                  decimalSeparator=","
                  thousandSeparator="."
                  placeholder="Digite o valor da hora"
                />
              )}
            />
          </div>
          {errors.hourlyRate && (
            <Alert type="danger" size="sm" data={[errors.hourlyRate.message || '']} />
          )}
        </div>
      </div>

      <div className="mb-5.5">
        <label
          className="mb-3 block text-sm font-medium text-black dark:text-white"
          htmlFor="phone"
        >
          Contato <span className="text-slate-400">?</span>
        </label>
        <div className="relative">
          <Controller
            name="person.entity.phone"
            control={control}
            render={({ field }) => (
              <InputPattern
                {...field}
                id="phone"
                mask="_"
                icon={faPhone}
                iconPosition="left"
                format="(##) # ####-####"
                autoComplete="phone"
                placeholder="Digite o telefone"
              />
            )}
          />
        </div>
        {errors.person?.entity?.phone && (
          <Alert type="danger" size="sm" data={[errors.person.entity.phone.message || '']} />
        )}
      </div>

      <div className="mb-5.5">
        <label
          className="mb-3 block text-sm font-medium text-black dark:text-white"
          htmlFor="address"
        >
          Endereço <span className="text-slate-400">?</span>
        </label>
        <div className="relative">
          <Input
            id="address"
            type="text"
            icon={faLocationDot}
            iconPosition="left"
            {...register('person.entity.address')}
            placeholder="Digite o endereço"
          />
        </div>
        {errors.person?.entity?.address && (
          <Alert type="danger" size="sm" data={[errors.person.entity.address.message || '']} />
        )}
      </div>

      {alertErrors && <Alert type="danger" size="lg" data={alertErrors} />}
      {alertSuccesses && <Alert type="success" size="lg" data={alertSuccesses} />}

      <div className="flex justify-end gap-5.5">
        <Button type="button" onClick={() => handleReset()} color="white">
          Resetar
        </Button>
        <Button color="primary" disabled={status === 'request'} loading={status === 'request'}>
          Editar
        </Button>
      </div>
    </form>
  )
}

export default FormUser
