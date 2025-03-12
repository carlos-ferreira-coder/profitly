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
import { supplierUpdateSchema } from '../../../hooks/useSchema'

const Form = ({ supplier }: { supplier: SupplierProps }) => {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'idle' | 'request'>('idle')
  const [alertErrors, setAlertErrors] = useState<(string | JSX.Element)[] | null>(null)
  const [alertSuccesses, setAlertSuccesses] = useState<(string | JSX.Element)[] | null>(null)

  // Supplier schema
  const schema = supplierUpdateSchema
  type SchemaProps = z.infer<typeof schema>

  const entity = (supplier.enterprise?.entity || supplier.person?.entity)!
  const defaultValues = {
    uuid: supplier.uuid,
    active: supplier.active,
    cpf: supplier.person?.cpf,
    cnpj: supplier.enterprise?.cnpj,
    fantasy: supplier.enterprise?.fantasy,
    name: entity.name,
    email: entity.email,
    phone: entity.phone,
    address: entity.address,
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
        {supplier.enterprise ? (
          <div className="w-full">
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
                  />
                )}
              />
            </div>
            {errors.cnpj && <Alert type="danger" size="sm" data={[errors.cnpj.message || '']} />}
          </div>
        ) : (
          <div className="w-full">
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
                  />
                )}
              />
            </div>
            {errors.cpf && <Alert type="danger" size="sm" data={[errors.cpf.message || '']} />}
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
          <Input id="name" type="text" icon={faUserTie} iconPosition="left" {...register('name')} />
        </div>
        {errors.name && <Alert type="danger" size="sm" data={[errors.name.message || '']} />}
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
              {...register('fantasy')}
            />
          </div>
          {errors.fantasy && (
            <Alert type="danger" size="sm" data={[errors.fantasy.message || '']} />
          )}
        </div>
      )}

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
            {...register('email')}
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
