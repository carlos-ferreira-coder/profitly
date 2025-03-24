import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '../../../components/Form/Input'
import { faAlignLeft, faCalendar, faProjectDiagram } from '@fortawesome/free-solid-svg-icons'
import { api as axios, handleAxiosError } from '../../../services/Axios'
import Alert from '../../../components/Alert/Index'
import Button from '../../../components/Form/Button'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { projectDeleteSchema } from '../../../hooks/useSchema'
import { ProjectProps } from '../../../types/Database'
import Switcher from '../../../components/Form/Switcher'

const Form = ({ project }: { project: ProjectProps }) => {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'idle' | 'request' | 'complete'>('idle')
  const [alertErrors, setAlertErrors] = useState<(string | JSX.Element)[] | null>(null)
  const [alertSuccesses, setAlertSuccesses] = useState<(string | JSX.Element)[] | null>(null)

  // Project schema
  const schema = projectDeleteSchema
  type SchemaProps = z.infer<typeof schema>

  const defaultValues = {
    uuid: project.uuid,
    name: project.name,
    description: project.description,
    register: project.register,
    active: project.active,
    userUuid: project.userUuid,
    clientUuid: project.clientUuid,
    statusUuid: project.statusUuid,
    budgetUuid: project.budgetUuid,
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

  // Delete project in backend
  const deleteProject = async (data: SchemaProps) => {
    setStatus('request')
    setAlertErrors(null)
    setAlertSuccesses(null)

    try {
      const response = await axios.delete(`/project/delete/${data.uuid}`, {
        withCredentials: true,
      })
      setAlertSuccesses([
        response.data.message,
        <Button
          type="button"
          color="success"
          onClick={() => navigate('/project/select')}
          className="h-8 w-35 bg-green-400 dark:text-form-input dark:bg-green-400"
        >
          Listar Projetos
        </Button>,
      ])

      setStatus('complete')
    } catch (error) {
      setAlertErrors([handleAxiosError(error)])
      setStatus('idle')
    }
  }

  return (
    <form onSubmit={handleSubmit(deleteProject)}>
      <Input id="uuid" type="text" hidden disabled {...register('uuid')} />
      {errors.uuid && <Alert type="danger" size="sm" data={[errors.uuid.message || '']} />}

      <div className="flex justify-between gap-5 mb-6">
        <div className="w-full">
          <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="name">
            Nome
          </label>
          <div className="relative">
            <Input
              id="name"
              type="text"
              disabled
              icon={faProjectDiagram}
              iconPosition="left"
              {...register('name')}
              className="bg-slate-200 dark:bg-slate-700"
            />
          </div>
          {errors.name && <Alert type="danger" size="sm" data={[errors.name.message || '']} />}
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
              render={({ field }) => <Switcher disabled {...field} />}
            />
          </div>
        </div>
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
            id="description"
            type="text"
            disabled
            icon={faAlignLeft}
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
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="register">
          Registro
        </label>
        <div className="relative">
          <Input
            id="register"
            type="text"
            disabled
            icon={faCalendar}
            iconPosition="left"
            {...register('register')}
            className="bg-slate-200 dark:bg-slate-700"
          />
        </div>
        {errors.register && (
          <Alert type="danger" size="sm" data={[errors.register.message || '']} />
        )}
      </div>

      {project.user && (
        <>
          <div className="mb-6">
            <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="user">
              Usuário
            </label>
            <div className="relative">
              <Input id="user" type="text" hidden disabled {...register('userUuid')} />

              <div className="flex flex-col text-black dark:text-white p-3 shadow-1 rounded-md border border-stroke dark:border-strokedark dark:bg-form-input/50">
                <p>
                  <b>Cargo/Função: </b> {project.user.auth.name}
                </p>
                <p>
                  <b>Nome do usuário: </b> {project.user.username}
                </p>
                <p>
                  <b>Email: </b> {project.user.person.entity.email}
                </p>
              </div>
            </div>
            {errors.userUuid && (
              <Alert type="danger" size="sm" data={[errors.userUuid.message || '']} />
            )}
          </div>
        </>
      )}

      <div className="mb-6">
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="client">
          Cliente
        </label>
        <div className="relative">
          <Input id="client" type="text" hidden disabled {...register('clientUuid')} />

          <div className="flex flex-col text-black dark:text-white p-3 shadow-1 rounded-md border border-stroke dark:border-strokedark dark:bg-form-input/50">
            {project.client.enterprise && (
              <>
                <p>
                  <b>Nome: </b> {project.client.enterprise.entity.name}
                </p>
                <p>
                  <b>Nome fantasia: </b> {project.client.enterprise.fantasy}
                </p>
                <p>
                  <b>CNPJ: </b> {project.client.enterprise.cnpj}
                </p>
              </>
            )}
            {project.client.person && (
              <>
                <p>
                  <b>Nome: </b> {project.client.person.entity.name}
                </p>
                <p>
                  <b>CPF: </b> {project.client.person.cpf}
                </p>
              </>
            )}
          </div>
        </div>
        {errors.clientUuid && (
          <Alert type="danger" size="sm" data={[errors.clientUuid.message || '']} />
        )}
      </div>

      <div className="mb-6">
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="status">
          Status
        </label>
        <div className="relative">
          <Input id="status" type="text" hidden disabled {...register('statusUuid')} />

          <div className="flex flex-col text-black dark:text-white p-3 shadow-1 rounded-md border border-stroke dark:border-strokedark dark:bg-form-input/50">
            <p>
              <b>Nome: </b> {project.status.name}
            </p>
            <p>
              <b>Descrição: </b> {project.status.description}
            </p>
            <p>
              <b>Prioridade: </b>
              {project.status.priority < 4
                ? 'Alta'
                : project.status.priority < 8
                ? 'Média'
                : 'Baixa'}
            </p>
          </div>
        </div>
        {errors.statusUuid && (
          <Alert type="danger" size="sm" data={[errors.statusUuid.message || '']} />
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
