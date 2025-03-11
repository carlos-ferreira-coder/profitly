import Button from '../../../components/Form/Button'
import { Controller, useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { Input } from '../../../components/Form/Input'
import { Checkbox } from '../../../components/Form/Checkbox'

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
    cpf: string
    cnpj: string
    name: string
    fantasy: string
    email: string
    phone: string
    address: string
  }

  const defaultValues = {
    allType: true,
    type: [
      { key: 'Person', name: 'Person', value: true },
      { key: 'Enterprise', name: 'Enterprise', value: true },
    ],
    allActive: true,
    active: [
      { key: true, name: 'active', value: true },
      { key: false, name: 'inactive', value: true },
    ],
    cpf: '',
    cnpj: '',
    name: '',
    email: '',
    fantasy: '',
    phone: '',
    address: '',
  }

  // Hookform
  const { reset, control, register, setValue, handleSubmit } = useForm<FilterProps>({
    defaultValues: defaultValues,
  })

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
        value.map((item: { key: boolean | string; name: string; value: boolean }) => {
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
      navigate(`/client/select${urlQuery}`)
    }
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

        <div className="mb-5.5">
          <label
            htmlFor="cnpj"
            className="mb-3 block text-sm font-medium text-black dark:text-white"
          >
            CNPJ
          </label>
          <div className="relative">
            <Input id="cnpj" type="text" {...register('cnpj')} placeholder="Digite o cnpj" />
          </div>
        </div>

        <div className="mb-5.5">
          <label
            htmlFor="name"
            className="mb-3 block text-sm font-medium text-black dark:text-white"
          >
            Nome
          </label>
          <div className="relative">
            <Input id="name" type="text" {...register('name')} placeholder="Digite o nome" />
          </div>
        </div>

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
              {...register('fantasy')}
              placeholder="Digite o nome fantasia"
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
              autoComplete="email"
              {...register('email')}
              placeholder="Digite o email"
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
              autoComplete="phone"
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
