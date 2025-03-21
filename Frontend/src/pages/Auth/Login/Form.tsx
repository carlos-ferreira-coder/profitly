import { useState, useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { faEnvelope, faGears, faIdCard, faLock, faUser } from '@fortawesome/free-solid-svg-icons'
import { api as axios, handleAxiosError } from '../../../services/Axios'
import { Input, InputPattern } from '../../../components/Form/Input'
import Alert from '../../../components/Alert/Index'
import Button from '../../../components/Form/Button'
import { Select } from '../../../components/Form/Select'
import { loginSchema } from '../../../hooks/useSchema'
import { useUser } from '../../../context/UserContext'
import { useAuth } from '../../../context/AuthContext'
import { Checkbox } from '../../../components/Form/Checkbox'

const Form = () => {
  const navigate = useNavigate()
  const { setUser } = useUser()
  const { setAuth } = useAuth()
  const [request, setRequest] = useState<'idle' | 'request'>('idle')
  const [alertErrors, setAlertErrors] = useState<(string | JSX.Element)[] | null>(null)
  const [alertWarnings, setAlertWarnings] = useState<(string | JSX.Element)[] | null>(null)
  const [alertSuccesses, setAlertSuccesses] = useState<(string | JSX.Element)[] | null>(null)

  useEffect(() => {
    // Set alerts
    ;['errors', 'warnings', 'successes'].forEach((item) => {
      const message = sessionStorage.getItem(item)

      if (message) {
        if (item === 'errors') setAlertErrors([message])
        if (item === 'warnings') setAlertWarnings([message])
        if (item === 'successes') setAlertSuccesses([message])

        sessionStorage.removeItem(item)
      }
    })
  }, [])

  // schema
  const schema = loginSchema
  type SchemaProps = z.infer<typeof schema>

  const defaultValues = {
    type: 'username',
    cpf: undefined,
    email: undefined,
    username: undefined,
    password: '',
    rememberMe: false,
  }

  // Hookform
  const {
    watch,
    control,
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<SchemaProps>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues,
  })

  const type = useWatch({ control, name: 'type' })

  useEffect(() => {
    setValue('cpf', undefined)
    setValue('email', undefined)
    setValue('username', undefined)
  }, [type, setValue])

  // Login on server
  const login = async (data: SchemaProps) => {
    setRequest('request')

    setAlertErrors(null)
    setAlertWarnings(null)
    setAlertSuccesses(null)

    try {
      await axios.post('/auth/login', data, {
        withCredentials: true,
      })

      const [thisUser, thisAuth] = await Promise.all([
        axios.get('/user/select/this', { withCredentials: true }),
        axios.get('/auth/select/this', { withCredentials: true }),
      ])

      setUser(thisUser.data[0])
      setAuth(thisAuth.data[0])

      navigate('/home')
    } catch (error) {
      setAlertErrors([handleAxiosError(error)])
    }

    setRequest('idle')
  }

  return (
    <form onSubmit={handleSubmit(login)}>
      {alertErrors && <Alert type="danger" size="lg" data={alertErrors} />}
      {alertWarnings && <Alert type="warning" size="lg" data={alertWarnings} />}
      {alertSuccesses && <Alert type="success" size="lg" data={alertSuccesses} />}

      <div className="mb-6">
        <div className="relative">
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                icon={faGears}
                iconPosition="left"
                options={[
                  { value: 'cpf', label: 'cpf', disabled: false },
                  { value: 'email', label: 'email', disabled: false },
                  { value: 'username', label: 'nome de usuário', disabled: false },
                ]}
              />
            )}
          />
        </div>
        {errors.type && <Alert type="danger" size="sm" data={[errors.type.message || '']} />}
      </div>

      <div className="mb-6" style={{ display: watch().type === 'cpf' ? 'block' : 'none' }}>
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
                icon={faIdCard}
                iconPosition="left"
                format="###.###.###-##"
                placeholder="Digite o cpf"
              />
            )}
          />
        </div>
        {errors.cpf && <Alert type="danger" size="sm" data={[errors.cpf.message || '']} />}
      </div>

      <div className="mb-6" style={{ display: watch().type === 'email' ? 'block' : 'none' }}>
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="email">
          Email <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <Input
            id="email"
            type="text"
            icon={faEnvelope}
            iconPosition="left"
            placeholder="Digite o email"
            {...register('email')}
          />
        </div>
        {errors.email && <Alert type="danger" size="sm" data={[errors.email.message || '']} />}
      </div>

      <div className="mb-6" style={{ display: watch().type === 'username' ? 'block' : 'none' }}>
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="username">
          Nome de usuário <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <Input
            id="username"
            type="text"
            icon={faUser}
            iconPosition="left"
            placeholder="Digite o nome de usuário"
            {...register('username')}
          />
        </div>
        {errors.username && (
          <Alert type="danger" size="sm" data={[errors.username.message || '']} />
        )}
      </div>

      <div className="mb-6">
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="password">
          Senha <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <Input
            id="password"
            type="password"
            icon={faLock}
            iconPosition="left"
            placeholder="Digite a senha"
            {...register('password')}
          />
        </div>
        {errors.password && (
          <Alert type="danger" size="sm" data={[errors.password.message || '']} />
        )}
      </div>

      <div className="mb-6">
        <Controller
          name="rememberMe"
          control={control}
          render={({ field }) => <Checkbox label=" Manter-me logado " {...field} />}
        />
        {errors.rememberMe && (
          <Alert type="danger" size="sm" data={[errors.rememberMe.message || '']} />
        )}
      </div>

      <div className="mb-5 mt-10">
        <Button color="primary" disabled={request === 'request'} loading={request === 'request'}>
          Entrar
        </Button>
      </div>
    </form>
  )
}

export default Form
