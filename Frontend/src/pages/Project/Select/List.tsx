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
      <b>Data inicial: </b> {project.dates.beginDate}
    </p>
    <p>
      <b>Data final: </b> {project.dates.endDate}
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

const ProjectBudgetInfo = ({ project }: { project: ProjectProps }) => (
  <>
    <p>
      <b>Total previsto: </b> {project.budget.total}
    </p>
    <p>
      <b>Lucro previsto: </b> {project.budget.revenue}
    </p>
    <p>
      <b>Custo previsto: </b> {project.budget.cost}
    </p>
  </>
)

const ProjectProjectInfo = ({ project }: { project: ProjectProps }) => (
  <>
    <p>
      <b>Total atual: </b> {project.proj.total}
    </p>
    <p>
      <b>Lucro atual: </b> {project.proj.revenue}
    </p>
    <p>
      <b>Custo atual: </b> {project.proj.cost}
    </p>
  </>
)

const ProjectTransactionInfo = ({ project }: { project: ProjectProps }) => (
  <>
    <p>
      <b>Receita corrente: </b> {project.tx.income}
    </p>
    <p>
      <b>Lucro corrente: </b> {project.tx.revenue}
    </p>
    <p>
      <b>Despesa corrente: </b> {project.tx.expense}
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
                  <ProjectBudgetInfo project={project} />

                  <ProjectProjectInfo project={project} />

                  <ProjectTransactionInfo project={project} />
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
                  <ProjectBudgetInfo project={project} />
                </div>
                <div className="col-span-2 hidden lg:flex flex-col justify-center space-y-2">
                  <ProjectProjectInfo project={project} />
                </div>
                <div className="col-span-2 hidden lg:flex flex-col justify-center space-y-2">
                  <ProjectTransactionInfo project={project} />
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

              <Button
                color="warning"
                className="w-8 h-8"
                onClick={() => navigate(`/project/tasks/${project.uuid}`)}
              >
                <FontAwesomeIcon icon={faListCheck} />
              </Button>

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
