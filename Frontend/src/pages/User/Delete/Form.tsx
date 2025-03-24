import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input, InputNumeric, InputPattern } from '../../../components/Form/Input'
import Switcher from '../../../components/Form/Switcher'
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
import Alert from '../../../components/Alert/Index'
import Button from '../../../components/Form/Button'
import { AxiosError } from 'axios'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { userSchema } from '../../../hooks/useSchema'
import { UserProps } from '../../../types/Database'
import { useUser } from '../../../context/UserContext'
import { useAuth } from '../../../context/AuthContext'
import { Options, Select } from '../../../components/Form/Select'

const Form = ({ user, authOptions }: { user: UserProps; authOptions: Options[] }) => {
  const navigate = useNavigate()
  const { setUser } = useUser()
  const { setAuth } = useAuth()
  const [status, setStatus] = useState<'idle' | 'request' | 'complete'>('idle')
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
    <form onSubmit={handleSubmit(deleteUser)}>
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
                  className="bg-slate-200 dark:bg-slate-700"
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
              render={({ field }) => <Switcher disabled {...field} />}
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
            disabled
            icon={faUserTie}
            iconPosition="left"
            {...register('username')}
            placeholder="Digite o nome do usuário"
            className="bg-slate-200 dark:bg-slate-700"
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
            disabled
            icon={faUser}
            iconPosition="left"
            {...register('person.entity.name')}
            placeholder="Digite o nome completo"
            className="bg-slate-200 dark:bg-slate-700"
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
            disabled
            icon={faEnvelope}
            iconPosition="left"
            autoComplete="email"
            {...register('person.entity.email')}
            placeholder="Digite o email"
            className="bg-slate-200 dark:bg-slate-700"
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
                  disabled
                  id="authUuid"
                  icon={faBriefcase}
                  iconPosition="left"
                  isSelected={true}
                  options={authOptions || []}
                  className="bg-slate-200 dark:bg-slate-700"
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
                  disabled
                  icon={faDollarSign}
                  iconPosition="left"
                  prefix={'R$ '}
                  fixedDecimalScale
                  decimalScale={2}
                  allowNegative={false}
                  decimalSeparator=","
                  thousandSeparator="."
                  placeholder="Digite o valor da hora"
                  className="bg-slate-200 dark:bg-slate-700"
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
                disabled
                icon={faPhone}
                iconPosition="left"
                format="(##) # ####-####"
                autoComplete="phone"
                placeholder="Digite o telefone"
                className="bg-slate-200 dark:bg-slate-700"
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
            disabled
            icon={faLocationDot}
            iconPosition="left"
            {...register('person.entity.address')}
            placeholder="Digite o endereço"
            className="bg-slate-200 dark:bg-slate-700"
          />
        </div>
        {errors.person?.entity?.address && (
          <Alert type="danger" size="sm" data={[errors.person.entity.address.message || '']} />
        )}
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
