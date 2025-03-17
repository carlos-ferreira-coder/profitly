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
import { clientDeleteSchema } from '../../../hooks/useSchema'
import { ClientProps } from '../../../types/Database'

const Form = ({ client }: { client: ClientProps }) => {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'idle' | 'request' | 'complete'>('idle')
  const [alertErrors, setAlertErrors] = useState<(string | JSX.Element)[] | null>(null)
  const [alertSuccesses, setAlertSuccesses] = useState<(string | JSX.Element)[] | null>(null)

  // Client schema
  const schema = clientDeleteSchema
  type SchemaProps = z.infer<typeof schema>

  const entity = (client.enterprise?.entity || client.person?.entity)!
  const defaultValues = {
    uuid: client.uuid,
    active: client.active,
    cpf: client.person?.cpf,
    cnpj: client.enterprise?.cnpj,
    fantasy: client.enterprise?.fantasy,
    name: entity.name,
    email: entity.email,
    phone: entity.phone,
    address: entity.address,
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

  // Delete client in backend
  const deleteClient = async (data: SchemaProps) => {
    setStatus('request')
    setAlertErrors(null)
    setAlertSuccesses(null)

    try {
      const response = await axios.delete(`/client/delete/${data.uuid}`, {
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

      setStatus('complete')
    } catch (error) {
      setAlertErrors([handleAxiosError(error)])
      setStatus('idle')
    }
  }

  return (
    <form onSubmit={handleSubmit(deleteClient)}>
      <Input id="uuid" type="text" hidden disabled {...register('uuid')} />
      {errors.uuid && <Alert type="danger" size="sm" data={[errors.uuid.message || '']} />}

      <div className="flex justify-between gap-5 mb-6">
        {client.enterprise ? (
          <div className="w-full">
            <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="cnpj">
              CNPJ
            </label>
            <div className="relative">
              <Controller
                name="cnpj"
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
            {errors.cnpj && <Alert type="danger" size="sm" data={[errors.cnpj.message || '']} />}
          </div>
        ) : (
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
          <Input
            disabled
            id="name"
            type="text"
            icon={faUserTie}
            iconPosition="left"
            {...register('name')}
            className="bg-slate-200 dark:bg-slate-700"
          />
        </div>
        {errors.name && <Alert type="danger" size="sm" data={[errors.name.message || '']} />}
      </div>

      {client.enterprise && (
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
              {...register('fantasy')}
              className="bg-slate-200 dark:bg-slate-700"
            />
          </div>
          {errors.fantasy && (
            <Alert type="danger" size="sm" data={[errors.fantasy.message || '']} />
          )}
        </div>
      )}

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

      <div className="mb-6">
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="phone">
          Contato
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
        {errors.phone && <Alert type="danger" size="sm" data={[errors.phone.message || '']} />}
      </div>

      <div className="mb-6">
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="address">
          Endereço
        </label>
        <div className="relative">
          <Input
            id="address"
            type="text"
            disabled
            icon={faLocationDot}
            iconPosition="left"
            {...register('address')}
            placeholder="Digite o endereço"
            className="bg-slate-200 dark:bg-slate-700"
          />
        </div>
        {errors.address && <Alert type="danger" size="sm" data={[errors.address.message || '']} />}
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
