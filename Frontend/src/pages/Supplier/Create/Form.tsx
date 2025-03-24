import { useNavigate } from 'react-router-dom'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supplierCreateSchema } from '../../../hooks/useSchema'
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
import { useEffect, useMemo, useState } from 'react'

const Form = () => {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'idle' | 'request'>('idle')
  const [alertErrors, setAlertErrors] = useState<(string | JSX.Element)[] | null>(null)
  const [alertSuccesses, setAlertSuccesses] = useState<(string | JSX.Element)[] | null>(null)

  // Supplier schema
  const schema = supplierCreateSchema
  type SchemaProps = z.infer<typeof schema>

  const defaultValues = useMemo(
    () => ({
      active: true,
      type: 'enterprise',
      person: {
        cpf: '',
        entity: {
          name: '',
          email: '',
          phone: '',
          address: '',
        },
      },
      enterprise: {
        cnpj: '',
        fantasy: '',
        entity: {
          name: '',
          email: '',
          phone: '',
          address: '',
        },
      },
    }),
    []
  )

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
    defaultValues: {
      ...defaultValues,
      person: undefined,
    },
  })

  const type = useWatch({ control, name: 'type' })
  const person = useWatch({ control, name: 'person' })
  const enterprise = useWatch({ control, name: 'enterprise' })

  useEffect(() => {
    if (type === 'person') {
      setValue('person', { ...defaultValues.person })
      setValue('enterprise', undefined)
    }

    if (type === 'enterprise') {
      setValue('person', undefined)
      setValue('enterprise', { ...defaultValues.enterprise })
    }
  }, [type, setValue, defaultValues])

  // Handle reset
  const handleReset = () => {
    setAlertErrors(null)
    setAlertSuccesses(null)
    reset(defaultValues)
  }

  // Create supplier in backend
  const createSupplier = async (data: SchemaProps) => {
    setStatus('request')
    setAlertErrors(null)
    setAlertSuccesses(null)

    try {
      const response = await axios.post('/supplier/create', data, {
        withCredentials: true,
      })
      setAlertSuccesses([
        response.data.message,
        <Button
          type="button"
          color="success"
          onClick={() => navigate('/supplier/select')}
          className="h-8 w-50 bg-green-400 dark:text-form-input dark:bg-green-400"
        >
          Listar Fornecedores
        </Button>,
      ])
    } catch (error) {
      setAlertErrors([handleAxiosError(error)])
    }

    setStatus('idle')
  }

  return (
    <form onSubmit={handleSubmit(createSupplier)}>
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
                  { value: 'person', label: 'Pessoa', disabled: false },
                  { value: 'enterprise', label: 'Empresa', disabled: false },
                ]}
              />
            )}
          />
        </div>
        {errors.type && <Alert type="danger" size="sm" data={[errors.type.message || '']} />}
      </div>

      <div className="flex justify-between gap-5 mb-6">
        {person && (
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
        )}

        {enterprise && (
          <div className="w-full">
            <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="cnpj">
              CNPJ <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <Controller
                name="enterprise.cnpj"
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
            {errors.enterprise?.cnpj && (
              <Alert type="danger" size="sm" data={[errors.enterprise.cnpj.message || '']} />
            )}
          </div>
        )}

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
          {person && (
            <Input
              id="name"
              type="text"
              icon={faUserTie}
              iconPosition="left"
              {...register('person.entity.name')}
              placeholder="Digite o nome"
            />
          )}

          {enterprise && (
            <Input
              id="name"
              type="text"
              icon={faUserTie}
              iconPosition="left"
              {...register('enterprise.entity.name')}
              placeholder="Digite o nome"
            />
          )}
        </div>
        {errors.person?.entity?.name && (
          <Alert type="danger" size="sm" data={[errors.person.entity.name.message || '']} />
        )}
        {errors.enterprise?.entity?.name && (
          <Alert type="danger" size="sm" data={[errors.enterprise.entity.name.message || '']} />
        )}
      </div>

      {enterprise && (
        <div className="mb-6">
          <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="fantasy">
            Nome fantasia <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <Input
              id="fantasy"
              type="text"
              icon={faUser}
              iconPosition="left"
              {...register('enterprise.fantasy')}
              placeholder="Digite o nome do fantasia"
            />
          </div>
          {errors.enterprise?.fantasy && (
            <Alert type="danger" size="sm" data={[errors.enterprise.fantasy.message || '']} />
          )}
        </div>
      )}

      <div className="mb-6">
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="email">
          Email <span className="text-danger">*</span>
        </label>
        <div className="relative">
          {person && (
            <Input
              id="email"
              type="text"
              icon={faEnvelope}
              iconPosition="left"
              autoComplete="email"
              {...register('person.entity.email')}
              placeholder="Digite o email"
            />
          )}
          {enterprise && (
            <Input
              id="email"
              type="text"
              icon={faEnvelope}
              iconPosition="left"
              autoComplete="email"
              {...register('enterprise.entity.email')}
              placeholder="Digite o email"
            />
          )}
        </div>
        {errors.person?.entity?.email && (
          <Alert type="danger" size="sm" data={[errors.person.entity.email.message || '']} />
        )}
        {errors.enterprise?.entity?.email && (
          <Alert type="danger" size="sm" data={[errors.enterprise.entity.email.message || '']} />
        )}
      </div>

      <div className="mb-6">
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="phone">
          Contato <span className="text-slate-400">?</span>
        </label>
        <div className="relative">
          {person && (
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
          )}
          {enterprise && (
            <Controller
              name="enterprise.entity.phone"
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
          )}
        </div>
        {errors.person?.entity?.phone && (
          <Alert type="danger" size="sm" data={[errors.person.entity.phone.message || '']} />
        )}
        {errors.enterprise?.entity?.phone && (
          <Alert type="danger" size="sm" data={[errors.enterprise.entity.phone.message || '']} />
        )}
      </div>

      <div className="mb-6">
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="address">
          Endereço <span className="text-slate-400">?</span>
        </label>
        <div className="relative">
          {person && (
            <Input
              id="address"
              type="text"
              icon={faLocationDot}
              iconPosition="left"
              {...register('person.entity.address')}
              placeholder="Digite o endereço"
            />
          )}
          {enterprise && (
            <Input
              id="address"
              type="text"
              icon={faLocationDot}
              iconPosition="left"
              {...register('enterprise.entity.address')}
              placeholder="Digite o endereço"
            />
          )}
        </div>
        {errors.person?.entity?.address && (
          <Alert type="danger" size="sm" data={[errors.person.entity.address.message || '']} />
        )}
        {errors.enterprise?.entity?.address && (
          <Alert type="danger" size="sm" data={[errors.enterprise.entity.address.message || '']} />
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
