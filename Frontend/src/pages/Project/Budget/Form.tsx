import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Control, Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { Input, InputNumeric, InputPattern } from '../../../components/Form/Input'
import { api as axios, handleAxiosError } from '../../../services/Axios'
import Alert from '../../../components/Alert/Index'
import Button from '../../../components/Form/Button'
import {
  faAlignLeft,
  faAngleDown,
  faAngleUp,
  faCalendar,
  faDollarSign,
  faThumbTack,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import SearchUser from '../../../hooks/search/useSearchUser'
import { currencyToNumber, numberToCurrency } from '../../../hooks/useCurrency'
import { differenceInHours, parse } from 'date-fns'
import Loader from '../../../components/Loader'
import { BudgetProps, StatusProps, UserProps } from '../../../types/Database'
import { budgetSchema } from '../../../hooks/useSchema'
import StatusSearch from '../../../hooks/search/useSearchStatus'
import Switcher from '../../../components/Form/Switcher'

const Form = ({ budget }: { budget: BudgetProps }) => {
  const navigate = useNavigate()
  const [request, setRequest] = useState<'idle' | 'request' | 'loanding'>('idle')
  const [status, setStatus] = useState<(StatusProps | null)[] | null>(null)
  const [user, setUser] = useState<(UserProps | null)[] | null>(null)
  const [resume, setResume] = useState<boolean[] | null>(null)
  const [alertErrors, setAlertErrors] = useState<(string | JSX.Element)[] | null>(null)
  const [alertSuccesses, setAlertSuccesses] = useState<(string | JSX.Element)[] | null>(null)

  const getDefaultValues = async () => {
    setRequest('request')

    try {
      const [responseUser, responseStatus] = await Promise.all([
        axios.get('user/select/all', { withCredentials: true }),
        axios.get('status/select/all', { withCredentials: true }),
      ])

      const resUser: UserProps[] = responseUser.data || []
      const resStatus: StatusProps[] = responseStatus.data || []

      const rsm: boolean[] | null = []
      const usr: (UserProps | null)[] = []
      const sts: (StatusProps | null)[] = []

      for (let i = 0; i < budget.tasks.length; i++) {
        rsm.push(true)
        usr.push(resUser.find((u) => u.uuid === budget.tasks[i].userUuid) || null)
        sts.push(resStatus.find((s) => s.uuid === budget.tasks[i].statusUuid) || null)
      }

      setUser(usr)
      setStatus(sts)
      setResume(rsm)
    } catch (error) {
      setAlertErrors([handleAxiosError(error)])
    }

    setRequest('idle')
  }

  useEffect(() => {
    getDefaultValues()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Budget schema
  const schema = budgetSchema
  type SchemaProps = z.infer<typeof schema>

  // Default values
  const defaultValues = {
    uuid: budget.uuid,
    register: budget.register,
    tasks: budget.tasks,
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

  // Hookform -> FieldArray
  const { fields, append, remove } = useFieldArray({
    name: 'tasks',
    control,
  })

  useEffect(() => {
    if (status) {
      status.forEach((s, index) => {
        setValue(`tasks.${index}.statusUuid`, s ? s.uuid : '')
      })
    }
  }, [status, setValue])

  useEffect(() => {
    if (user) {
      user.forEach((u, index) => {
        setValue(`tasks.${index}.userUuid`, u ? u.uuid : '')
      })
    }
  }, [user, setValue])

  // Handle reset
  const handleReset = async () => {
    setAlertErrors(null)
    setAlertSuccesses(null)

    reset(defaultValues)

    getDefaultValues()
  }

  const Total = ({ control }: { control: Control<SchemaProps> }) => {
    const tasks =
      useWatch({
        name: 'tasks',
        control,
      }) || []

    const total = tasks.reduce(
      (acc, task) => {
        if (task.taskExpense) {
          if (task.revenue !== '' && task.taskExpense.amount !== '') {
            acc.revenue += currencyToNumber(task.revenue, 'BRL')
            acc.cost += currencyToNumber(task.taskExpense.amount, 'BRL')
          }
        }

        if (task.taskActivity) {
          const regex = /^([0-2]\d|3[01])\/(0\d|1[0-2])\/\d{2} ([01]\d|2[0-3]):[0-5]\d$/

          if (
            regex.test(task.beginDate) &&
            regex.test(task.endDate) &&
            task.revenue !== '' &&
            task.taskActivity.hourlyRate !== ''
          ) {
            const beginDate = parse(task.beginDate, 'dd/MM/yy HH:mm', new Date())
            const endDate = parse(task.endDate, 'dd/MM/yy HH:mm', new Date())
            const hours = differenceInHours(endDate, beginDate)

            acc.revenue += hours * currencyToNumber(task.revenue, 'BRL')
            acc.cost += hours * currencyToNumber(task.taskActivity.hourlyRate, 'BRL')
          }
        }

        return acc
      },
      { cost: 0, revenue: 0 }
    )

    return (
      <>
        <p>
          <b>Valor Total: </b> {numberToCurrency(total.cost + total.revenue, 'BRL')}
        </p>
        <p>
          <b>Custo Total: </b> {numberToCurrency(total.cost, 'BRL')}
        </p>
        <p>
          <b>Lucro Total: </b> {numberToCurrency(total.revenue, 'BRL')}
        </p>
      </>
    )
  }

  const addTask = (type: 'expense' | 'activity') => {
    setResume((prevResume) => (prevResume ? [...prevResume, false] : [false]))
    setStatus((prevStatus) => (prevStatus ? [...prevStatus, null] : [null]))
    setUser((prevUser) => (prevUser ? [...prevUser, null] : [null]))

    const task = {
      name: '',
      description: '',
      finished: false,
      beginDate: '',
      endDate: '',
      revenue: '',
      statusUuid: '',
      projectUuid: budget.project.uuid,
      userUuid: undefined,
      budgetUuid: budget.uuid,
      taskExpense: undefined,
      taskActivity: undefined,
    }

    if (type === 'expense')
      append({
        ...task,
        taskExpense: {
          uuid: '',
          amount: '',
        },
      })

    if (type === 'activity')
      append({
        ...task,
        taskActivity: {
          uuid: '',
          hourlyRate: '',
        },
      })
  }

  const rmvTask = (index: number) => {
    remove(index)

    setResume((prevResume) => prevResume && prevResume.filter((_, i) => i !== index))
    setStatus((prevStatus) => prevStatus && prevStatus.filter((_, i) => i !== index))
    setUser((prevUser) => prevUser && prevUser.filter((_, i) => i !== index))
  }

  // Update budget in backend
  const updateBudget = async (data: SchemaProps) => {
    setRequest('request')
    setAlertErrors(null)
    setAlertSuccesses(null)

    try {
      const response = await axios.put('/budget/task/update', data, {
        withCredentials: true,
      })

      setAlertSuccesses([
        response.data.message,
        <Button
          type="button"
          color="success"
          onClick={() => navigate('/project/select')}
          className="h-8 w-50 bg-green-400 dark:text-form-input dark:bg-green-400"
        >
          Listar Projetos
        </Button>,
      ])

      // TODO colocar os uuids na tarefas adicionadas
    } catch (error) {
      setAlertErrors([handleAxiosError(error)])
    }

    setRequest('idle')
  }

  return (
    <form onSubmit={handleSubmit(updateBudget)}>
      <Input id="uuid" type="text" hidden disabled {...register('uuid')} />
      {errors.uuid && <Alert type="danger" size="sm" data={[errors.uuid.message || '']} />}

      <div className="mb-6">
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="">
          Tarefas
        </label>
        <div className="p-5 shadow-1 rounded-md border border-stroke dark:border-strokedark dark:bg-form-input/50">
          <div className="flex justify-between gap-5">
            <Button color="primary" type="button" onClick={() => addTask('expense')}>
              Inserir despesa
            </Button>
            <Button color="primary" type="button" onClick={() => addTask('activity')}>
              Inserir atividade
            </Button>
          </div>

          {resume && user && status ? (
            fields.map((field, index) => {
              let total = numberToCurrency(0, 'BRL')

              if (field.taskExpense) {
                if (field.revenue !== '' && field.taskExpense.amount !== '')
                  total = numberToCurrency(
                    currencyToNumber(field.revenue, 'BRL') +
                      currencyToNumber(field.taskExpense.amount, 'BRL'),
                    'BRL'
                  )
              }

              if (field.taskActivity) {
                const regex = /^([0-2]\d|3[01])\/(0\d|1[0-2])\/\d{2} ([01]\d|2[0-3]):[0-5]\d$/

                if (
                  field.revenue !== '' &&
                  field.taskActivity.hourlyRate !== '' &&
                  regex.test(field.beginDate) &&
                  regex.test(field.endDate)
                )
                  total = numberToCurrency(
                    (currencyToNumber(field.revenue, 'BRL') +
                      currencyToNumber(field.taskActivity.hourlyRate, 'BRL')) *
                      differenceInHours(
                        parse(field.endDate, 'dd/MM/yy HH:mm', new Date()),
                        parse(field.beginDate, 'dd/MM/yy HH:mm', new Date())
                      ),
                    'BRL'
                  )
              }

              return (
                <div
                  key={field.id}
                  className="my-8 p-3 text-black dark:text-white shadow-1 rounded-md border border-stroke dark:border-strokedark dark:bg-form-input/50"
                >
                  <Button
                    color="primary"
                    type="button"
                    className="w-8 h-8"
                    onClick={() =>
                      setResume(
                        (prevResume) =>
                          prevResume && prevResume.map((r, i) => (i === index ? !r : r))
                      )
                    }
                  >
                    <FontAwesomeIcon icon={resume[index] ? faAngleDown : faAngleUp} />
                  </Button>

                  <div className={resume[index] ? 'block' : 'hidden'}>
                    <p>
                      <b>Nome: </b> {field.name}
                    </p>
                    <p>
                      <b>Total: </b> {total}
                    </p>
                    <p>
                      <b>Status: </b>
                      {status[index]?.description}
                    </p>
                  </div>

                  <div className={resume[index] ? 'hidden' : 'block'}>
                    {errors.tasks?.[index]?.taskExpense?.uuid && (
                      <Alert
                        type="danger"
                        size="sm"
                        data={[errors.tasks?.[index].taskExpense.uuid.message || '']}
                      />
                    )}
                    {errors.tasks?.[index]?.taskActivity?.uuid && (
                      <Alert
                        type="danger"
                        size="sm"
                        data={[errors.tasks?.[index].taskActivity.uuid.message || '']}
                      />
                    )}
                    {errors.tasks?.[index]?.projectUuid && (
                      <Alert
                        type="danger"
                        size="sm"
                        data={[errors.tasks?.[index].projectUuid.message || '']}
                      />
                    )}
                    {errors.tasks?.[index]?.budgetUuid && (
                      <Alert
                        type="danger"
                        size="sm"
                        data={[errors.tasks?.[index].budgetUuid.message || '']}
                      />
                    )}

                    {field.taskExpense && (
                      <Input
                        id={`tasks.${index}.taskExpense.uuid`}
                        type="text"
                        hidden
                        disabled
                        {...register(`tasks.${index}.taskExpense.uuid`)}
                      />
                    )}

                    {field.taskActivity && (
                      <Input
                        id={`tasks.${index}.taskActivity.uuid`}
                        type="text"
                        hidden
                        disabled
                        {...register(`tasks.${index}.taskActivity.uuid`)}
                      />
                    )}

                    <Input
                      id={`tasks.${index}.projectUuid`}
                      type="text"
                      hidden
                      disabled
                      {...register(`tasks.${index}.projectUuid`)}
                    />

                    <Input
                      id={`tasks.${index}.budgetUuid`}
                      type="text"
                      hidden
                      disabled
                      {...register(`tasks.${index}.budgetUuid`)}
                    />

                    <div className="flex justify-between gap-5 mb-6">
                      <div className="w-full">
                        <label
                          className="mb-2.5 block font-medium text-black dark:text-white"
                          htmlFor="name"
                        >
                          Nome: <span className="text-danger">*</span>
                        </label>
                        <div className="relative">
                          <Input
                            id="`tasks.${index}.name`"
                            type="text"
                            icon={faThumbTack}
                            iconPosition="left"
                            {...register(`tasks.${index}.name`)}
                            placeholder="Digite o nome"
                          />
                        </div>
                        {errors.tasks?.[index]?.name && (
                          <Alert
                            type="danger"
                            size="sm"
                            data={[errors.tasks?.[index].name.message || '']}
                          />
                        )}
                      </div>

                      <div className="relative">
                        <div className="flex justify-center">
                          <label
                            className="mb-2.5 block font-medium text-black dark:text-white text-center"
                            htmlFor={`tasks.${index}.name`}
                          >
                            Finalizado
                          </label>
                        </div>

                        <div className="flex items-center h-13">
                          <Controller
                            name={`tasks.${index}.finished`}
                            control={control}
                            render={({ field }) => <Switcher {...field} />}
                          />
                        </div>
                      </div>
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
                          id={`tasks.${index}.description`}
                          type="text"
                          icon={faAlignLeft}
                          iconPosition="left"
                          {...register(`tasks.${index}.description`)}
                          placeholder="Digite a descrição"
                        />
                      </div>
                      {errors.tasks?.[index]?.description && (
                        <Alert
                          type="danger"
                          size="sm"
                          data={[errors.tasks?.[index].description.message || '']}
                        />
                      )}
                    </div>

                    <div className="mb-6">
                      <label
                        className="mb-2.5 block font-medium text-black dark:text-white"
                        htmlFor={`tasks.${index}.beginDate`}
                      >
                        Data inicial <span className="text-danger">*</span>
                      </label>
                      <div className="relative">
                        <Controller
                          name={`tasks.${index}.beginDate`}
                          control={control}
                          render={({ field }) => (
                            <InputPattern
                              {...field}
                              id={`tasks.${index}.beginDate`}
                              mask="_"
                              icon={faCalendar}
                              iconPosition="left"
                              format="##/##/## ##:##"
                              placeholder="dd/mm/aa --:--"
                            />
                          )}
                        />
                      </div>
                      {errors.tasks?.[index]?.beginDate && (
                        <Alert
                          type="danger"
                          size="sm"
                          data={[errors.tasks?.[index].beginDate.message || '']}
                        />
                      )}
                    </div>

                    <div className="mb-6">
                      <label
                        className="mb-2.5 block font-medium text-black dark:text-white"
                        htmlFor={`tasks.${index}.endDate`}
                      >
                        Data final <span className="text-danger">*</span>
                      </label>
                      <div className="relative">
                        <Controller
                          name={`tasks.${index}.endDate`}
                          control={control}
                          render={({ field }) => (
                            <InputPattern
                              {...field}
                              id={`tasks.${index}.endDate`}
                              mask="_"
                              icon={faCalendar}
                              iconPosition="left"
                              format="##/##/## ##:##"
                              placeholder="dd/mm/aa --:--"
                            />
                          )}
                        />
                      </div>
                      {errors.tasks?.[index]?.endDate && (
                        <Alert
                          type="danger"
                          size="sm"
                          data={[errors.tasks?.[index].endDate.message || '']}
                        />
                      )}
                    </div>

                    {field.taskExpense && (
                      <div className="mb-6">
                        <label
                          className="mb-2.5 block font-medium text-black dark:text-white"
                          htmlFor={`tasks.${index}.amount`}
                        >
                          Quantia <span className="text-danger">*</span>
                        </label>
                        <div className="relative">
                          <Controller
                            name={`tasks.${index}.taskExpense.amount`}
                            control={control}
                            render={({ field }) => (
                              <InputNumeric
                                {...field}
                                id={`tasks.${index}.taskExpense.amount`}
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
                        {errors.tasks?.[index]?.taskExpense?.amount && (
                          <Alert
                            type="danger"
                            size="sm"
                            data={[errors.tasks?.[index].taskExpense.amount.message || '']}
                          />
                        )}
                      </div>
                    )}

                    {field.taskActivity && (
                      <div className="mb-6">
                        <label
                          className="mb-2.5 block font-medium text-black dark:text-white"
                          htmlFor={`tasks.${index}.taskActivity.hourlyRate`}
                        >
                          Valor da Hora <span className="text-danger">*</span>
                        </label>
                        <div className="relative">
                          <Controller
                            name={`tasks.${index}.taskActivity.hourlyRate`}
                            control={control}
                            render={({ field }) => (
                              <InputNumeric
                                {...field}
                                id={`tasks.${index}.hourlyRate`}
                                icon={faDollarSign}
                                iconPosition="left"
                                prefix={'R$ '}
                                fixedDecimalScale
                                decimalScale={2}
                                allowNegative={false}
                                decimalSeparator=","
                                thousandSeparator="."
                                placeholder="Digite o valor da hora"
                              />
                            )}
                          />
                        </div>
                        {errors.tasks?.[index]?.taskActivity?.hourlyRate && (
                          <Alert
                            type="danger"
                            size="sm"
                            data={[errors.tasks?.[index].taskActivity.hourlyRate.message || '']}
                          />
                        )}
                      </div>
                    )}

                    <div className="mb-6">
                      <label
                        className="mb-2.5 block font-medium text-black dark:text-white"
                        htmlFor={`tasks.${index}.revenue`}
                      >
                        Lucro <span className="text-danger">*</span>
                      </label>
                      <div className="relative">
                        <Controller
                          name={`tasks.${index}.revenue`}
                          control={control}
                          render={({ field }) => (
                            <InputNumeric
                              {...field}
                              id={`tasks.${index}.revenue`}
                              icon={faDollarSign}
                              iconPosition="left"
                              prefix={'R$ '}
                              fixedDecimalScale
                              decimalScale={2}
                              allowNegative={false}
                              decimalSeparator=","
                              thousandSeparator="."
                              placeholder="Digite o lucro"
                            />
                          )}
                        />
                      </div>
                      {errors.tasks?.[index]?.revenue && (
                        <Alert
                          type="danger"
                          size="sm"
                          data={[errors.tasks?.[index].revenue.message || '']}
                        />
                      )}
                    </div>

                    <div className="mb-6">
                      <label
                        className="mb-2.5 block font-medium text-black dark:text-white"
                        htmlFor={`tasks.${index}.statusUuid`}
                      >
                        Status <span className="text-danger">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          type="text"
                          id={`tasks.${index}.statusUuid`}
                          disabled
                          hidden
                          {...register(`tasks.${index}.statusUuid`)}
                        />

                        <StatusSearch
                          status={status[index]}
                          setStatus={(newStatus) => {
                            setStatus(
                              (prevStatus) =>
                                prevStatus &&
                                prevStatus.map((s, i) => (i === index ? newStatus : s))
                            )
                          }}
                        />
                      </div>
                      {errors.tasks?.[index]?.statusUuid && (
                        <Alert
                          type="danger"
                          size="sm"
                          data={[errors.tasks?.[index].statusUuid.message || '']}
                        />
                      )}
                    </div>

                    <div className="mb-6">
                      <label
                        className="mb-2.5 block font-medium text-black dark:text-white"
                        htmlFor={`tasks.${index}.userUuid`}
                      >
                        Usuário <span className="text-slate-400">?</span>
                      </label>
                      <div className="relative">
                        <Input
                          type="text"
                          id={`tasks.${index}.userUuid`}
                          disabled
                          hidden
                          {...register(`tasks.${index}.userUuid`)}
                        />

                        <SearchUser
                          user={user[index]}
                          setUser={(newUser) => {
                            setUser(
                              (prevUser) =>
                                prevUser && prevUser.map((u, i) => (i === index ? newUser : u))
                            )
                          }}
                        />
                      </div>
                      {errors.tasks?.[index]?.userUuid && (
                        <Alert
                          type="danger"
                          size="sm"
                          data={[errors.tasks?.[index].userUuid.message || '']}
                        />
                      )}
                    </div>

                    <Button color="danger" type="button" onClick={() => rmvTask(index)}>
                      <FontAwesomeIcon icon={faTrashCan} />
                    </Button>
                  </div>
                </div>
              )
            })
          ) : (
            <Loader />
          )}

          {errors.tasks?.message && (
            <Alert type="danger" size="lg" data={[errors.tasks.message || '']} />
          )}
        </div>
      </div>

      <div className="mb-6">
        <Total control={control} />
      </div>

      {alertErrors && <Alert type="danger" size="lg" data={alertErrors} />}
      {alertSuccesses && <Alert type="success" size="lg" data={alertSuccesses} />}

      <div className="flex justify-between gap-5">
        <Button
          type="button"
          color="white"
          onClick={() => handleReset()}
          disabled={request === 'loanding'}
          loading={request === 'loanding'}
        >
          Resetar
        </Button>
        <Button
          color="primary"
          disabled={request !== 'idle'}
          loading={request === 'request' || request === 'loanding'}
        >
          Salvar
        </Button>
      </div>
    </form>
  )
}

export default Form
