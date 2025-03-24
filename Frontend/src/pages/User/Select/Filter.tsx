import { AuthProps } from '../../../types/Database'
import Button from '../../../components/Form/Button'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { Input, InputNumeric } from '../../../components/Form/Input'
import { Checkbox } from '../../../components/Form/Checkbox'
import { useAuth } from '../../../context/AuthContext'
import {
  faAddressCard,
  faDollarSign,
  faEnvelope,
  faLocationDot,
  faPhone,
  faUser,
  faUserTie,
} from '@fortawesome/free-solid-svg-icons'
import qs from 'qs'
import { currencyToNumber } from '../../../hooks/useCurrency'

const Filter = ({
  auths,
  filtering,
  setFiltering,
}: {
  auths: AuthProps[]
  filtering: 'idle' | 'filter' | 'reset'
  setFiltering: (value: 'idle' | 'filter' | 'reset') => void
}) => {
  const { auth } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Filter props
  type FilterProps = {
    person: {
      cpf: string
      entity: {
        name: string
        email: string
        phone: string
        address: string
      }
    }
    username: string
    hourlyRateMin: string
    hourlyRateMax: string
    allActive: boolean
    active: {
      key: boolean
      name: string
      value: boolean
    }[]
    allAuthUuid: boolean
    authUuid: {
      key: string
      name: string
      value: boolean
    }[]
  }

  const defaultValues = {
    person: {
      cpf: '',
      entity: {
        name: '',
        email: '',
        phone: '',
        address: '',
      },
    },
    username: '',
    hourlyRateMin: '',
    hourlyRateMax: '',
    allActive: true,
    active: [
      { key: true, name: 'active', value: true },
      { key: false, name: 'inactive', value: true },
    ],
    allAuthUuid: true,
    authUuid: auths.reduce<{ key: string; name: string; value: boolean }[]>((acc, auth) => {
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
    name: 'authUuid',
  })

  // Watch for auth
  const authWatch = useWatch({
    control,
    name: 'authUuid',
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

    const query = {
      username: data.username || undefined,
      hourlyRateMin: data.hourlyRateMin ? currencyToNumber(data.hourlyRateMin, 'BRL') : undefined,
      hourlyRateMax: data.hourlyRateMax ? currencyToNumber(data.hourlyRateMax, 'BRL') : undefined,
      active: data.active.filter(({ value }) => value).map(({ key }) => key),
      authUuid: data.authUuid.filter(({ value }) => value).map(({ key }) => key),
      person:
        data.person.cpf || Object.values(data.person.entity).some((value) => value !== '')
          ? {
              cpf: data.person.cpf || undefined,
              entity: Object.values(data.person.entity).some((value) => value !== '')
                ? {
                    name: data.person.entity.name || undefined,
                    email: data.person.entity.email || undefined,
                    phone: data.person.entity.phone || undefined,
                    address: data.person.entity.address || undefined,
                  }
                : undefined,
            }
          : undefined,
    }

    navigate(`/user/select?${qs.stringify(query, { encode: false })}`)
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
              id="username"
              type="text"
              icon={faUserTie}
              iconPosition="left"
              {...register('username')}
              placeholder="Digite o nome do usuário"
            />
          </div>
        </div>

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
              icon={faEnvelope}
              iconPosition="left"
              {...register('person.entity.email')}
              placeholder="Digite o email"
            />
          </div>
        </div>

        {auth?.personal && (
          <>
            <div className="mb-5.5">
              <label
                htmlFor="name"
                className="mb-3 block text-sm font-medium text-black dark:text-white"
              >
                Nome completo
              </label>
              <div className="relative">
                <Input
                  id="name"
                  type="text"
                  icon={faUser}
                  iconPosition="left"
                  {...register('person.entity.name')}
                  placeholder="Digite o nome completo"
                />
              </div>
            </div>

            <div className="mb-5.5">
              <label
                htmlFor="cpf"
                className="mb-3 block text-sm font-medium text-black dark:text-white"
              >
                CPF
              </label>
              <div className="relative">
                <Input
                  id="cpf"
                  type="text"
                  icon={faAddressCard}
                  iconPosition="left"
                  {...register('person.cpf')}
                  placeholder="Digite o cpf"
                />
              </div>
            </div>

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
                  icon={faPhone}
                  iconPosition="left"
                  {...register('person.entity.phone')}
                  placeholder="Digite o telefone"
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
                  icon={faLocationDot}
                  iconPosition="left"
                  {...register('person.entity.address')}
                  placeholder="Digite o endereço"
                />
              </div>
            </div>
          </>
        )}

        {auth?.financial && (
          <>
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
                      id="hourlyRate"
                      icon={faDollarSign}
                      iconPosition="left"
                      prefix={'R$ '}
                      fixedDecimalScale
                      decimalScale={2}
                      allowNegative={false}
                      decimalSeparator=","
                      thousandSeparator="."
                      placeholder="Digite o valor da hora minimo"
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
                      id="hourlyRate"
                      icon={faDollarSign}
                      iconPosition="left"
                      prefix={'R$ '}
                      fixedDecimalScale
                      decimalScale={2}
                      allowNegative={false}
                      decimalSeparator=","
                      thousandSeparator="."
                      placeholder="Digite o valor da hora maximo"
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
            Ativo
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
                name="allAuthUuid"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    label="Selecionar Todos"
                    name={field.name}
                    value={field.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const isChecked = e.target.checked

                      auths.map((_auth, i) => {
                        setValue(`authUuid.${i}.value`, isChecked)
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
                  name={`authUuid.${index}.value`}
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
