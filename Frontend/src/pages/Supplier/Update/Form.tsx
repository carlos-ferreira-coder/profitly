import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Input, InputPattern } from '../../../components/Form/Input'
import { api as axios, handleAxiosError } from '../../../services/Axios'
import Alert from '../../../components/Alert/Index'
import Button from '../../../components/Form/Button'
import {
  faAddressCard,
  faEnvelope,
  faLocationDot,
  faPhone,
  faUser,
  faUserTie,
} from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { SupplierProps } from '../../../types/Database'
import Switcher from '../../../components/Form/Switcher'
import { supplierSchema } from '../../../hooks/useSchema'

const Form = ({ supplier }: { supplier: SupplierProps }) => {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'idle' | 'request'>('idle')
  const [alertErrors, setAlertErrors] = useState<(string | JSX.Element)[] | null>(null)
  const [alertSuccesses, setAlertSuccesses] = useState<(string | JSX.Element)[] | null>(null)

  // Supplier schema
  const schema = supplierSchema
  type SchemaProps = z.infer<typeof schema>

  const defaultValues = {
    ...supplier,
    person: supplier.person
      ? {
          ...supplier.person,
          entity: {
            ...supplier.person.entity,
            phone: supplier.person.entity.phone || '',
            address: supplier.person.entity.address || '',
          },
        }
      : undefined,
    enterprise: supplier.enterprise
      ? {
          ...supplier.enterprise,
          entity: {
            ...supplier.enterprise.entity,
            phone: supplier.enterprise.entity.phone || '',
            address: supplier.enterprise.entity.address || '',
          },
        }
      : undefined,
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

  // Update supplier in backend
  const updateSupplier = async (data: SchemaProps) => {
    setStatus('request')
    setAlertErrors(null)
    setAlertSuccesses(null)

    try {
      const response = await axios.put('/supplier/update', data, {
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
    <form onSubmit={handleSubmit(updateSupplier)}>
      <Input id="uuid" type="text" hidden disabled {...register('uuid')} />
      {errors.uuid && <Alert type="danger" size="sm" data={[errors.uuid.message || '']} />}

      <div className="flex justify-between gap-5 mb-6">
        {supplier.enterprise && (
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
                    disabled
                    icon={faAddressCard}
                    iconPosition="left"
                    format="##.###.###/####-##"
                  />
                )}
              />
            </div>
            {errors.enterprise?.cnpj && (
              <Alert type="danger" size="sm" data={[errors.enterprise.cnpj.message || '']} />
            )}
          </div>
        )}
        {supplier.person && (
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
                  />
                )}
              />
            </div>
            {errors.person?.cpf && (
              <Alert type="danger" size="sm" data={[errors.person.cpf.message || '']} />
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
          {supplier.person && (
            <Input
              id="name"
              type="text"
              icon={faUserTie}
              iconPosition="left"
              {...register('person.entity.name')}
            />
          )}
          {supplier.enterprise && (
            <Input
              id="name"
              type="text"
              icon={faUserTie}
              iconPosition="left"
              {...register('enterprise.entity.name')}
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

      {supplier.enterprise && (
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
          {supplier.person && (
            <Input
              id="email"
              type="text"
              icon={faEnvelope}
              iconPosition="left"
              {...register('person.entity.email')}
            />
          )}
          {supplier.enterprise && (
            <Input
              id="email"
              type="text"
              icon={faEnvelope}
              iconPosition="left"
              {...register('enterprise.entity.email')}
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
          {supplier.person && (
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
          {supplier.enterprise && (
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
          {supplier.person && (
            <Input
              id="address"
              type="text"
              icon={faLocationDot}
              iconPosition="left"
              {...register('person.entity.address')}
              placeholder="Digite o endereço"
            />
          )}
          {supplier.enterprise && (
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
