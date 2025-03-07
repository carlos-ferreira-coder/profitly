import Button from '../../../components/Form/Button'
import { Controller, useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
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
    allAuth: boolean
    auth: {
      name: string
      value: boolean
    }[]
  }

  const defaultValues = {
    allAuth: false,
    auth: [
      { name: 'admin', value: false },
      { name: 'project', value: false },
      { name: 'personal', value: false },
      { name: 'financial', value: false },
    ],
  }

  // Hookform
  const { reset, control, setValue, handleSubmit } = useForm<FilterProps>({
    defaultValues: defaultValues,
  })

  // Handle reset
  const handleReset = () => {
    if (location.search) {
      reset(defaultValues)
      navigate('/auth/select')
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

      if (typeof value === 'object') {
        let keys = ''
        value.map((item: { name: string; value: boolean }) => {
          if (item.value) {
            if (keys === '') keys = `${item.name}`
            else keys = `${keys},${item.name}`
          }
        })
        if (keys !== '') urlQuery = appendQuery(key, keys)
      }
    })

    if (location.search === urlQuery) {
      setFiltering('idle')
    } else {
      navigate(`/auth/select${urlQuery}`)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(filter)}>
        <div className="mb-5.5">
          <label
            htmlFor="allAuth"
            className="mb-3 block text-sm font-medium text-black dark:text-white"
          >
            Autorizações
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
                    onChange={(e) => {
                      const isChecked = e.target.checked

                      setValue('auth.0.value', isChecked)
                      setValue('auth.1.value', isChecked)
                      setValue('auth.2.value', isChecked)
                      setValue('auth.3.value', isChecked)

                      field.onChange(isChecked)
                    }}
                  />
                )}
              />
            </div>

            <div className="ml-2 pl-3 border-l-2">
              <Controller
                name="auth.0.value"
                control={control}
                render={({ field }) => <Checkbox label="Administração" {...field} />}
              />
              <Controller
                name="auth.1.value"
                control={control}
                render={({ field }) => <Checkbox label="Editar Projetos" {...field} />}
              />
              <Controller
                name="auth.2.value"
                control={control}
                render={({ field }) => <Checkbox label="Informações pessoais" {...field} />}
              />
              <Controller
                name="auth.3.value"
                control={control}
                render={({ field }) => <Checkbox label="Informações financeiras" {...field} />}
              />
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
