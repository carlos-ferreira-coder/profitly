import { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { api as axios, handleAxiosError } from '../../../services/Axios'
import Alert from '../../../components/Alert/Index'
import { Input } from '../../../components/Form/Input'
import { faLock, faLockOpen, faUnlock } from '@fortawesome/free-solid-svg-icons'
import Button from '../../../components/Form/Button'
import { userUpdatePasswordSchema } from '../../../hooks/useSchema'
import { AuthProps, UserProps } from '../../../types/Database'
import { useNavigate } from 'react-router-dom'

const FormPassword = ({ user, auth }: { user: UserProps; auth: AuthProps | null }) => {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'idle' | 'request'>('idle')
  const [alertErrors, setAlertErrors] = useState<(string | JSX.Element)[] | null>(null)
  const [alertSuccesses, setAlertSuccesses] = useState<(string | JSX.Element)[] | null>(null)

  // Password schema
  const schema = userUpdatePasswordSchema(auth?.personal || false)
  type SchemaProps = z.infer<typeof schema>

  const defaultValues = {
    uuid: user.uuid,
    passwordCurrent: undefined,
    password: '',
    passwordCheck: '',
  }

  // Hookform
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SchemaProps>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues,
  })

  // Reset
  const handleReset = () => {
    setAlertErrors(null)
    setAlertSuccesses(null)
    reset(defaultValues)
  }

  // Update password on backend
  const updatePassword = async (data: SchemaProps) => {
    setStatus('request')

    setAlertErrors(null)
    setAlertSuccesses(null)

    try {
      const response = await axios.patch('/user/update/password', data, {
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
    <form onSubmit={handleSubmit(updatePassword)}>
      <Input type="text" hidden disabled {...register('uuid')} />
      {errors.uuid && <Alert type="danger" size="sm" data={[errors.uuid.message || '']} />}

      {!auth && (
        <div className="mb-5.5">
          <label
            className="mb-3 block text-sm font-medium text-black dark:text-white"
            htmlFor="passwordCurrent"
          >
            Senha antiga <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <Input
              id="passwordCurrent"
              type="password"
              icon={faLockOpen}
              iconPosition="left"
              {...register('passwordCurrent')}
              placeholder="Digite a senha antiga"
            />
          </div>
          {errors.passwordCurrent && (
            <Alert type="danger" size="sm" data={[errors.passwordCurrent.message || '']} />
          )}
        </div>
      )}

      <div className="mb-5.5">
        <label
          className="mb-3 block text-sm font-medium text-black dark:text-white"
          htmlFor="password"
        >
          Senha nova <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <Input
            id="password"
            type="password"
            icon={faLock}
            iconPosition="left"
            {...register('password')}
            placeholder="Digite a nova senha"
          />
        </div>
        {errors.password && (
          <Alert type="danger" size="sm" data={[errors.password.message || '']} />
        )}
      </div>

      <div className="mb-5.5">
        <label
          className="mb-3 block text-sm font-medium text-black dark:text-white"
          htmlFor="passwordCheck"
        >
          Confirmar senha <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <Input
            id="passwordCheck"
            type="password"
            icon={faUnlock}
            iconPosition="left"
            {...register('passwordCheck')}
            placeholder="Confirme a nova senha"
          />
        </div>
        {errors.passwordCheck && (
          <Alert type="danger" size="sm" data={[errors.passwordCheck.message || '']} />
        )}
      </div>

      {alertErrors && <Alert type="danger" size="lg" data={alertErrors} />}
      {alertSuccesses && <Alert type="success" size="lg" data={alertSuccesses} />}

      <div className="flex justify-end gap-4.5">
        <Button type="button" color="white" onClick={() => handleReset()}>
          Limpar
        </Button>
        <Button color="primary" disabled={status === 'request'} loading={status === 'request'}>
          Alterar
        </Button>
      </div>
    </form>
  )
}

export default FormPassword
