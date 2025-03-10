import { useNavigate } from 'react-router-dom'
import { statusUpdateSchema } from '../../../hooks/useSchema'
import { StatusProps } from '../../../types/Database'
import { Input } from '../../../components/Form/Input'
import { Select, Options } from '../../../components/Form/Select'
import Button from '../../../components/Form/Button'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { faAlignCenter, faBarsProgress, faExclamation } from '@fortawesome/free-solid-svg-icons'
import { api as axios, handleAxiosError } from '../../../services/Axios'
import Alert from '../../../components/Alert/Index'

const Form = ({ status }: { status: StatusProps }) => {
  const options: Options[] = [
    { value: -1, label: 'Selecione uma prioridade', disabled: true },
    { value: 1, label: '1 - Alta', disabled: false },
    { value: 2, label: '2 - Alta', disabled: false },
    { value: 3, label: '3 - Alta', disabled: false },
    { value: 4, label: '4 - Média', disabled: false },
    { value: 5, label: '5 - Média', disabled: false },
    { value: 6, label: '6 - Média', disabled: false },
    { value: 7, label: '7 - Média', disabled: false },
    { value: 8, label: '8 - Baixa', disabled: false },
    { value: 9, label: '9 - Baixa', disabled: false },
    { value: 10, label: '10 - Baixa', disabled: false },
  ]
  const navigate = useNavigate()
  const [request, setRequest] = useState<'idle' | 'request'>('idle')
  const [alertErrors, setAlertErrors] = useState<(string | JSX.Element)[] | null>(null)
  const [alertSuccesses, setAlertSuccesses] = useState<(string | JSX.Element)[] | null>(null)

  // status schema
  const schema = statusUpdateSchema
  type SchemaProps = z.infer<typeof schema>

  const defaultValues = {
    uuid: status.uuid,
    name: status.name,
    description: status.description,
    priority: status.priority,
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

  // Update status in backend
  const updateStatus = async (data: SchemaProps) => {
    setRequest('request')
    setAlertErrors(null)
    setAlertSuccesses(null)

    try {
      const response = await axios.put('/status/update', data, {
        withCredentials: true,
      })
      setAlertSuccesses([
        response.data.message,
        <Button
          type="button"
          color="success"
          onClick={() => navigate('/status/select')}
          className="h-8 w-50 bg-green-400 dark:text-form-input dark:bg-green-400"
        >
          Listar status
        </Button>,
      ])
    } catch (error) {
      setAlertErrors([handleAxiosError(error)])
    }

    setRequest('idle')
  }

  return (
    <form onSubmit={handleSubmit(updateStatus)}>
      <Input id="uuid" type="text" hidden disabled {...register('uuid')} />

      <div className="mb-6">
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="name">
          Status <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <Input
            id="name"
            type="text"
            icon={faBarsProgress}
            iconPosition="left"
            autoComplete="name"
            {...register('name')}
            placeholder="Digite o status"
          />
        </div>
        {errors.name && <Alert type="danger" size="sm" data={[errors.name.message || '']} />}
      </div>

      <div className="mb-6">
        <label
          className="mb-2.5 block font-medium text-black dark:text-white"
          htmlFor="description"
        >
          Descrição <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <Input
            id="description"
            type="text"
            icon={faAlignCenter}
            iconPosition="left"
            {...register('description')}
            placeholder="Digite a descrição"
          />
        </div>
        {errors.description && (
          <Alert type="danger" size="sm" data={[errors.description.message || '']} />
        )}
      </div>

      <div className="mb-6">
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="priority">
          Prioridade <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                id="priority"
                icon={faExclamation}
                iconPosition="left"
                options={options}
              />
            )}
          />
        </div>
        {errors.priority && (
          <Alert type="danger" size="sm" data={[errors.priority.message || '']} />
        )}
      </div>

      {alertErrors && <Alert type="danger" size="lg" data={alertErrors} />}
      {alertSuccesses && <Alert type="success" size="lg" data={alertSuccesses} />}

      <div className="flex justify-between gap-5">
        <Button color="white" type="button" onClick={() => handleReset()}>
          Limpar
        </Button>
        <Button color="primary" disabled={request === 'request'} loading={request === 'request'}>
          Editar
        </Button>
      </div>
    </form>
  )
}

export default Form
