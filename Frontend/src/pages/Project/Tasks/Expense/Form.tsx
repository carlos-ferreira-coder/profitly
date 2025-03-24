import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input, InputNumeric, InputPattern } from '../../../../components/Form/Input'
import Alert from '../../../../components/Alert/Index'
import Button from '../../../../components/Form/Button'
import { api as axios, handleAxiosError } from '../../../../services/Axios'
import { faAlignLeft, faCalendar, faCheck, faDollarSign } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import { doneSchema } from '../../../../hooks/useSchema'
import { SupplierProps, TaskProps, UserProps } from '../../../../types/Database'
import SupplierSearch from '../../../../hooks/search/useSearchSupplier'
import UserSearch from '../../../../hooks/search/useSearchUser'

const Form = ({ task }: { task: TaskProps }) => {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'idle' | 'request'>('idle')
  const [user, setUser] = useState<UserProps | null>(null)
  const [supplier, setSupplier] = useState<SupplierProps | null>(null)
  const [alertErrors, setAlertErrors] = useState<(string | JSX.Element)[] | null>(null)
  const [alertSuccesses, setAlertSuccesses] = useState<(string | JSX.Element)[] | null>(null)

  // Expense schema
  const schema = doneSchema
  type SchemaProps = z.infer<typeof schema>

  const defaultValues = {
    name: task.name,
    description: task.description,
    userUuid: task.userUuid || undefined,
    doneExpense: {
      taskUuid: task.taskExpense?.uuid,
      amount: task.taskExpense?.amount,
      date: task.endDate,
      supplierUuid: undefined,
    },
  }

  // Hookform
  const {
    reset,
    control,
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<SchemaProps>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues,
  })

  // Handle reset
  const handleReset = () => {
    setAlertErrors(null)
    setAlertSuccesses(null)

    setUser(null)
    setSupplier(null)

    reset(defaultValues)
  }

  useEffect(() => {
    setValue('userUuid', user ? user.uuid : '')
  }, [user, setValue])

  useEffect(() => {
    setValue('doneExpense.supplierUuid', supplier ? supplier.uuid : '')
  }, [supplier, setValue])

  // Create expense in backend
  const createExpense = async (data: SchemaProps) => {
    setStatus('request')
    setAlertErrors(null)
    setAlertSuccesses(null)

    try {
      const response = await axios.post('/tasks/done/create', data, {
        withCredentials: true,
      })

      setAlertSuccesses([
        response.data.message,
        <Button
          type="button"
          color="success"
          onClick={() => navigate(`/project/tasks/${task.projectUuid}`)}
          className="h-8 w-35 bg-green-400 dark:text-form-input dark:bg-green-400"
        >
          Listar tarefas
        </Button>,
      ])
    } catch (error) {
      setAlertErrors([handleAxiosError(error)])
    }

    setStatus('idle')
  }

  return (
    <form onSubmit={handleSubmit(createExpense)}>
      <div className="mb-6">
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="name">
          Nome <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <Input
            id="name"
            type="text"
            icon={faCheck}
            iconPosition="left"
            {...register('name')}
            placeholder="Digite o nome"
          />
        </div>
        {errors.name && <Alert type="danger" size="sm" data={[errors.name.message || '']} />}
      </div>

      <div className="mb-6">
        <label
          className="mb-2.5 block font-medium text-black dark:text-white"
          htmlFor="description"
        >
          Descrição <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <Input
            id="description"
            type="text"
            icon={faAlignLeft}
            iconPosition="left"
            {...register('description')}
            placeholder="Digite a descrição"
          />
        </div>
        {errors.description && (
          <Alert type="danger" size="sm" data={[errors.description.message || '']} />
        )}
      </div>

      <div className="mb-6">
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="amount">
          Quantia <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <Controller
            name="doneExpense.amount"
            control={control}
            render={({ field }) => (
              <InputNumeric
                {...field}
                id="amount"
                icon={faDollarSign}
                iconPosition="left"
                prefix={'R$ '}
                fixedDecimalScale
                decimalScale={2}
                allowNegative={false}
                decimalSeparator=","
                thousandSeparator="."
                placeholder="Digite a quantia"
              />
            )}
          />
        </div>
        {errors.doneExpense?.amount && (
          <Alert type="danger" size="sm" data={[errors.doneExpense.amount.message || '']} />
        )}
      </div>

      <div className="mb-6">
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="date">
          Data <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <Controller
            name="doneExpense.date"
            control={control}
            render={({ field }) => (
              <InputPattern
                {...field}
                id="date"
                mask="_"
                icon={faCalendar}
                iconPosition="left"
                format="##/##/## ##:##"
                placeholder="dd/mm/aa --:--"
              />
            )}
          />
        </div>
        {errors.doneExpense?.date && (
          <Alert type="danger" size="sm" data={[errors.doneExpense.date.message || '']} />
        )}
      </div>

      <div className="mb-6">
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="userUuid">
          Usuário <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <Input type="text" id="userUuid" disabled hidden {...register('userUuid')} />

          <UserSearch user={user} setUser={setUser} />
        </div>
        {errors.userUuid && (
          <Alert type="danger" size="sm" data={[errors.userUuid.message || '']} />
        )}
      </div>

      <div className="mb-6">
        <label
          className="mb-2.5 block font-medium text-black dark:text-white"
          htmlFor="supplierUuid"
        >
          Fornecedor <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <Input
            type="text"
            id="supplierUuid"
            disabled
            hidden
            {...register('doneExpense.supplierUuid')}
          />

          <SupplierSearch supplier={supplier} setSupplier={setSupplier} />
        </div>
        {errors.doneExpense?.supplierUuid && (
          <Alert type="danger" size="sm" data={[errors.doneExpense.supplierUuid.message || '']} />
        )}
      </div>

      {alertErrors && <Alert type="danger" size="lg" data={alertErrors} />}
      {alertSuccesses && <Alert type="success" size="lg" data={alertSuccesses} />}

      <div className="flex justify-between gap-5">
        <Button color="white" type="button" onClick={() => handleReset()}>
          Limpar
        </Button>
        <Button color="primary" disabled={status === 'request'} loading={status === 'request'}>
          Cadastrar
        </Button>
      </div>
    </form>
  )
}

export default Form
