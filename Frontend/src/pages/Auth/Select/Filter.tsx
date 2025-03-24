import Button from '../../../components/Form/Button'
import { Controller, useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { Checkbox } from '../../../components/Form/Checkbox'
import qs from 'qs'
import { Input } from '../../../components/Form/Input'

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
    name: string
    allAuth: boolean
    auth: {
      name: string
      value: boolean
    }[]
    allNotAuth: boolean
    notAuth: {
      name: string
      value: boolean
    }[]
  }

  const defaultValues = {
    name: '',
    allAuth: false,
    auth: [
      { name: 'admin', value: false },
      { name: 'project', value: false },
      { name: 'personal', value: false },
      { name: 'financial', value: false },
    ],
    allNotAuth: false,
    notAuth: [
      { name: 'admin', value: false },
      { name: 'project', value: false },
      { name: 'personal', value: false },
      { name: 'financial', value: false },
    ],
  }

  // Hookform
  const { reset, control, register, setValue, handleSubmit } = useForm<FilterProps>({
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

    const query = {
      name: data.name || undefined,
      auth: data.auth.filter(({ value }) => value).map(({ name }) => name),
      notAuth: data.notAuth.filter(({ value }) => value).map(({ name }) => name),
    }

    navigate(`/auth/select?${qs.stringify(query, { encode: false })}`)
  }

  return (
    <>
      <form onSubmit={handleSubmit(filter)}>
        <div className="mb-5.5">
          <label
            htmlFor="name"
            className="mb-3 block text-sm font-medium text-black dark:text-white"
          >
            Cargo/Função
          </label>
          <div className="relative">
            <Input
              type="text"
              id="name"
              {...register('name')}
              placeholder="Digite o cargo/função"
            />
          </div>
        </div>

        <div className="mb-5.5">
          <label
            htmlFor="allAuth"
            className="mb-3 block text-sm font-medium text-black dark:text-white"
          >
            Autorização(es)
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

        <div className="mb-5.5">
          <label
            htmlFor="allNotAuth"
            className="mb-3 block text-sm font-medium text-black dark:text-white"
          >
            Sem autorização(es)
          </label>
          <div className="relative">
            <div className="mb-1">
              <Controller
                name="allNotAuth"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    label="Selecionar Todos"
                    name={field.name}
                    value={field.value}
                    onChange={(e) => {
                      const isChecked = e.target.checked

                      setValue('notAuth.0.value', isChecked)
                      setValue('notAuth.1.value', isChecked)
                      setValue('notAuth.2.value', isChecked)
                      setValue('notAuth.3.value', isChecked)

                      field.onChange(isChecked)
                    }}
                  />
                )}
              />
            </div>

            <div className="ml-2 pl-3 border-l-2">
              <Controller
                name="notAuth.0.value"
                control={control}
                render={({ field }) => <Checkbox label="Administração" {...field} />}
              />
              <Controller
                name="notAuth.1.value"
                control={control}
                render={({ field }) => <Checkbox label="Editar Projetos" {...field} />}
              />
              <Controller
                name="notAuth.2.value"
                control={control}
                render={({ field }) => <Checkbox label="Informações pessoais" {...field} />}
              />
              <Controller
                name="notAuth.3.value"
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
