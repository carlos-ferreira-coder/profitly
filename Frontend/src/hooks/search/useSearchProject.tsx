import { useEffect, useState } from 'react'
import { Input } from '../../components/Form/Input'
import { ProjectProps } from '../../types/Database'
import { api as axios, handleAxiosError } from '../../services/Axios'
import Alert from '../../components/Alert/Index'
import Loader from '../../components/Loader'
import Button from '../../components/Form/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faAngleRight,
  faCircleCheck,
  faCircleXmark,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'

const ProjectInfo = ({ project }: { project: ProjectProps }) => (
  <>
    <div className="col-span-5">
      <p>
        <b>Nome: </b> {project.name}
        {project.active ? (
          <FontAwesomeIcon icon={faCircleCheck} className="ml-2 text-success" />
        ) : (
          <FontAwesomeIcon icon={faCircleXmark} className="ml-2 text-danger" />
        )}
      </p>
      <p>
        <b>Descrição: </b> {project.description}
      </p>
    </div>
  </>
)

const ProjectSearch = ({
  project,
  setProject,
}: {
  project: ProjectProps | null
  setProject: (value: ProjectProps | null) => void
}) => {
  const [search, setSearch] = useState<string | null>('')
  const [projects, setProjects] = useState<ProjectProps[] | null>(null)
  const [alertErrors, setAlertErrors] = useState<(string | JSX.Element)[] | null>(null)

  // Get projects
  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await axios.get('project/select/all', {
          withCredentials: true,
        })

        setProjects(data)
      } catch (error) {
        setAlertErrors([handleAxiosError(error)])
      }
    })()
  }, [])

  useEffect(() => {
    if (!project) setSearch('')
  }, [project])

  return (
    <>
      {project ? (
        <div className="grid grid-cols-6 p-3 text-sm text-black dark:text-white shadow-1 rounded-md border border-stroke dark:border-strokedark dark:bg-form-input/50">
          <ProjectInfo project={project} />

          <div className="col-span-1 flex flex-col justify-center items-center">
            <Button
              color="danger"
              type="button"
              className="w-8 h-8"
              onClick={() => {
                setProject(null)
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

          {projects ? (
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
                ? projects.filter((project) => {
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
                      normalizeString(project.name).includes(normalizedSearch) ||
                      normalizeString(project.description).includes(normalizedSearch)
                    )
                  })
                : projects
              ).map((project) => (
                <div
                  key={project.uuid}
                  className="grid grid-cols-6 mt-2 w-full p-3 shadow-1 rounded-md border border-stroke dark:border-strokedark dark:bg-form-input/50"
                >
                  <ProjectInfo project={project} />

                  <div className="col-span-1 flex flex-col justify-center items-center">
                    <Button
                      color="primary"
                      type="button"
                      className="w-8 h-8"
                      onClick={() => setProject(project)}
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

export default ProjectSearch
