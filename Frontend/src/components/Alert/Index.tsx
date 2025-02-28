import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { faCheck, faTriangleExclamation, faXmark } from '@fortawesome/free-solid-svg-icons'
import { tv } from 'tailwind-variants'
import { twMerge } from 'tailwind-merge'
import Messages from './messages'

// Type props
export type AlertSize = 'sm' | 'lg'
export type AlertType = 'danger' | 'warning' | 'success'
export type AlertProps = {
  data: (string | JSX.Element)[]
  type: AlertType
  size: AlertSize
  className?: string
}

// Alert icons
const icon: Record<string, IconProp> = {
  danger: faXmark,
  warning: faTriangleExclamation,
  success: faCheck,
}

// tailwind variant for div
const divClassName = tv({
  base: 'flex items-center w-full rounded-md border-l-6 bg-opacity-[15%] shadow-md dark:bg-[#1B1B24] dark:bg-opacity-30',
  variants: {
    size: {
      sm: 'my-3',
      lg: 'my-6',
    },
    color: {
      danger: 'border-red-400 bg-red-400',
      warning: 'border-orange-400 bg-orange-400',
      success: 'border-green-400 bg-green-400',
    },
  },
})

// tailwind variant for div/div
const divDivClassName = tv({
  base: 'flex m-5 w-9.5 h-8.5 items-center justify-center rounded-lg',
  variants: {
    color: {
      danger: 'bg-red-400',
      warning: 'bg-orange-400',
      success: 'bg-green-400',
    },
  },
})

const Alert = ({ type, size, data, className }: AlertProps) => {
  // size small
  if (size === 'sm') {
    return (
      <div className={twMerge(divClassName({ size: 'sm', color: type }), className)}>
        <div className="flex w-full m-1 pl-3">{Messages(type, data)}</div>
      </div>
    )
  }

  // size lg
  return (
    <div className={twMerge(divClassName({ size: 'lg', color: type }), className)}>
      <div className={divDivClassName({ color: type })}>
        <FontAwesomeIcon
          icon={icon[type]}
          className="text-white dark:text-[#1B1B24] dark:text-opacity-75"
        />
      </div>
      <div className="w-full flex mt-3.5 mb-3.5">{Messages(type, data)}</div>
    </div>
  )
}

export default Alert
