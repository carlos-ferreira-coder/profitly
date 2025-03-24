import { faAnglesLeft, faAnglesRight, faEllipsis } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface PaginationProps {
  itemsLength: number
  currentPage: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  windowSize?: number
}

export const Pagination: React.FC<PaginationProps> = ({
  itemsLength,
  currentPage,
  itemsPerPage,
  onPageChange,
  windowSize = 2,
}) => {
  const totalPages = Math.ceil(itemsLength / itemsPerPage) - 1
  const start = Math.max(currentPage - windowSize, 0)
  const end = Math.min(currentPage + windowSize, totalPages)

  // Adjust page range creation
  const pageRange = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  return (
    <>
      <div className="flex items-center justify-between px-7 py-3 shadow-1 rounded-md dark:bg-form-input border border-stroke dark:border-strokedark">
        {/* Display of item ranges */}
        <span>
          {`${itemsPerPage * currentPage + 1}-${Math.min(
            itemsPerPage * (currentPage + 1),
            itemsLength
          )} de ${itemsLength}`}
        </span>

        {/* Page navigation */}
        <div className="flex rounded-md border border-stroke dark:border-strokedark">
          {/* Button for first page */}
          <button
            disabled={currentPage === 0}
            onClick={() => onPageChange(0)}
            className={'w-8 h-8 rounded-l hover:bg-primary-50 hover:text-white'}
          >
            <FontAwesomeIcon icon={faAnglesLeft} />
          </button>

          {/* Ellipsis before pages */}
          {start > 0 && (
            <button disabled className={'w-8 h-8'}>
              <FontAwesomeIcon icon={faEllipsis} />
            </button>
          )}

          {/* Page mapping */}
          {pageRange.map((index) => (
            <button
              key={index}
              disabled={currentPage === index}
              onClick={() => onPageChange(index)}
              className={`w-8 h-8 ${
                currentPage === index
                  ? 'bg-primary text-white'
                  : 'hover:bg-primary-50 hover:text-white'
              }`}
            >
              {index + 1}
            </button>
          ))}

          {/* Ellipsis after pages */}
          {end < totalPages && (
            <button disabled className={'w-8 h-8'}>
              <FontAwesomeIcon icon={faEllipsis} />
            </button>
          )}

          {/* Button to last page */}
          <button
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(totalPages)}
            className={'w-8 h-8 rounded-r hover:bg-primary-50 hover:text-white'}
          >
            <FontAwesomeIcon icon={faAnglesRight} />
          </button>
        </div>
      </div>
    </>
  )
}
