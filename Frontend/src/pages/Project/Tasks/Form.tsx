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
  faCheck,
  faCircleCheck,
  faCircleXmark,
  faDollarSign,
  faThumbTack,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { currencyToNumber, numberToCurrency } from '../../../hooks/useCurrency'
import { differenceInHours, parse } from 'date-fns'
import Loader from '../../../components/Loader'
import { StatusProps, TaskProps, UserProps } from '../../../types/Database'
import { tasksSchema } from '../../../hooks/useSchema'
import StatusSearch from '../../../hooks/search/useSearchStatus'
import Switcher from '../../../components/Form/Switcher'
import SearchUser from '../../../hooks/search/useSearchUser'

const Form = ({ tasks, projectUuid }: { tasks: TaskProps[]; projectUuid: string }) => {
  const navigate = useNavigate()
  const [request, setRequest] = useState<'idle' | 'request' | 'loanding'>('idle')
  const [status, setStatus] = useState<(StatusProps | null)[] | null>(null)
  const [user, setUser] = useState<(UserProps | null)[] | null>(null)
  const [resume, setResume] = useState<boolean[] | null>(null)
  const [alertErrors, setAlertErrors] = useState<(string | JSX.Element)[] | null>(null)
  const [alertSuccesses, setAlertSuccesses] = useState<(string | JSX.Element)[] | null>(null)

  const getDefaultValues = useCallback(async () => {
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

      for (let i = 0; i < tasks.length; i++) {
        rsm.push(true)
        usr.push(resUser.find((u) => u.uuid === tasks[i].userUuid) || null)
        sts.push(resStatus.find((s) => s.uuid === tasks[i].statusUuid) || null)
      }

      setUser(usr)
      setStatus(sts)
      setResume(rsm)
    } catch (error) {
      setAlertErrors([handleAxiosError(error)])
    }

    setRequest('idle')
  }, [tasks])

  useEffect(() => {
    getDefaultValues()
  }, [getDefaultValues])

  // Tasks schema
  const schema = tasksSchema
  type SchemaProps = z.infer<typeof schema>

  // Default values
  const defaultValues = {
    tasks: tasks,
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
    const tasks = useWatch({
      name: 'tasks',
      control,
    })

    const dateRegex = /^([0-2]\d|3[01])\/(0\d|1[0-2])\/\d{2} ([01]\d|2[0-3]):[0-5]\d$/
    const parseDate = (date: string) => parse(date, 'dd/MM/yy HH:mm', new Date())
    const getHoursDiff = (start: string, end: string) => {
      const startDate = parseDate(start)
      const endDate = parseDate(end)
      return startDate && endDate ? differenceInHours(endDate, startDate) : 0
    }

    const total = tasks.reduce(
      (acc, task) => {
        let prev = 0,
          cost = 0,
          revn = 0

        if (task.taskExpense) {
          const revenue = currencyToNumber(task.revenue, 'BRL')
          const amount = currencyToNumber(task.taskExpense.amount, 'BRL')

          if (amount && revenue) {
            prev = amount
            revn = revenue
          }
        }

        if (task.taskActivity) {
          const revenue = currencyToNumber(task.revenue, 'BRL')
          const hourlyRate = currencyToNumber(task.taskActivity.hourlyRate, 'BRL')

          if (
            revenue &&
            hourlyRate &&
            dateRegex.test(task.beginDate) &&
            dateRegex.test(task.endDate)
          ) {
            const hours = getHoursDiff(task.beginDate, task.endDate)
            prev = hours * hourlyRate
            revn = hours * revenue
          }
        }

        acc.tasks.cost += prev
        acc.tasks.revn += revn

        if (task.dones) {
          cost = task.dones.reduce((sum, done) => {
            if (done.doneExpense) sum += currencyToNumber(done.doneExpense.amount, 'BRL')

            if (done.doneActivity)
              sum +=
                currencyToNumber(done.doneActivity.hourlyRate, 'BRL') *
                getHoursDiff(done.doneActivity.beginDate, done.doneActivity.endDate)

            return sum
          }, 0)

          const ratio = cost / (prev || 1)

          acc.dones.cost += cost
          acc.dones.revn += task.finished || ratio > 1 ? revn : revn * ratio
        }

        return acc
      },
      {
        tasks: {
          cost: 0,
          revn: 0,
        },
        dones: {
          cost: 0,
          revn: 0,
        },
      }
    )

    return (
      <>
        <p>
          <b>Total das tarefas: </b>
          {numberToCurrency(total.tasks.cost + total.tasks.revn, 'BRL')}
        </p>
        <p>
          <b>Custos das tarefas: </b>
          {numberToCurrency(total.tasks.cost, 'BRL')}
        </p>
        <p>
          <b>Lucros das tarefas: </b>
          {numberToCurrency(total.tasks.revn, 'BRL')}
        </p>

        <div className="border-stroke dark:border-strokedark h-1/2 border-t-2"></div>

        <p>
          <b>Total realizado: </b>
          {numberToCurrency(total.dones.cost + total.dones.revn, 'BRL')}
        </p>
        <p>
          <b>Custos realizados: </b>
          {numberToCurrency(total.dones.cost, 'BRL')}
        </p>
        <p>
          <b>Lucros realizados: </b>
          {numberToCurrency(total.dones.revn, 'BRL')}
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
      projectUuid: projectUuid,
      userUuid: undefined,
      budgetUuid: undefined,
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

  // Update tasks in backend
  const updateTasks = async (data: SchemaProps) => {
    setRequest('request')
    setAlertErrors(null)
    setAlertSuccesses(null)

    try {
      const response = await axios.put('/tasks/update', data, { withCredentials: true })

      setAlertSuccesses([
        response.data.message,
        <Button
          type="button"
          color="success"
          onClick={() => navigate(`/project/tasks/${projectUuid}`)}
          className="h-8 w-50 bg-green-400 dark:text-form-input dark:bg-green-400"
        >
          Atualize a pagina
        </Button>,
      ])
    } catch (error) {
      setAlertErrors([handleAxiosError(error)])
    }

    setRequest('idle')
  }

  return (
    <form onSubmit={handleSubmit(updateTasks)}>
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
            fields.map((task, index) => {
              const taskError = errors.tasks?.[index]

              let prev = 0,
                cost = 0,
                revn = 0,
                rven = 0

              const dateRegex = /^([0-2]\d|3[01])\/(0\d|1[0-2])\/\d{2} ([01]\d|2[0-3]):[0-5]\d$/
              const parseDate = (date: string) => parse(date, 'dd/MM/yy HH:mm', new Date())
              const getHoursDiff = (start: string, end: string) => {
                const startDate = parseDate(start)
                const endDate = parseDate(end)
                return startDate && endDate ? differenceInHours(endDate, startDate) : 0
              }

              if (task.taskExpense) {
                const revenue = currencyToNumber(task.revenue, 'BRL')
                const amount = currencyToNumber(task.taskExpense.amount, 'BRL')

                if (amount && revenue) {
                  prev = amount
                  revn = revenue
                }
              }

              if (task.taskActivity) {
                const revenue = currencyToNumber(task.revenue, 'BRL')
                const hourlyRate = currencyToNumber(task.taskActivity.hourlyRate, 'BRL')

                if (
                  revenue &&
                  hourlyRate &&
                  dateRegex.test(task.beginDate) &&
                  dateRegex.test(task.endDate)
                ) {
                  const hours = getHoursDiff(task.beginDate, task.endDate)
                  prev = hours * hourlyRate
                  revn = hours * revenue
                }
              }

              if (task.dones) {
                cost = task.dones.reduce((sum, done) => {
                  if (done.doneExpense) sum += currencyToNumber(done.doneExpense.amount, 'BRL')

                  if (done.doneActivity)
                    sum +=
                      currencyToNumber(done.doneActivity.hourlyRate, 'BRL') *
                      getHoursDiff(done.doneActivity.beginDate, done.doneActivity.endDate)

                  return sum
                }, 0)

                const ratio = cost / (prev || 1)

                rven = task.finished || ratio > 1 ? revn : revn * ratio
              }

              return (
                <div
                  key={task.id}
                  className="my-8 p-3 text-black dark:text-white shadow-1 rounded-md border border-stroke dark:border-strokedark dark:bg-form-input/50"
                >
                  <div className="flex justify-between mb-3">
                    <div className="flex gap-8">
                      <Button
                        color="primary"
                        type="button"
                        className="h-8 w-8"
                        onClick={() =>
                          setResume(
                            (prevResume) =>
                              prevResume && prevResume.map((r, i) => (i === index ? !r : r))
                          )
                        }
                      >
                        <FontAwesomeIcon icon={resume[index] ? faAngleDown : faAngleUp} />
                      </Button>

                      {!task.dones && (
                        <Button
                          color="danger"
                          type="button"
                          className="h-8 w-8"
                          onClick={() => rmvTask(index)}
                        >
                          <FontAwesomeIcon icon={faTrashCan} />
                        </Button>
                      )}
                    </div>

                    <div className="flex gap-3">
                      {!task.finished && (
                        <>
                          {task.taskExpense && (
                            <Button
                              color="success"
                              type="button"
                              className="h-8 w-40"
                              onClick={() =>
                                navigate(`/project/tasks/expense/${task.taskExpense?.uuid}`)
                              }
                            >
                              Inserir realizado <FontAwesomeIcon icon={faCheck} className="ml-2" />
                            </Button>
                          )}

                          {task.taskActivity && (
                            <Button
                              color="success"
                              type="button"
                              className="h-8 w-40"
                              onClick={() =>
                                navigate(`/project/tasks/activity/${task.taskActivity?.uuid}`)
                              }
                            >
                              Inserir realizado <FontAwesomeIcon icon={faCheck} className="ml-2" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className={resume[index] ? 'block' : 'hidden'}>
                    <p>
                      <b>Nome: </b>
                      {task.name}
                      {task.finished && task.dones ? (
                        <FontAwesomeIcon icon={faCircleCheck} className="ml-2 text-success" />
                      ) : (
                        <FontAwesomeIcon icon={faCircleXmark} className="ml-2 text-danger" />
                      )}
                    </p>
                    <p>
                      <b>Total da tarefa: </b>
                      {numberToCurrency(prev + revn, 'BRL')}
                    </p>
                    <p>
                      <b>Total realizado: </b>
                      {numberToCurrency(cost + rven, 'BRL')}
                    </p>
                    <p>
                      <b>Status: </b>
                      {status[index]?.description}
                    </p>
                  </div>

                  <div className={resume[index] ? 'hidden' : 'block'}>
                    {taskError?.taskExpense?.uuid && (
                      <Alert
                        type="danger"
                        size="sm"
                        data={[taskError.taskExpense.uuid.message || '']}
                      />
                    )}
                    {taskError?.taskActivity?.uuid && (
                      <Alert
                        type="danger"
                        size="sm"
                        data={[taskError.taskActivity.uuid.message || '']}
                      />
                    )}
                    {taskError?.projectUuid && (
                      <Alert type="danger" size="sm" data={[taskError.projectUuid.message || '']} />
                    )}
                    {taskError?.budgetUuid && (
                      <Alert type="danger" size="sm" data={[taskError.budgetUuid.message || '']} />
                    )}

                    {Array.isArray(taskError?.dones) &&
                      taskError.dones.map((done) => (
                        <Alert type="danger" size="sm" data={[done.message || '']} />
                      ))}

                    {task.taskExpense && (
                      <Input
                        id={`tasks.${index}.taskExpense.uuid`}
                        type="text"
                        hidden
                        disabled
                        {...register(`tasks.${index}.taskExpense.uuid`)}
                      />
                    )}

                    {task.taskActivity && (
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
                        {taskError?.name && (
                          <Alert type="danger" size="sm" data={[taskError.name.message || '']} />
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
                      {taskError?.description && (
                        <Alert
                          type="danger"
                          size="sm"
                          data={[taskError.description.message || '']}
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
                      {taskError?.beginDate && (
                        <Alert type="danger" size="sm" data={[taskError.beginDate.message || '']} />
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
                      {taskError?.endDate && (
                        <Alert type="danger" size="sm" data={[taskError.endDate.message || '']} />
                      )}
                    </div>

                    {task.taskExpense && (
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
                        {taskError?.taskExpense?.amount && (
                          <Alert
                            type="danger"
                            size="sm"
                            data={[taskError.taskExpense.amount.message || '']}
                          />
                        )}
                      </div>
                    )}

                    {task.taskActivity && (
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
                        {taskError?.taskActivity?.hourlyRate && (
                          <Alert
                            type="danger"
                            size="sm"
                            data={[taskError.taskActivity.hourlyRate.message || '']}
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
                      {taskError?.revenue && (
                        <Alert type="danger" size="sm" data={[taskError.revenue.message || '']} />
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
                      {taskError?.statusUuid && (
                        <Alert
                          type="danger"
                          size="sm"
                          data={[taskError.statusUuid.message || '']}
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
                      {taskError?.userUuid && (
                        <Alert type="danger" size="sm" data={[taskError.userUuid.message || '']} />
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <Loader />
          )}

          {errors.tasks && <Alert type="danger" size="lg" data={[errors.tasks.message || '']} />}
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
