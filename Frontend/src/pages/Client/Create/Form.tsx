import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { clientCreateSchema } from '../../../hooks/useSchema'
import { Input, InputPattern } from '../../../components/Form/Input'
import { Select } from '../../../components/Form/Select'
import Switcher from '../../../components/Form/Switcher'
import Alert from '../../../components/Alert/Index'
import Button from '../../../components/Form/Button'
import { api as axios, handleAxiosError } from '../../../services/Axios'
import {
  faAddressCard,
  faBriefcase,
  faEnvelope,
  faLocationDot,
  faPhone,
  faUser,
  faUserTie,
} from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'

const Form = () => {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'idle' | 'request'>('idle')
  const [alertErrors, setAlertErrors] = useState<(string | JSX.Element)[] | null>(null)
  const [alertSuccesses, setAlertSuccesses] = useState<(string | JSX.Element)[] | null>(null)

  // Client schema
  const schema = clientCreateSchema
  type SchemaProps = z.infer<typeof schema>

  const defaultValues = {
    active: true,
    type: 'Enterprise',
    cpf: undefined,
    cnpj: undefined,
    fantasy: undefined,
    name: '',
    email: '',
    phone: '',
    address: '',
  }

  // Hookform
  const {
    watch,
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
    setValue('cpf', undefined)
    setValue('cnpj', undefined)
    setValue('fantasy', undefined)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch('type')])

  // Handle reset
  const handleReset = () => {
    setAlertErrors(null)
    setAlertSuccesses(null)
    reset(defaultValues)
  }

  // Create client in backend
  const createClient = async (data: SchemaProps) => {
    setStatus('request')
    setAlertErrors(null)
    setAlertSuccesses(null)

    try {
      const response = await axios.post('/client/create', data, {
        withCredentials: true,
      })
      setAlertSuccesses([
        response.data.message,
        <Button
          type="button"
          color="success"
          onClick={() => navigate('/client/select')}
          className="h-8 w-35 bg-green-400 dark:text-form-input dark:bg-green-400"
        >
          Listar clientes
        </Button>,
      ])
    } catch (error) {
      setAlertErrors([handleAxiosError(error)])
    }

    setStatus('idle')
  }

  return (
    <form onSubmit={handleSubmit(createClient)}>
      <div className="mb-6">
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="type">
          Tipo <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                id="type"
                icon={faBriefcase}
                iconPosition="left"
                options={[
                  { value: 'Person', label: 'Pessoa', disabled: false },
                  { value: 'Enterprise', label: 'Empresa', disabled: false },
                ]}
              />
            )}
          />
        </div>
        {errors.type && <Alert type="danger" size="sm" data={[errors.type.message || '']} />}
      </div>

      <div className="flex justify-between gap-5 mb-6">
        <div className="w-full" style={{ display: watch().type === 'Person' ? 'block' : 'none' }}>
          <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="cpf">
            CPF <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <Controller
              name="cpf"
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
          {errors.cpf && <Alert type="danger" size="sm" data={[errors.cpf.message || '']} />}
        </div>

        <div
          className="w-full"
          style={{ display: watch().type === 'Enterprise' ? 'block' : 'none' }}
        >
          <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="cnpj">
            CNPJ <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <Controller
              name="cnpj"
              control={control}
              render={({ field }) => (
                <InputPattern
                  {...field}
                  id="cnpj"
                  mask="_"
                  icon={faAddressCard}
                  iconPosition="left"
                  format="##.###.###/####-##"
                  placeholder="Digite o cnpj"
                />
              )}
            />
          </div>
          {errors.cnpj && <Alert type="danger" size="sm" data={[errors.cnpj.message || '']} />}
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
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="name">
          Nome <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <Input
            id="name"
            type="text"
            icon={faUserTie}
            iconPosition="left"
            autoComplete="name"
            {...register('name')}
            placeholder="Digite o nome"
          />
        </div>
        {errors.name && <Alert type="danger" size="sm" data={[errors.name.message || '']} />}
      </div>

      <div className="mb-6" style={{ display: watch().type === 'Enterprise' ? 'block' : 'none' }}>
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="fantasy">
          Nome fantasia <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <Input
            id="fantasy"
            type="text"
            icon={faUser}
            iconPosition="left"
            {...register('fantasy')}
            placeholder="Digite o nome do fantasia"
          />
        </div>
        {errors.fantasy && <Alert type="danger" size="sm" data={[errors.fantasy.message || '']} />}
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
            autoComplete="email"
            {...register('email')}
            placeholder="Digite o email"
          />
        </div>
        {errors.email && <Alert type="danger" size="sm" data={[errors.email.message || '']} />}
      </div>

      <div className="mb-6">
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="phone">
          Contato <span className="text-slate-400">?</span>
        </label>
        <div className="relative">
          <Controller
            name="phone"
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
        {errors.phone && <Alert type="danger" size="sm" data={[errors.phone.message || '']} />}
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
            {...register('address')}
            placeholder="Digite o endereço"
          />
        </div>
        {errors.address && <Alert type="danger" size="sm" data={[errors.address.message || '']} />}
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
