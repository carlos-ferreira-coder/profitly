import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { faAlignCenter, faBarsProgress, faExclamation } from '@fortawesome/free-solid-svg-icons'
import { Input } from '../../../components/Form/Input'
import Button from '../../../components/Form/Button'
import { statusDeleteSchema } from '../../../hooks/useSchema'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { StatusProps } from '../../../types/Database'
import { api as axios, handleAxiosError } from '../../../services/Axios'
import Alert from '../../../components/Alert/Index'

const Form = ({ status }: { status: StatusProps }) => {
  const navigate = useNavigate()
  const [request, setRequest] = useState<'idle' | 'request' | 'complete'>('idle')
  const [alertErrors, setAlertErrors] = useState<(string | JSX.Element)[] | null>(null)
  const [alertSuccesses, setAlertSuccesses] = useState<(string | JSX.Element)[] | null>(null)

  // Status schema
  const schema = statusDeleteSchema
  type SchemaProps = z.infer<typeof schema>

  const defaultValues = {
    uuid: status.uuid,
    name: status.name,
    description: status.description,
    priority: `${status.priority} - ${
      status.priority < 4 ? 'Alta' : status.priority < 8 ? 'Média' : 'Baixa'
    }`,
  }

  // Hookform
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SchemaProps>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues,
  })

  // Delete status in backend
  const deleteStatus = async (data: SchemaProps) => {
    setRequest('request')
    setAlertErrors(null)
    setAlertSuccesses(null)

    try {
      const response = await axios.delete(`/status/delete/${data.uuid}`, {
        withCredentials: true,
      })

      setAlertSuccesses([
        response.data.message,
        <Button
          type="button"
          color="success"
          onClick={() => navigate('/status/select')}
          className="h-8 w-35 bg-green-400 dark:text-form-input dark:bg-green-400"
        >
          Listar status
        </Button>,
      ])

      setRequest('complete')
    } catch (error) {
      setAlertErrors([handleAxiosError(error)])
      setRequest('idle')
    }
  }

  return (
    <form onSubmit={handleSubmit(deleteStatus)}>
      <Input id="uuid" type="text" hidden disabled {...register('uuid')} />

      <div className="mb-6">
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="name">
          Status
        </label>
        <div className="relative">
          <Input
            disabled
            id="name"
            type="text"
            icon={faBarsProgress}
            iconPosition="left"
            {...register('name')}
            className="bg-slate-200 dark:bg-slate-700"
          />
        </div>
        {errors.name && <Alert type="danger" size="sm" data={[errors.name.message || '']} />}
      </div>

      <div className="mb-6">
        <label
          className="mb-2.5 block font-medium text-black dark:text-white"
          htmlFor="description"
        >
          Descrição
        </label>
        <div className="relative">
          <Input
            disabled
            id="description"
            type="text"
            icon={faAlignCenter}
            iconPosition="left"
            {...register('description')}
            className="bg-slate-200 dark:bg-slate-700"
          />
        </div>
        {errors.description && (
          <Alert type="danger" size="sm" data={[errors.description.message || '']} />
        )}
      </div>

      <div className="mb-6">
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="priority">
          Prioridade
        </label>
        <div className="relative">
          <Input
            disabled
            id="priority"
            type="text"
            icon={faExclamation}
            iconPosition="left"
            {...register('priority')}
            className="bg-slate-200 dark:bg-slate-700"
          />
        </div>
        {errors.priority && (
          <Alert type="danger" size="sm" data={[errors.priority.message || '']} />
        )}
      </div>

      {alertErrors && <Alert type="danger" size="lg" data={alertErrors} />}
      {alertSuccesses && <Alert type="success" size="lg" data={alertSuccesses} />}

      <div className="flex justify-between gap-5">
        <Button
          color="danger"
          disabled={request === 'request' || request === 'complete'}
          loading={request === 'request'}
        >
          Deletar
        </Button>
      </div>
    </form>
  )
}

export default Form
