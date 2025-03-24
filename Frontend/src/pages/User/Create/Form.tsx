import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { userCreateSchema } from '../../../hooks/useSchema'
import { Input, InputNumeric, InputPattern } from '../../../components/Form/Input'
import { Select, Options } from '../../../components/Form/Select'
import Switcher from '../../../components/Form/Switcher'
import Alert from '../../../components/Alert/Index'
import Button from '../../../components/Form/Button'
import { api as axios, handleAxiosError } from '../../../services/Axios'
import {
  faAddressCard,
  faBriefcase,
  faDollarSign,
  faEnvelope,
  faLocationDot,
  faLock,
  faPhone,
  faUnlock,
  faUser,
  faUserTie,
} from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'

const Form = ({ authOptions }: { authOptions: Options[] }) => {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'idle' | 'request'>('idle')
  const [alertErrors, setAlertErrors] = useState<(string | JSX.Element)[] | null>(null)
  const [alertSuccesses, setAlertSuccesses] = useState<(string | JSX.Element)[] | null>(null)

  // User schema
  const schema = userCreateSchema
  type SchemaProps = z.infer<typeof schema>

  const defaultValues = {
    username: '',
    password: '',
    passwordCheck: '',
    active: true,
    hourlyRate: '',
    authUuid: '',
    person: {
      entity: {
        cpf: '',
        name: '',
        email: '',
        phone: '',
        address: '',
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

  // Handle reset
  const handleReset = () => {
    setAlertErrors(null)
    setAlertSuccesses(null)
    reset(defaultValues)
  }

  // Create user in backend
  const createUser = async (data: SchemaProps) => {
    setStatus('request')
    setAlertErrors(null)
    setAlertSuccesses(null)

    try {
      const response = await axios.post('/user/create', data, {
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
    } catch (error) {
      setAlertErrors([handleAxiosError(error)])
    }

    setStatus('idle')
  }

  return (
    <form onSubmit={handleSubmit(createUser)}>
      <div className="flex justify-between gap-5 mb-6">
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
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="username">
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

      <div className="mb-6">
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="name">
          Nome completo <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <Input
            id="name"
            type="text"
            icon={faUser}
            iconPosition="left"
            autoComplete="name"
            {...register('person.entity.name')}
            placeholder="Digite o nome completo"
          />
        </div>
        {errors.person?.entity?.name && (
          <Alert type="danger" size="sm" data={[errors.person.entity.name.message || '']} />
        )}
      </div>

      <div className="flex justify-between gap-5 mb-6">
        <div className="w-full">
          <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="authId">
            Cargo atual <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <Controller
              name="authUuid"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  id="authUuidd"
                  icon={faBriefcase}
                  iconPosition="left"
                  options={authOptions}
                />
              )}
            />
          </div>
          {errors.authUuid && (
            <Alert type="danger" size="sm" data={[errors.authUuid.message || '']} />
          )}
        </div>

        <div className="w-full">
          <label
            className="mb-2.5 block font-medium text-black dark:text-white"
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

      <div className="mb-6">
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="email">
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

      <div className="mb-6">
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="password">
          Senha <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <Input
            id="password"
            type="password"
            icon={faLock}
            iconPosition="left"
            {...register('password')}
            placeholder="Digite a senha"
          />
        </div>
        {errors.password && (
          <Alert type="danger" size="sm" data={[errors.password.message || '']} />
        )}
      </div>

      <div className="mb-6">
        <label
          className="mb-2.5 block font-medium text-black dark:text-white"
          htmlFor="passwordCheck"
        >
          Repetir senha <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <Input
            id="passwordCheck"
            type="password"
            icon={faUnlock}
            iconPosition="left"
            {...register('passwordCheck')}
            placeholder="Confirme a senha"
          />
        </div>
        {errors.passwordCheck && (
          <Alert type="danger" size="sm" data={[errors.passwordCheck.message || '']} />
        )}
      </div>

      <div className="mb-6">
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="phone">
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

      <div className="mb-6">
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="address">
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

      <div className="flex justify-between gap-5">
        <Button color="white" type="button" onClick={() => handleReset()}>
          Limpar
        </Button>
        <Button color="primary" disabled={status === 'request'} loading={status === 'request'}>
          Cadastrar
        </Button>
      </div>
    </form>
  )
}

export default Form
