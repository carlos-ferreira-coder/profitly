import { AuthProps } from '../../../types/Database'
import Button from '../../../components/Form/Button'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { Input, InputNumeric } from '../../../components/Form/Input'
import { Checkbox } from '../../../components/Form/Checkbox'

const Filter = ({
  auths,
  auth,
  filtering,
  setFiltering,
}: {
  auths: AuthProps[]
  auth: boolean
  filtering: 'idle' | 'filter' | 'reset'
  setFiltering: (value: 'idle' | 'filter' | 'reset') => void
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  // Filter props
  type FilterProps = {
    cpf: string
    email: string
    username: string
    phone: string
    address: string
    hourlyRateMin: string
    hourlyRateMax: string
    allActive: boolean
    active: {
      key: boolean
      name: string
      value: boolean
    }[]
    allAuth: boolean
    auth: {
      key: string
      name: string
      value: boolean
    }[]
  }

  const defaultValues = {
    cpf: '',
    email: '',
    username: '',
    phone: '',
    address: '',
    hourlyRateMin: '',
    hourlyRateMax: '',
    allStatus: true,
    status: [
      { key: true, name: 'active', value: true },
      { key: false, name: 'inactive', value: true },
    ],
    allAuth: true,
    auth: auths.reduce<{ key: string; name: string; value: boolean }[]>((acc, auth) => {
      acc.push({ key: auth.uuid, name: auth.name, value: true })
      return acc
    }, []),
  }

  // Hookform
  const { reset, control, register, setValue, handleSubmit } = useForm<FilterProps>({
    defaultValues: defaultValues,
  })

  // FildArray for auth
  const { fields } = useFieldArray({
    control,
    name: 'auth',
  })

  // Watch for auth
  const authWatch = useWatch({
    control,
    name: 'auth',
  })

  // Handle reset
  const handleReset = () => {
    if (location.search) {
      reset(defaultValues)
      navigate('/user/select')
    }
  }

  // Pass filter on url
  const filter = (data: FilterProps) => {
    setFiltering('filter')
    let urlQuery = ''

    // Function to add query in url
    const appendQuery = (key: string, value: string) => {
      const encodeKey = encodeURIComponent(key)
      const encodeValue = encodeURIComponent(value)

      if (urlQuery === '') {
        return `?${encodeKey}=${encodeValue}`
      }
      return `${urlQuery}&${encodeKey}=${encodeValue}`
    }

    // Get all filters
    ;(Object.keys(data) as Array<keyof FilterProps>).forEach((key) => {
      const value = data[key]

      if (typeof value === 'string') {
        if (value !== '') urlQuery = appendQuery(key, value)
      }

      if (typeof value === 'object') {
        let keys = ''
        value.map((item: { key: string | boolean; name: string; value: boolean }) => {
          if (item.value) {
            if (keys === '') keys = `${item.key}`
            else keys = `${keys},${item.key}`
          }
        })
        if (keys !== '') urlQuery = appendQuery(key, keys)
      }
    })

    if (location.search === urlQuery) {
      setFiltering('idle')
    } else {
      navigate(`/user/select${urlQuery}`)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(filter)}>
        <div className="mb-5.5">
          <label
            htmlFor="username"
            className="mb-3 block text-sm font-medium text-black dark:text-white"
          >
            Nome de usuário
          </label>
          <div className="relative">
            <Input
              type="text"
              id="username"
              autoComplete="name"
              {...register('username')}
              placeholder="Digite o usuário"
            />
          </div>
        </div>

        {auth && (
          <>
            <div className="mb-5.5">
              <label
                htmlFor="cpf"
                className="mb-3 block text-sm font-medium text-black dark:text-white"
              >
                CPF
              </label>
              <div className="relative">
                <Input id="cpf" type="text" {...register('cpf')} placeholder="Digite o cpf" />
              </div>
            </div>
          </>
        )}

        <div className="mb-5.5">
          <label
            htmlFor="email"
            className="mb-3 block text-sm font-medium text-black dark:text-white"
          >
            Email
          </label>
          <div className="relative">
            <Input
              id="email"
              type="text"
              autoComplete="email"
              {...register('email')}
              placeholder="Digite o email"
            />
          </div>
        </div>

        {auth && (
          <>
            <div className="mb-5.5">
              <label
                htmlFor="phone"
                className="mb-3 block text-sm font-medium text-black dark:text-white"
              >
                Contato
              </label>
              <div className="relative">
                <Input
                  id="phone"
                  type="text"
                  {...register('phone')}
                  placeholder="Digite o contato"
                />
              </div>
            </div>

            <div className="mb-5.5">
              <label
                htmlFor="address"
                className="mb-3 block text-sm font-medium text-black dark:text-white"
              >
                Endereço
              </label>
              <div className="relative">
                <Input
                  id="address"
                  type="text"
                  {...register('address')}
                  placeholder="Digite o endereço"
                />
              </div>
            </div>

            <div className="mb-5.5">
              <label
                htmlFor="hourlyRateMin"
                className="mb-3 block text-sm font-medium text-black dark:text-white"
              >
                Valor minimo da Hora
              </label>
              <div className="relative">
                <Controller
                  name="hourlyRateMin"
                  control={control}
                  render={({ field }) => (
                    <InputNumeric
                      {...field}
                      id="hourlyRateMin"
                      prefix={'R$ '}
                      fixedDecimalScale
                      decimalScale={2}
                      allowNegative={false}
                      decimalSeparator=","
                      thousandSeparator="."
                      placeholder="Digite o valor minimo."
                    />
                  )}
                />
              </div>
            </div>

            <div className="mb-5.5">
              <label
                htmlFor="hourlyRateMax"
                className="mb-3 block text-sm font-medium text-black dark:text-white"
              >
                Valor máximo da Hora
              </label>
              <div className="relative">
                <Controller
                  name="hourlyRateMax"
                  control={control}
                  render={({ field }) => (
                    <InputNumeric
                      {...field}
                      id="hourlyRateMax"
                      prefix={'R$ '}
                      fixedDecimalScale
                      decimalScale={2}
                      allowNegative={false}
                      decimalSeparator=","
                      thousandSeparator="."
                      placeholder="Digite o valor máximo."
                    />
                  )}
                />
              </div>
            </div>
          </>
        )}

        <div className="mb-5.5">
          <label
            htmlFor="allActive"
            className="mb-3 block text-sm font-medium text-black dark:text-white"
          >
            Status
          </label>
          <div className="relative">
            <div className="mb-1">
              <Controller
                name="allActive"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    label="Selecionar Todos"
                    name={field.name}
                    value={field.value}
                    onChange={(e) => {
                      const isChecked = e.target.checked

                      setValue('active.0.value', isChecked)
                      setValue('active.1.value', isChecked)

                      field.onChange(isChecked)
                    }}
                  />
                )}
              />
            </div>

            <div className="ml-2 pl-3 border-l-2">
              <Controller
                name="active.0.value"
                control={control}
                render={({ field }) => <Checkbox label="Ativo" {...field} />}
              />
              <Controller
                name="active.1.value"
                control={control}
                render={({ field }) => <Checkbox label="Inativo" {...field} />}
              />
            </div>
          </div>
        </div>

        <div className="mb-5.5">
          <label
            htmlFor="allAuth"
            className="mb-3 block text-sm font-medium text-black dark:text-white"
          >
            Cargo / Função
          </label>
          <div className="relative">
            <div className="mb-1">
              <Controller
                name="allAuth"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    label="Selecionar Todos"
                    name={field.name}
                    value={field.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const isChecked = e.target.checked

                      auths.map((_auth, i) => {
                        setValue(`auth.${i}.value`, isChecked)
                      })

                      field.onChange(isChecked)
                    }}
                  />
                )}
              />
            </div>
            <div className="ml-2 pl-3 border-l-2">
              {fields.map((field, index) => (
                <Controller
                  key={field.id}
                  name={`auth.${index}.value`}
                  control={control}
                  render={({ field }) => <Checkbox label={authWatch?.[index]?.name} {...field} />}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-5.5">
          <Button
            color="white"
            type="button"
            onClick={() => handleReset()}
            disabled={filtering !== 'idle'}
            loading={filtering === 'reset'}
          >
            Limpar
          </Button>
          <Button color="primary" disabled={filtering !== 'idle'} loading={filtering === 'filter'}>
            Filtrar
          </Button>
        </div>
      </form>
    </>
  )
}

export default Filter
