import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input, InputNumeric, InputPattern } from '../../../../components/Form/Input'
import Alert from '../../../../components/Alert/Index'
import Button from '../../../../components/Form/Button'
import { api as axios, handleAxiosError } from '../../../../services/Axios'
import {
  faAlignLeft,
  faCalendar,
  faDollarSign,
  faFileInvoiceDollar,
} from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import { loanCreateSchema } from '../../../../hooks/useSchema'
import { ProjectProps, SupplierProps } from '../../../../types/Database'
import ProjectSearch from '../../../../hooks/search/useSearchProject'
import SupplierSearch from '../../../../hooks/search/useSearchSupplier'

const Form = () => {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'idle' | 'request'>('idle')
  const [project, setProject] = useState<ProjectProps | null>(null)
  const [supplier, setSupplier] = useState<SupplierProps | null>(null)
  const [alertErrors, setAlertErrors] = useState<(string | JSX.Element)[] | null>(null)
  const [alertSuccesses, setAlertSuccesses] = useState<(string | JSX.Element)[] | null>(null)

  // Loan schema
  const schema = loanCreateSchema
  type SchemaProps = z.infer<typeof schema>

  const defaultValues = {
    supplierUuid: undefined,
    installment: '',
    months: '',
    transaction: {
      name: '',
      description: '',
      date: '',
      amount: '',
      projectUuid: '',
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

    setProject(null)
    setSupplier(null)

    reset(defaultValues)
  }

  useEffect(() => {
    setValue('transaction.projectUuid', project ? project.uuid : '')
  }, [project, setValue])

  useEffect(() => {
    setValue('supplierUuid', supplier ? supplier.uuid : '')
  }, [supplier, setValue])

  // Create loan in backend
  const createLoan = async (data: SchemaProps) => {
    setStatus('request')
    setAlertErrors(null)
    setAlertSuccesses(null)

    try {
      const response = await axios.post('/transaction/loan/create', data, {
        withCredentials: true,
      })

      setAlertSuccesses([
        response.data.message,
        <Button
          type="button"
          color="success"
          onClick={() => navigate('/loan/select')}
          className="h-8 w-35 bg-green-400 dark:text-form-input dark:bg-green-400"
        >
          Listar despesas
        </Button>,
      ])
    } catch (error) {
      setAlertErrors([handleAxiosError(error)])
    }

    setStatus('idle')
  }

  return (
    <form onSubmit={handleSubmit(createLoan)}>
      <div className="mb-6">
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="name">
          Nome <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <Input
            id="name"
            type="text"
            icon={faFileInvoiceDollar}
            iconPosition="left"
            {...register('transaction.name')}
            placeholder="Digite o nome"
          />
        </div>
        {errors.transaction?.name && (
          <Alert type="danger" size="sm" data={[errors.transaction.name.message || '']} />
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
            id="description"
            type="text"
            icon={faAlignLeft}
            iconPosition="left"
            {...register('transaction.description')}
            placeholder="Digite a descrição"
          />
        </div>
        {errors.transaction?.description && (
          <Alert type="danger" size="sm" data={[errors.transaction.description.message || '']} />
        )}
      </div>

      <div className="mb-6">
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="date">
          Data <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <Controller
            name="transaction.date"
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
        {errors.transaction?.date && (
          <Alert type="danger" size="sm" data={[errors.transaction.date.message || '']} />
        )}
      </div>

      <div className="mb-6">
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="amount">
          Quantia <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <Controller
            name="transaction.amount"
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
        {errors.transaction?.amount && (
          <Alert type="danger" size="sm" data={[errors.transaction.amount.message || '']} />
        )}
      </div>

      <div className="mb-6">
        <label
          className="mb-2.5 block font-medium text-black dark:text-white"
          htmlFor="installment"
        >
          Parcela <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <Controller
            name="installment"
            control={control}
            render={({ field }) => (
              <InputNumeric
                {...field}
                id="installment"
                icon={faDollarSign}
                iconPosition="left"
                prefix={'R$ '}
                fixedDecimalScale
                decimalScale={2}
                allowNegative={false}
                decimalSeparator=","
                thousandSeparator="."
                placeholder="Digite o valor da parcela"
              />
            )}
          />
        </div>
        {errors.installment && (
          <Alert type="danger" size="sm" data={[errors.installment.message || '']} />
        )}
      </div>

      <div className="mb-6">
        <label className="mb-2.5 block font-medium text-black dark:text-white" htmlFor="months">
          Nº de meses <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <Controller
            name="months"
            control={control}
            render={({ field }) => (
              <InputPattern
                {...field}
                id="months"
                mask="_"
                icon={faCalendar}
                iconPosition="left"
                format="##"
                placeholder="Digite a qunatidade de meses"
              />
            )}
          />
        </div>
        {errors.months && <Alert type="danger" size="sm" data={[errors.months.message || '']} />}
      </div>

      <div className="mb-6">
        <label
          className="mb-2.5 block font-medium text-black dark:text-white"
          htmlFor="projectUuid"
        >
          Projeto <span className="text-slate-400">?</span>
        </label>
        <div className="relative">
          <Input
            type="text"
            id="projectUuid"
            disabled
            hidden
            {...register('transaction.projectUuid')}
          />

          <ProjectSearch project={project} setProject={setProject} />
        </div>
        {errors.transaction?.projectUuid && (
          <Alert type="danger" size="sm" data={[errors.transaction.projectUuid.message || '']} />
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
          <Input type="text" id="supplierUuid" disabled hidden {...register('supplierUuid')} />

          <SupplierSearch supplier={supplier} setSupplier={setSupplier} />
        </div>
        {errors.supplierUuid && (
          <Alert type="danger" size="sm" data={[errors.supplierUuid.message || '']} />
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
