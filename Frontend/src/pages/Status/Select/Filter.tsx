import Button from '../../../components/Form/Button'
import { Controller, useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { Checkbox } from '../../../components/Form/Checkbox'
import { Input } from '../../../components/Form/Input'
import qs from 'qs'

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
    description: string
    allPriority: boolean
    priority: {
      key: number[]
      name: string
      value: boolean
    }[]
  }

  const defaultValues = {
    name: '',
    description: '',
    allPriority: true,
    priority: [
      { key: [1, 2, 3], name: 'high', value: true },
      { key: [4, 5, 6, 7], name: 'medium', value: true },
      { key: [8, 9, 10], name: 'low', value: true },
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
      navigate('/status/select')
    }
  }

  // Pass filter on url
  const filter = (data: FilterProps) => {
    setFiltering('filter')

    const query = {
      name: data.name || undefined,
      description: data.description || undefined,
      priority: data.priority
        .filter(({ value }) => value)
        .map(({ key }) => key)
        .map((i) => i),
    }

    navigate(`/status/select?${qs.stringify(query, { encode: false })}`)
  }

  return (
    <>
      <form onSubmit={handleSubmit(filter)}>
        <div className="mb-5.5">
          <label
            htmlFor="name"
            className="mb-3 block text-sm font-medium text-black dark:text-white"
          >
            Status
          </label>
          <div className="relative">
            <Input type="text" id="name" {...register('name')} placeholder="Digite o status" />
          </div>
        </div>

        <div className="mb-5.5">
          <label
            htmlFor="description"
            className="mb-3 block text-sm font-medium text-black dark:text-white"
          >
            Descrição
          </label>
          <div className="relative">
            <Input
              type="text"
              id="description"
              {...register('description')}
              placeholder="Digite a descrição"
            />
          </div>
        </div>

        <div className="mb-5.5">
          <label
            htmlFor="allPriority"
            className="mb-3 block text-sm font-medium text-black dark:text-white"
          >
            Prioridades
          </label>
          <div className="relative">
            <div className="mb-1">
              <Controller
                name="allPriority"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    label="Selecionar Todos"
                    name={field.name}
                    value={field.value}
                    onChange={(e) => {
                      const isChecked = e.target.checked

                      setValue('priority.0.value', isChecked)
                      setValue('priority.1.value', isChecked)
                      setValue('priority.2.value', isChecked)

                      field.onChange(isChecked)
                    }}
                  />
                )}
              />
            </div>

            <div className="ml-2 pl-3 border-l-2">
              <Controller
                name="priority.0.value"
                control={control}
                render={({ field }) => <Checkbox label="Prioridade Alta" {...field} />}
              />
              <Controller
                name="priority.1.value"
                control={control}
                render={({ field }) => <Checkbox label="Prioridade Média" {...field} />}
              />
              <Controller
                name="priority.2.value"
                control={control}
                render={({ field }) => <Checkbox label="Prioridade Baixa" {...field} />}
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
