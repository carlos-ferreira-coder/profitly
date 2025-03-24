import { useEffect, useState } from 'react'
import { Input } from '../../components/Form/Input'
import { StatusProps } from '../../types/Database'
import { api as axios, handleAxiosError } from '../../services/Axios'
import Alert from '../../components/Alert/Index'
import Loader from '../../components/Loader'
import Button from '../../components/Form/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleRight, faXmark } from '@fortawesome/free-solid-svg-icons'

const StatusInfo = ({ status }: { status: StatusProps }) => (
  <>
    <div className="col-span-3 flex flex-col justify-center space-y-1">
      <p>
        <b>Nome: </b> {status.name}
      </p>
      <p>
        <b>Descrição: </b> {status.description}
      </p>
    </div>

    <div className="col-span-2 flex flex-col justify-center space-y-1">
      <p>
        <b>Prioridade: </b> {status.priority < 4 ? 'Alta' : status.priority < 8 ? 'Média' : 'Baixa'}
      </p>
    </div>
  </>
)

const StatusSearch = ({
  status,
  setStatus,
}: {
  status: StatusProps | null
  setStatus: (value: StatusProps | null) => void
}) => {
  const [search, setSearch] = useState<string | null>('')
  const [statuss, setStatuss] = useState<StatusProps[] | null>(null)
  const [alertErrors, setAlertErrors] = useState<(string | JSX.Element)[] | null>(null)

  // Get statuss
  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await axios.get('status/select/all', {
          withCredentials: true,
        })

        setStatuss(data)
      } catch (error) {
        setAlertErrors([handleAxiosError(error)])
      }
    })()
  }, [])

  useEffect(() => {
    if (!status) setSearch('')
  }, [status])

  return (
    <>
      {status ? (
        <div className="grid grid-cols-6 gap-1 p-3 text-sm text-black dark:text-white shadow-1 rounded-md border border-stroke dark:border-strokedark dark:bg-form-input/50">
          <StatusInfo status={status} />

          <div className="col-span-1 flex flex-col justify-center items-center">
            <Button
              color="danger"
              type="button"
              className="w-8 h-8"
              onClick={() => {
                setStatus(null)
                setSearch('')
              }}
            >
              <FontAwesomeIcon icon={faXmark} />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col p-3 text-sm text-black dark:text-white shadow-1 rounded-md border border-stroke dark:border-strokedark dark:bg-form-input/50">
          {alertErrors && <Alert type="danger" size="lg" data={alertErrors} />}

          <Input
            placeholder="Buscar..."
            value={search || ''}
            onChange={(e) => setSearch(e.target.value)}
          />

          {statuss ? (
            search === '' ? (
              <Button
                color="primary"
                type="button"
                className="mt-2"
                onClick={() => setSearch(null)}
              >
                Mostrar todos
              </Button>
            ) : (
              (search
                ? statuss.filter((status) => {
                    const normalizeString = (str?: string) => {
                      if (!str) return ''

                      return str
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .trim()
                        .toLowerCase()
                    }

                    const normalizedSearch = normalizeString(search)

                    return (
                      normalizeString(status.name).includes(normalizedSearch) ||
                      normalizeString(status.description).includes(normalizedSearch) ||
                      (normalizedSearch === 'alta' && status.priority < 4) ||
                      (normalizedSearch === 'media' && status.priority < 8) ||
                      (normalizedSearch === 'baixa' && status.priority >= 8)
                    )
                  })
                : statuss
              ).map((status) => (
                <div
                  key={status.uuid}
                  className="grid grid-cols-6 mt-2 w-full gap-1 p-3 shadow-1 rounded-md border border-stroke dark:border-strokedark dark:bg-form-input/50"
                >
                  <StatusInfo status={status} />

                  <div className="col-span-1 flex flex-col justify-center items-center">
                    <Button
                      color="primary"
                      type="button"
                      className="w-8 h-8"
                      onClick={() => setStatus(status)}
                    >
                      <FontAwesomeIcon icon={faAngleRight} />
                    </Button>
                  </div>
                </div>
              ))
            )
          ) : (
            <Loader />
          )}
        </div>
      )}
    </>
  )
}

export default StatusSearch
