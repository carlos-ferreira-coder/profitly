import { useState } from 'react'
import { Pagination } from '../../../hooks/usePagination'
import Button from '../../../components/Form/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleCheck,
  faCircleXmark,
  faFileInvoiceDollar,
  faListCheck,
  faPenToSquare,
  faPlus,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import { ProjectProps } from '../../../types/Database'
import { currencyToNumber } from '../../../hooks/useCurrency'
import { useAuth } from '../../../context/AuthContext'

const ProjectDescInfo = ({ project }: { project: ProjectProps }) => (
  <>
    <p>
      <b>Nome: </b> {project.name}
      {project.active ? (
        <FontAwesomeIcon icon={faCircleCheck} className="ml-2 text-success" />
      ) : (
        <FontAwesomeIcon icon={faCircleXmark} className="ml-2 text-danger" />
      )}
    </p>
    <p>
      <b>Descrição: </b>{' '}
      {project.description.length <= 125
        ? project.description
        : `${project.description.slice(0, 122)}...`}
    </p>
  </>
)

const ProjectStatsInfo = ({ project }: { project: ProjectProps }) => (
  <>
    <p>
      <b>Data inicial: </b> {project.beginDate}
    </p>
    <p>
      <b>Data final: </b> {project.endDate}
    </p>
    {project.user && (
      <p>
        <b>Usuário: </b> {project.user.username}
      </p>
    )}
    <p>
      <b>Status: </b> {project.status.name}
    </p>
    <p>
      <b>Prioridade: </b>
      {project.status.priority < 4 ? 'Alta' : project.status.priority < 8 ? 'Média' : 'Baixa'}
    </p>
  </>
)

const ProjectPrevInfo = ({ project }: { project: ProjectProps }) => (
  <>
    <p>
      <b>Total previsto: </b> {project.prevTotal}
    </p>
    <p>
      <b>Lucro previsto: </b> {project.prevRevenue}
    </p>
    <p>
      <b>Custo previsto: </b> {project.prevCost}
    </p>
  </>
)

const ProjectActualInfo = ({ project }: { project: ProjectProps }) => (
  <>
    <p>
      <b>Total atual: </b> {project.total}
    </p>
    <p>
      <b>Lucro atual: </b> {project.revenue}
    </p>
    <p>
      <b>Custo atual: </b> {project.cost}
    </p>
  </>
)

const ProjectCurrentInfo = ({ project }: { project: ProjectProps }) => (
  <>
    <p>
      <b>Receita corrente: </b> {project.currentIncome}
    </p>
    <p>
      <b>Lucro corrente: </b> {project.currentRevenue}
    </p>
    <p>
      <b>Despesa corrente: </b> {project.currentExpense}
    </p>
  </>
)

const List = ({ projects }: { projects: ProjectProps[] }) => {
  const { auth } = useAuth()

  const itemsPerPage = 5
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState<number>(0)

  const start = currentPage * itemsPerPage
  const end = Math.min((currentPage + 1) * itemsPerPage - 1, projects.length - 1)
  const pageRange = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  return (
    <>
      <div className="flex justify-end">
        <Button color="success" className="w-50 h-8" onClick={() => navigate('/project/create/')}>
          <FontAwesomeIcon icon={faPlus} className="mr-1" />
          Adicionar projeto
        </Button>
      </div>

      {pageRange.map((key) => {
        const project = projects[key]

        return (
          <div
            key={project.uuid}
            className="grid grid-cols-6 lg:grid-cols-11 gap-2 my-3 px-3 lg:px-5 py-3 text-sm text-black dark:text-white shadow-1 rounded-md border border-stroke dark:border-strokedark dark:bg-form-input/50"
          >
            <div className="col-span-5 lg:hidden flex flex-col justify-center space-y-2">
              <ProjectDescInfo project={project} />

              <ProjectStatsInfo project={project} />

              {auth?.financial && (
                <>
                  <ProjectPrevInfo project={project} />

                  <ProjectActualInfo project={project} />

                  <ProjectCurrentInfo project={project} />
                </>
              )}
            </div>

            <div className="col-span-2 hidden lg:flex flex-col justify-center space-y-2">
              <ProjectDescInfo project={project} />
            </div>

            <div className="col-span-2 hidden lg:flex flex-col justify-center space-y-2">
              <ProjectStatsInfo project={project} />
            </div>

            {auth?.financial && (
              <>
                <div className="col-span-2 hidden lg:flex flex-col justify-center space-y-2">
                  <ProjectPrevInfo project={project} />
                </div>
                <div className="col-span-2 hidden lg:flex flex-col justify-center space-y-2">
                  <ProjectActualInfo project={project} />
                </div>
                <div className="col-span-2 hidden lg:flex flex-col justify-center space-y-2">
                  <ProjectCurrentInfo project={project} />
                </div>
              </>
            )}

            <div className="col-span-1 flex flex-col justify-center items-center space-y-6 lg:space-y-2">
              <Button
                color="primary"
                className="w-8 h-8"
                onClick={() => navigate(`/project/update/${project.uuid}`)}
              >
                <FontAwesomeIcon icon={faPenToSquare} />
              </Button>

              <Button
                color="success"
                className="w-8 h-8"
                onClick={() => navigate(`/project/budget/${project.budgetUuid}`)}
              >
                <FontAwesomeIcon icon={faFileInvoiceDollar} />
              </Button>

              {currencyToNumber(project.prevTotal, 'BRL') !== 0 && (
                <Button
                  color="warning"
                  className="w-8 h-8"
                  onClick={() => navigate(`/project/tasks/${project.uuid}`)}
                >
                  <FontAwesomeIcon icon={faListCheck} />
                </Button>
              )}

              <Button
                color="danger"
                className="w-8 h-8"
                onClick={() => navigate(`/project/delete/${project.uuid}`)}
              >
                <FontAwesomeIcon icon={faTrashCan} />
              </Button>
            </div>
          </div>
        )
      })}

      <Pagination
        itemsLength={projects.length}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </>
  )
}

export default List
