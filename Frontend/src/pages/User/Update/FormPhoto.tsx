import { z } from 'zod'
import { useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUpFromBracket } from '@fortawesome/free-solid-svg-icons'
import { api as axios, handleAxiosError } from '../../../services/Axios'
import Alert from '../../../components/Alert/Index'
import Button from '../../../components/Form/Button'
import { userPhotoURL } from '../../../services/Axios'
import { UserProps } from '../../../types/Database'
import { useNavigate } from 'react-router-dom'
import { userFilePhotoSchema, uuidSchema } from '../../../hooks/useSchema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '../../../components/Form/Input'

const FormPhoto = ({ user }: { user: UserProps }) => {
  const navigate = useNavigate()
  const [alertErrors, setAlertErrors] = useState<(string | JSX.Element)[] | null>(null)
  const [alertSuccesses, setAlertSuccesses] = useState<(string | JSX.Element)[] | null>(null)

  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'request' | 'uploading'>('idle')
  const [uploadProgress, setUploadProgress] = useState<number>(0)

  // Handle change image file
  const handleChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAlertErrors(null)
    setAlertSuccesses(null)

    // File schema
    const filesSchema = userFilePhotoSchema

    // Set file
    const files = e.target.files
    if (files && files.length > 0) {
      const { success, error } = filesSchema.safeParse(files)
      if (success) {
        setFile(files[0])
        return
      }
      setAlertErrors([error.errors[0].message])
    }
  }

  // Set preview image file
  const previewURL = useMemo(() => {
    if (!file) return null
    return URL.createObjectURL(file)
  }, [file])

  // Photo schema
  const schema = uuidSchema('usuário')
  type SchemaProps = z.infer<typeof schema>

  const defaultValues = {
    uuid: user.uuid,
  }

  // Hookform
  const { reset, register, handleSubmit } = useForm<SchemaProps>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues,
  })

  // Handle reset
  const handleReset = () => {
    setFile(null)
    setAlertErrors(null)
    setAlertSuccesses(null)
    reset(defaultValues)
  }

  // Button to alert message for reload page
  const btnReload = () => {
    return (
      <Button
        type="button"
        color="success"
        onClick={() => window.location.reload()}
        className="h-8 w-35 bg-green-400 dark:text-form-input dark:bg-green-400"
      >
        Atualizar Pagina
      </Button>
    )
  }

  // Button to alert message for list user
  const btnList = () => {
    return (
      <Button
        type="button"
        color="success"
        onClick={() => navigate('/user/select')}
        className="h-8 w-35 bg-green-400 dark:text-form-input dark:bg-green-400"
      >
        Listar usuários
      </Button>
    )
  }

  // Update photo on backend
  const updatePhoto = async (data: SchemaProps): Promise<void> => {
    // Check if has file
    if (!file) {
      setAlertErrors(['Selecione uma imagem'])
      return
    }

    setStatus('uploading')

    setUploadProgress(0)
    setAlertErrors(null)
    setAlertSuccesses(null)

    try {
      await axios.patch(
        '/user/update/photo',
        { uuid: data.uuid, photo: file },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          // Set progress in percent
          onUploadProgress: (ProgressEvent) => {
            const progress = ProgressEvent.total
              ? Math.round((ProgressEvent.loaded * 100) / ProgressEvent.total)
              : 0
            setUploadProgress(progress)
          },
        }
      )

      setAlertSuccesses(['A foto foi atualizada', btnReload(), <br />, btnList()])
      setUploadProgress(100)
    } catch (error) {
      setAlertErrors([handleAxiosError(error)])
      setUploadProgress(0)
    }

    setStatus('idle')
  }

  // Delete photo on backend
  const deletePhoto = async (data: SchemaProps) => {
    setStatus('request')

    setAlertErrors(null)
    setAlertSuccesses(null)

    try {
      await axios.patch('/user/delete/photo', data, {
        withCredentials: true,
      })
      setAlertSuccesses(['A foto foi excluida.', btnReload(), <br />, btnList()])
    } catch (error) {
      setAlertErrors([handleAxiosError(error)])
    }

    setStatus('idle')
  }

  return (
    <form>
      <Input type="text" hidden disabled {...register('uuid')} />

      <div className="mb-4 flex items-center gap-3">
        <div className="h-14 w-14 rounded-full">
          <img
            src={userPhotoURL(user?.photo)}
            alt="User"
            className="h-12 w-12 rounded-full object-cover"
          />
        </div>
        <div>
          <span className="mb-1.5 text-black dark:text-white">Editar foto</span>
          <span className="flex gap-2.5">
            <Button
              type="button"
              onClick={() => handleReset()}
              base="none"
              color="none"
              className="text-sm hover:text-primary-50"
            >
              Limpar
            </Button>
          </span>
        </div>
      </div>

      <div className="relative mb-5.5 block w-full cursor-pointer appearance-none rounded border border-dashed border-primary-50 bg-gray py-4 px-4 dark:bg-meta-4 sm:py-7.5">
        <input
          id="photo"
          name="photo"
          type="file"
          accept="image/svg+xml, image/png, .jpg, .jpeg"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            handleChangeFile(e)
          }}
          className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
        />

        {previewURL ? (
          <div className="flex justify-center items-center">
            <img src={previewURL} alt="User" className="h-1/2 w-1/2" />
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center space-y-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-stroke bg-white dark:border-strokedark dark:bg-form-input">
                <FontAwesomeIcon icon={faArrowUpFromBracket} className="text-primary-50" />
              </span>
              <p>
                <span className="text-primary-50">Clique para buscar</span> ou arraste a foto
              </p>
              <p className="mt-1.5">SVG, PNG ou JPG</p>
              <p>(max: 800 x 800px)</p>
            </div>
          </>
        )}
      </div>

      {alertErrors && <Alert type="danger" size="lg" data={alertErrors} />}
      {alertSuccesses && <Alert type="success" size="lg" data={alertSuccesses} />}
      {status === 'uploading' && (
        <Alert type="warning" size="lg" data={[`Enviando imagem: ${uploadProgress}%`]} />
      )}

      <div className="flex justify-end gap-4.5">
        <Button
          type="button"
          color="danger"
          onClick={handleSubmit(deletePhoto)}
          disabled={status === 'uploading' || status === 'request'}
          loading={status === 'request'}
        >
          Deletar
        </Button>

        <Button
          type="button"
          color="primary"
          onClick={handleSubmit(updatePhoto)}
          disabled={status === 'uploading' || status === 'request'}
          loading={status === 'uploading'}
        >
          Atualizar
        </Button>
      </div>
    </form>
  )
}

export default FormPhoto
