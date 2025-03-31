import Button from '../../../components/Form/Button'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { Input, InputPattern } from '../../../components/Form/Input'
import { Checkbox } from '../../../components/Form/Checkbox'
import qs from 'qs'
import {
  faAddressCard,
  faEnvelope,
  faLocationDot,
  faPhone,
  faUser,
  faUserTie,
} from '@fortawesome/free-solid-svg-icons'
import { useEffect, useMemo } from 'react'

const Filter = ({
  filtering,
  setFiltering,
}: {
  filtering: 'idle' | 'filter' | 'reset'
  setFiltering: (value: 'idle' | 'filter' | 'reset') => void
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  // Filter props
  type FilterProps = {
    allType: boolean
    type: {
      key: string
      name: string
      value: boolean
    }[]
    allActive: boolean
    active: {
      key: boolean
      name: string
      value: boolean
    }[]
    person:
      | {
          cpf: string
          entity: {
            name: string
            email: string
            phone: string
            address: string
          }
        }
      | undefined
    enterprise:
      | {
          cnpj: string
          fantasy: string
          entity: {
            name: string
            email: string
            phone: string
            address: string
          }
        }
      | undefined
  }

  const defaultValues = useMemo(
    () => ({
      allType: true,
      type: [
        { key: 'person', name: 'Person', value: true },
        { key: 'enterprise', name: 'Enterprise', value: true },
      ],
      allActive: true,
      active: [
        { key: true, name: 'active', value: true },
        { key: false, name: 'inactive', value: true },
      ],
      person: {
        cpf: '',
        entity: {
          name: '',
          email: '',
          phone: '',
          address: '',
        },
      },
      enterprise: {
        cnpj: '',
        fantasy: '',
        entity: {
          name: '',
          email: '',
          phone: '',
          address: '',
        },
      },
    }),
    []
  )

  // Hookform
  const { reset, control, register, setValue, handleSubmit } = useForm<FilterProps>({
    defaultValues: defaultValues,
  })

  const type = useWatch({ control, name: 'type' })
    .filter(({ value }) => value)
    .map(({ key }) => key)

  useEffect(() => {
    if (type.includes('person')) {
      setValue('person', { ...defaultValues.person })
    } else {
      setValue('person', undefined)
    }

    if (type.includes('enterprise')) {
      setValue('enterprise', { ...defaultValues.enterprise })
    } else {
      setValue('enterprise', undefined)
    }
  }, [type, setValue, defaultValues])

  // Handle reset
  const handleReset = () => {
    if (location.search) {
      reset(defaultValues)
      navigate('/client/select')
    }
  }

  // Pass filter on url
  const filter = (data: FilterProps) => {
    setFiltering('filter')

    const query = {
      active: data.active.filter(({ value }) => value).map(({ key }) => key),
      person:
        data.type.filter(({ key, value }) => key === 'person' && value) &&
        data.person &&
        (data.person.cpf || Object.values(data.person.entity).some((value) => value !== ''))
          ? {
              cpf: data.person.cpf,
              entity: {
                name: data.person.entity.name || undefined,
                email: data.person.entity.email || undefined,
                phone: data.person.entity.phone || undefined,
                address: data.person.entity.address || undefined,
              },
            }
          : undefined,
      enterprise:
        data.type.filter(({ key, value }) => key === 'enterprise' && value) &&
        data.enterprise &&
        (data.enterprise.cnpj ||
          data.enterprise.fantasy ||
          Object.values(data.enterprise.entity).some((value) => value !== ''))
          ? {
              cnpj: data.enterprise.cnpj || undefined,
              fantasy: data.enterprise.fantasy || undefined,
              entity: {
                name: data.enterprise.entity.name || undefined,
                email: data.enterprise.entity.email || undefined,
                phone: data.enterprise.entity.phone || undefined,
                address: data.enterprise.entity.address || undefined,
              },
            }
          : undefined,
    }

    navigate(`/client/select?${qs.stringify(query, { encode: false })}`)
  }

  return (
    <>
      <form onSubmit={handleSubmit(filter)}>
        <div className="mb-5.5">
          <label
            htmlFor="allType"
            className="mb-3 block text-sm font-medium text-black dark:text-white"
          >
            Tipo
          </label>
          <div className="relative">
            <div className="mb-1">
              <Controller
                name="allType"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    label="Selecionar Todos"
                    name={field.name}
                    value={field.value}
                    onChange={(e) => {
                      const isChecked = e.target.checked

                      setValue('type.0.value', isChecked)
                      setValue('type.1.value', isChecked)

                      field.onChange(isChecked)
                    }}
                  />
                )}
              />
            </div>

            <div className="ml-2 pl-3 border-l-2">
              <Controller
                name="type.0.value"
                control={control}
                render={({ field }) => <Checkbox label="Pessoa" {...field} />}
              />
              <Controller
                name="type.1.value"
                control={control}
                render={({ field }) => <Checkbox label="Empresa" {...field} />}
              />
            </div>
          </div>
        </div>

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

        {type.includes('person') && !type.includes('enterprise') && (
          <div className="mb-5.5">
            <label
              htmlFor="cpf"
              className="mb-3 block text-sm font-medium text-black dark:text-white"
            >
              CPF
            </label>
            <div className="relative">
              <Controller
                name="person.cpf"
                control={control}
                render={({ field }) => (
                  <InputPattern
                    {...field}
                    mask="_"
                    icon={faAddressCard}
                    iconPosition="left"
                    format="###.###.###-##"
                    placeholder="Digite o cpf"
                  />
                )}
              />
            </div>
          </div>
        )}

        {!type.includes('person') && type.includes('enterprise') && (
          <div className="mb-5.5">
            <label
              htmlFor="cnpj"
              className="mb-3 block text-sm font-medium text-black dark:text-white"
            >
              CNPJ
            </label>
            <div className="relative">
              <Controller
                name="enterprise.cnpj"
                control={control}
                render={({ field }) => (
                  <InputPattern
                    {...field}
                    mask="_"
                    icon={faAddressCard}
                    iconPosition="left"
                    format="##.###.###/####-##"
                    placeholder="Digite o cnpj"
                  />
                )}
              />
            </div>
          </div>
        )}

        {type.includes('person') !== type.includes('enterprise') && (
          <div className="mb-5.5">
            <label
              htmlFor="name"
              className="mb-3 block text-sm font-medium text-black dark:text-white"
            >
              Nome
            </label>
            <div className="relative">
              {type.includes('person') && !type.includes('enterprise') && (
                <Input
                  id="name"
                  type="text"
                  icon={faUserTie}
                  iconPosition="left"
                  {...register('person.entity.name')}
                  placeholder="Digite o npme"
                />
              )}
              {!type.includes('person') && type.includes('enterprise') && (
                <Input
                  id="name"
                  type="text"
                  icon={faUserTie}
                  iconPosition="left"
                  {...register('enterprise.entity.name')}
                  placeholder="Digite o nome"
                />
              )}
            </div>
          </div>
        )}

        {!type.includes('person') && type.includes('enterprise') && (
          <div className="mb-5.5">
            <label
              htmlFor="fantasy"
              className="mb-3 block text-sm font-medium text-black dark:text-white"
            >
              Nome fantasia
            </label>
            <div className="relative">
              <Input
                id="fantasy"
                type="text"
                icon={faUser}
                iconPosition="left"
                {...register('enterprise.fantasy')}
                placeholder="Digite o nome fantasia"
              />
            </div>
          </div>
        )}

        {type.includes('person') !== type.includes('enterprise') && (
          <div className="mb-5.5">
            <label
              htmlFor="email"
              className="mb-3 block text-sm font-medium text-black dark:text-white"
            >
              Email
            </label>
            <div className="relative">
              {type.includes('person') && !type.includes('enterprise') && (
                <Input
                  id="email"
                  type="text"
                  icon={faEnvelope}
                  iconPosition="left"
                  {...register('person.entity.email')}
                  placeholder="Digite o email"
                />
              )}
              {!type.includes('person') && type.includes('enterprise') && (
                <Input
                  id="email"
                  type="text"
                  icon={faEnvelope}
                  iconPosition="left"
                  {...register('enterprise.entity.email')}
                  placeholder="Digite o email"
                />
              )}
            </div>
          </div>
        )}

        {type.includes('person') !== type.includes('enterprise') && (
          <div className="mb-5.5">
            <label
              htmlFor="phone"
              className="mb-3 block text-sm font-medium text-black dark:text-white"
            >
              Contato
            </label>
            <div className="relative">
              {type.includes('person') && !type.includes('enterprise') && (
                <Input
                  id="phone"
                  type="text"
                  icon={faPhone}
                  iconPosition="left"
                  {...register('person.entity.phone')}
                  placeholder="Digite o telefone"
                />
              )}
              {!type.includes('person') && type.includes('enterprise') && (
                <Input
                  id="phone"
                  type="text"
                  icon={faPhone}
                  iconPosition="left"
                  {...register('enterprise.entity.phone')}
                  placeholder="Digite o telefone"
                />
              )}
            </div>
          </div>
        )}

        {type.includes('person') !== type.includes('enterprise') && (
          <div className="mb-5.5">
            <label
              htmlFor="address"
              className="mb-3 block text-sm font-medium text-black dark:text-white"
            >
              Endereço
            </label>
            <div className="relative">
              {type.includes('person') && !type.includes('enterprise') && (
                <Input
                  id="address"
                  type="text"
                  icon={faLocationDot}
                  iconPosition="left"
                  {...register('person.entity.address')}
                  placeholder="Digite o endereço"
                />
              )}
              {!type.includes('person') && type.includes('enterprise') && (
                <Input
                  id="address"
                  type="text"
                  icon={faLocationDot}
                  iconPosition="left"
                  {...register('enterprise.entity.address')}
                  placeholder="Digite o endereço"
                />
              )}
            </div>
          </div>
        )}

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
