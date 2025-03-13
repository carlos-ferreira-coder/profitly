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
import { currencyToNumber, numberToCurrency } from '../../../hooks/useCurrency'
import { differenceInHours, parse } from 'date-fns'
import Loader from '../../../components/Loader'
import {
  StatusProps,
  TaskActivityProps,
  TaskExpenseProps,
  UserProps,
} from '../../../types/Database'
import { tasksSchema } from '../../../hooks/useSchema'
import StatusSearch from '../../../hooks/search/useSearchStatus'
import UserSearch from '../../../hooks/search/useSearchUser'

const Form = ({
  tasks,
  projectUuid,
}: {
  tasks: (TaskExpenseProps | TaskActivityProps)[]
  projectUuid: string
}) => {
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

      for (let i = 0; i < tasks.length; i++) {
        rsm.push(false)
        usr.push(resUser.find((u) => u.uuid === tasks[i].task.userUuid) || null)
        sts.push(resStatus.find((s) => s.uuid === tasks[i].task.statusUuid) || null)
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

  // Tasks schema
  const schema = tasksSchema
  type SchemaProps = z.infer<typeof schema>

  // Default values
  const defaultValues = {
    task: tasks,
  }

  // Hookform
  const {
    watch,
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
    name: 'task',
    control,
  })

  useEffect(() => {
    if (status) {
      status.forEach((s, index) => {
        setValue(`task.${index}.statusUuid`, s ? s.uuid : '')
      })
    }
  }, [status, setValue])

  useEffect(() => {
    if (user) {
      user.forEach((u, index) => {
        setValue(`task.${index}.userUuid`, u ? u.uuid : '')
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
      name: 'task',
      control,
    })

    const revenue = tasks.reduce((acc, task) => {
      if ('amount' in task) return acc + currencyToNumber(task.revenue, 'BRL')

      const beginDate = parse(task.beginDate, 'dd/MM/yy HH:mm', new Date())
      const endDate = parse(task.endDate, 'dd/MM/yy HH:mm', new Date())
      const hours = differenceInHours(endDate, beginDate)

      return acc + hours * currencyToNumber(task.revenue, 'BRL')
    }, 0)

    const cost = tasks.reduce((acc, task) => {
      if ('amount' in task) return acc + currencyToNumber(task.amount, 'BRL')

      const beginDate = parse(task.beginDate, 'dd/MM/yy HH:mm', new Date())
      const endDate = parse(task.endDate, 'dd/MM/yy HH:mm', new Date())
      const hours = differenceInHours(endDate, beginDate)

      return acc + hours * currencyToNumber(task.hourlyRate, 'BRL')
    }, 0)

    return (
      <>
        <p>
          <b>Valor Total: </b> {numberToCurrency(cost + revenue, 'BRL')}
        </p>
        <p>
          <b>Custo Total: </b> {numberToCurrency(cost, 'BRL')}
        </p>
        <p>
          <b>Lucro Total: </b> {numberToCurrency(revenue, 'BRL')}
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
      beginDate: '',
      endDate: '',
      revenue: '',
      statusUuid: '',
      projectUuid: projectUuid,
      userUuid: undefined,
      budgetUuid: undefined,
      uuid: '',
    }

    if (type === 'expense')
      append({
        ...task,
        amount: '',
      })

    if (type === 'activity')
      append({
        ...task,
        hourlyRate: '',
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
      const response = await axios.put('/project/tasks/update', data, {
        withCredentials: true,
      })

      setAlertSuccesses([
        response.data.message,
        <Button
          type="button"
          color="success"
          onClick={() => navigate(`/project/tasks/${projectUuid}`)}
          className="h-8 w-50 bg-green-400 dark:text-form-input dark:bg-green-400"
        >
          Atualizar Pagina
        </Button>,
      ])

      // TODO colocar os uuids na tarefas adicionadas
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
            fields.map((field, index) => {
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
                      <b>Descrição: </b>
                      {watch(`task.${index}.description`)}
                    </p>
                    <p>
                      <b>Valor: </b>
                      {watch(`task.${index}.amount`) &&
                        numberToCurrency(
                          currencyToNumber(watch(`task.${index}.amount`), 'BRL') +
                            currencyToNumber(watch(`task.${index}.revenue`), 'BRL'),
                          'BRL'
                        )}

                      {watch(`task.${index}.hourlyRate`) &&
                        numberToCurrency(
                          currencyToNumber(watch(`task.${index}.hourlyRate`), 'BRL') *
                            differenceInHours(
                              parse(watch(`task.${index}.endDate`), 'dd/MM/yy HH:mm', new Date()),
                              parse(watch(`task.${index}.beginDate`), 'dd/MM/yy HH:mm', new Date())
                            ) +
                            currencyToNumber(watch(`task.${index}.revenue`), 'BRL') *
                              differenceInHours(
                                parse(watch(`task.${index}.endDate`), 'dd/MM/yy HH:mm', new Date()),
                                parse(
                                  watch(`task.${index}.beginDate`),
                                  'dd/MM/yy HH:mm',
                                  new Date()
                                )
                              ),
                          'BRL'
                        )}
                    </p>
                    <p>
                      <b>Status: </b>
                      {status[index]?.description}
                    </p>
                  </div>

                  <div className={resume[index] ? 'hidden' : 'block'}>
                    <Input
                      id={`task.${index}.uuid`}
                      type="text"
                      hidden
                      disabled
                      {...register(`task.${index}.uuid`)}
                    />
                    {errors.task?.[index]?.uuid && (
                      <Alert
                        type="danger"
                        size="sm"
                        data={[errors.task?.[index].uuid.message || '']}
                      />
                    )}

                    <Input
                      id={`task.${index}.projectUuid`}
                      type="text"
                      hidden
                      disabled
                      {...register(`task.${index}.projectUuid`)}
                    />
                    {errors.task?.[index]?.projectUuid && (
                      <Alert
                        type="danger"
                        size="sm"
                        data={[errors.task?.[index].projectUuid.message || '']}
                      />
                    )}

                    <div className="mb-6">
                      <label
                        className="mb-2.5 block font-medium text-black dark:text-white"
                        htmlFor="name"
                      >
                        Nome: <span className="text-danger">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          id={`task.${index}.name`}
                          type="text"
                          icon={faThumbTack}
                          iconPosition="left"
                          {...register(`task.${index}.name`)}
                          placeholder="Digite o nome"
                        />
                      </div>
                      {errors.task?.[index]?.name && (
                        <Alert
                          type="danger"
                          size="sm"
                          data={[errors.task?.[index].name.message || '']}
                        />
                      )}
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
                          id={`task.${index}.description`}
                          type="text"
                          icon={faAlignLeft}
                          iconPosition="left"
                          {...register(`task.${index}.description`)}
                          placeholder="Digite a descrição"
                        />
                      </div>
                      {errors.task?.[index]?.description && (
                        <Alert
                          type="danger"
                          size="sm"
                          data={[errors.task?.[index].description.message || '']}
                        />
                      )}
                    </div>

                    <div className="mb-6">
                      <label
                        className="mb-2.5 block font-medium text-black dark:text-white"
                        htmlFor={`task.${index}.beginDate`}
                      >
                        Data inicial <span className="text-danger">*</span>
                      </label>
                      <div className="relative">
                        <Controller
                          name={`task.${index}.beginDate`}
                          control={control}
                          render={({ field }) => (
                            <InputPattern
                              {...field}
                              id={`task.${index}.beginDate`}
                              mask="_"
                              icon={faCalendar}
                              iconPosition="left"
                              format="##/##/## ##:##"
                              placeholder="dd/mm/aa --:--"
                            />
                          )}
                        />
                      </div>
                      {errors.task?.[index]?.beginDate && (
                        <Alert
                          type="danger"
                          size="sm"
                          data={[errors.task?.[index].beginDate.message || '']}
                        />
                      )}
                    </div>

                    <div className="mb-6">
                      <label
                        className="mb-2.5 block font-medium text-black dark:text-white"
                        htmlFor={`task.${index}.endDate`}
                      >
                        Data final <span className="text-danger">*</span>
                      </label>
                      <div className="relative">
                        <Controller
                          name={`task.${index}.endDate`}
                          control={control}
                          render={({ field }) => (
                            <InputPattern
                              {...field}
                              id={`task.${index}.endDate`}
                              mask="_"
                              icon={faCalendar}
                              iconPosition="left"
                              format="##/##/## ##:##"
                              placeholder="dd/mm/aa --:--"
                            />
                          )}
                        />
                      </div>
                      {errors.task?.[index]?.endDate && (
                        <Alert
                          type="danger"
                          size="sm"
                          data={[errors.task?.[index].endDate.message || '']}
                        />
                      )}
                    </div>

                    {watch(`task.${index}.amount`) && (
                      <div className="mb-6">
                        <label
                          className="mb-2.5 block font-medium text-black dark:text-white"
                          htmlFor={`task.${index}.amount`}
                        >
                          Quantia <span className="text-danger">*</span>
                        </label>
                        <div className="relative">
                          <Controller
                            name={`task.${index}.amount`}
                            control={control}
                            render={({ field }) => (
                              <InputNumeric
                                {...field}
                                id={`task.${index}.amount`}
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
                        {/* TODO inserir o error */}
                      </div>
                    )}

                    {watch(`task.${index}.hourlyRate`) && (
                      <div className="mb-6">
                        <label
                          className="mb-2.5 block font-medium text-black dark:text-white"
                          htmlFor={`task.${index}.hourlyRate`}
                        >
                          Valor da Hora <span className="text-danger">*</span>
                        </label>
                        <div className="relative">
                          <Controller
                            name={`task.${index}.hourlyRate`}
                            control={control}
                            render={({ field }) => (
                              <InputNumeric
                                {...field}
                                id={`task.${index}.hourlyRate`}
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
                        {/* TODO inserir o error */}
                      </div>
                    )}

                    <div className="mb-6">
                      <label
                        className="mb-2.5 block font-medium text-black dark:text-white"
                        htmlFor={`task.${index}.revenue`}
                      >
                        Lucro <span className="text-danger">*</span>
                      </label>
                      <div className="relative">
                        <Controller
                          name={`task.${index}.revenue`}
                          control={control}
                          render={({ field }) => (
                            <InputNumeric
                              {...field}
                              id={`task.${index}.revenue`}
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
                      {errors.task?.[index]?.revenue && (
                        <Alert
                          type="danger"
                          size="sm"
                          data={[errors.task?.[index].revenue.message || '']}
                        />
                      )}
                    </div>

                    <div className="mb-6">
                      <label
                        className="mb-2.5 block font-medium text-black dark:text-white"
                        htmlFor={`task.${index}.statusUuid`}
                      >
                        Status <span className="text-danger">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          type="text"
                          id={`task.${index}.statusUuid`}
                          disabled
                          hidden
                          {...register(`task.${index}.statusUuid`)}
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
                      {errors.task?.[index]?.statusUuid && (
                        <Alert
                          type="danger"
                          size="sm"
                          data={[errors.task?.[index].statusUuid.message || '']}
                        />
                      )}
                    </div>

                    <div className="mb-6">
                      <label
                        className="mb-2.5 block font-medium text-black dark:text-white"
                        htmlFor={`task.${index}.userUuid`}
                      >
                        Usuário <span className="text-slate-400">?</span>
                      </label>
                      <div className="relative">
                        <Input
                          type="text"
                          id={`task.${index}.userUuid`}
                          disabled
                          hidden
                          {...register(`task.${index}.userUuid`)}
                        />

                        <UserSearch
                          user={user[index]}
                          setUser={(newUser) => {
                            setUser(
                              (prevUser) =>
                                prevUser && prevUser.map((u, i) => (i === index ? newUser : u))
                            )
                          }}
                        />
                      </div>
                      {errors.task?.[index]?.userUuid && (
                        <Alert
                          type="danger"
                          size="sm"
                          data={[errors.task?.[index].userUuid.message || '']}
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

          {errors.task?.message && (
            <Alert type="danger" size="lg" data={[errors.task.message || '']} />
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
