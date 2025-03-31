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
import { refundCreateSchema } from '../../../../hooks/useSchema'
import { ClientProps, ProjectProps, SupplierProps } from '../../../../types/Database'
import ProjectSearch from '../../../../hooks/search/useSearchProject'
import SupplierSearch from '../../../../hooks/search/useSearchSupplier'
import ClientSearch from '../../../../hooks/search/useSearchClient'

const Form = () => {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'idle' | 'request'>('idle')
  const [project, setProject] = useState<ProjectProps | null>(null)
  const [supplier, setSupplier] = useState<SupplierProps | null>(null)
  const [client, setClient] = useState<ClientProps | null>(null)
  const [alertErrors, setAlertErrors] = useState<(string | JSX.Element)[] | null>(null)
  const [alertSuccesses, setAlertSuccesses] = useState<(string | JSX.Element)[] | null>(null)

  // Refund schema
  const schema = refundCreateSchema
  type SchemaProps = z.infer<typeof schema>

  const defaultValues = {
    clientUuid: undefined,
    supplierUuid: undefined,
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
    setClient(null)
    setSupplier(null)

    reset(defaultValues)
  }

  useEffect(() => {
    setValue('transaction.projectUuid', project ? project.uuid : '')
  }, [project, setValue])

  useEffect(() => {
    setValue('clientUuid', client ? client.uuid : '')
  }, [client, setValue])

  useEffect(() => {
    setValue('supplierUuid', supplier ? supplier.uuid : '')
  }, [supplier, setValue])

  // Create refund in backend
  const createRefund = async (data: SchemaProps) => {
    setStatus('request')
    setAlertErrors(null)
    setAlertSuccesses(null)

    try {
      const response = await axios.post('/transaction/refund/create', data, {
        withCredentials: true,
      })

      setAlertSuccesses([
        response.data.message,
        <Button
          type="button"
          color="success"
          onClick={() => navigate('/refund/select')}
          className="h-8 w-35 bg-green-400 dark:text-form-input dark:bg-green-400"
        >
          Listar reembolso
        </Button>,
      ])
    } catch (error) {
      setAlertErrors([handleAxiosError(error)])
    }

    setStatus('idle')
  }

  return (
    <form onSubmit={handleSubmit(createRefund)}>
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
          htmlFor="projectUuid"
        >
          Projeto <span className="text-danger">*</span>
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

      <div className="mb-6">
        <label
          className="mb-2.5 block font-medium text-black dark:text-white"
          htmlFor="clientrUuid"
        >
          Cliente <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <Input type="text" id="clientUuid" disabled hidden {...register('clientUuid')} />

          <ClientSearch client={client} setClient={setClient} />
        </div>
        {errors.clientUuid && (
          <Alert type="danger" size="sm" data={[errors.clientUuid.message || '']} />
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
