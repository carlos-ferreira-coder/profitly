import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input, InputPattern } from '../../../components/Form/Input'
import Switcher from '../../../components/Form/Switcher'
import {
  faAddressCard,
  faEnvelope,
  faLocationDot,
  faPhone,
  faUser,
  faUserTie,
} from '@fortawesome/free-solid-svg-icons'
import { api as axios, handleAxiosError } from '../../../services/Axios'
import Alert from '../../../components/Alert/Index'
import Button from '../../../components/Form/Button'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supplierSchema } from '../../../hooks/useSchema'
import { SupplierProps } from '../../../types/Database'

const Form = ({ supplier }: { supplier: SupplierProps }) => {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'idle' | 'request' | 'complete'>('idle')
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
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SchemaProps>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues,
  })

  // Delete supplier in backend
  const deleteSupplier = async (data: SchemaProps) => {
    setStatus('request')
    setAlertErrors(null)
    setAlertSuccesses(null)

    try {
      const response = await axios.delete(`/supplier/delete/${data.uuid}`, {
        withCredentials: true,
      })
      setAlertSuccesses([
        response.data.message,
        <Button
          type="button"
          color="success"
          onClick={() => navigate('/supplier/select')}
          className="h-8 w-45 bg-green-400 dark:text-form-input dark:bg-green-400"
        >
          Listar fornecedores
        </Button>,
      ])

      setStatus('complete')
    } catch (error) {
      setAlertErrors([handleAxiosError(error)])
      setStatus('idle')
    }
  }

  return (
    <form onSubmit={handleSubmit(deleteSupplier)}>
      <Input id="uuid" type="text" hidden disabled {...register('uuid')} />
      {errors.uuid && <Alert type="danger" size="sm" data={[errors.uuid.message || '']} />}

      <div className="flex justify-between gap-5 mb-6">
        {supplier.enterprise && (
          <div className="w-full">
            <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="cnpj">
              CNPJ
            </label>
            <div className="relative">
              <Controller
                name="enterprise.cnpj"
                control={control}
                render={({ field }) => (
                  <InputPattern
                    {...field}
                    disabled
                    id="cnpj"
                    mask="_"
                    icon={faAddressCard}
                    iconPosition="left"
                    format="##.###.###/####-##"
                    className="bg-slate-200 dark:bg-slate-700"
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
              CPF
            </label>
            <div className="relative">
              <Controller
                name="person.cpf"
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
              render={({ field }) => <Switcher disabled {...field} />}
            />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="name">
          Nome
        </label>
        <div className="relative">
          {supplier.person && (
            <Input
              disabled
              id="name"
              type="text"
              icon={faUserTie}
              iconPosition="left"
              {...register('person.entity.name')}
              className="bg-slate-200 dark:bg-slate-700"
            />
          )}
          {supplier.enterprise && (
            <Input
              disabled
              id="name"
              type="text"
              icon={faUserTie}
              iconPosition="left"
              {...register('enterprise.entity.name')}
              className="bg-slate-200 dark:bg-slate-700"
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
            Nome fantasia
          </label>
          <div className="relative">
            <Input
              disabled
              id="fantasy"
              type="text"
              icon={faUser}
              iconPosition="left"
              {...register('enterprise.fantasy')}
              className="bg-slate-200 dark:bg-slate-700"
            />
          </div>
          {errors.enterprise?.fantasy && (
            <Alert type="danger" size="sm" data={[errors.enterprise.fantasy.message || '']} />
          )}
        </div>
      )}

      <div className="mb-6">
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="email">
          Email
        </label>
        <div className="relative">
          {supplier.person && (
            <Input
              disabled
              id="email"
              type="text"
              icon={faEnvelope}
              iconPosition="left"
              {...register('person.entity.email')}
              className="bg-slate-200 dark:bg-slate-700"
            />
          )}
          {supplier.enterprise && (
            <Input
              disabled
              id="email"
              type="text"
              icon={faEnvelope}
              iconPosition="left"
              {...register('enterprise.entity.email')}
              className="bg-slate-200 dark:bg-slate-700"
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
          Contato
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
          Endereço
        </label>
        <div className="relative">
          {supplier.person && (
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
          )}
          {supplier.enterprise && (
            <Input
              id="address"
              type="text"
              disabled
              icon={faLocationDot}
              iconPosition="left"
              {...register('enterprise.entity.address')}
              placeholder="Digite o endereço"
              className="bg-slate-200 dark:bg-slate-700"
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
