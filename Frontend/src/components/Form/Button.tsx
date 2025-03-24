import { ComponentProps } from 'react'
import { tv } from 'tailwind-variants'
import { twMerge } from 'tailwind-merge'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

// type props
type ButtonProps = ComponentProps<'button'> & {
  base?: 'none' | 'default'
  color: 'none' | 'white' | 'danger' | 'primary' | 'success' | 'warning'
  loading?: boolean
}

// tailwind variant for button
const btnClassName = tv({
  base: '',
  variants: {
    base: {
      none: '',
      default:
        'flex items-center justify-center w-full h-12 rounded rounded-lg text-white font-medium hover:scale-105 hover:shadow-2 hover:bg-opacity-90 dark:hover:bg-opacity-80',
    },
    color: {
      none: '',
      success: 'bg-success dark:bg-success',
      primary: 'bg-primary dark:bg-primary-50',
      danger: 'bg-danger dark:bg-danger',
      warning: 'bg-warning dark:bg-warning',
      white:
        'bg-slate-50 text-meta-4 border border-stroke dark:bg-slate-200 dark:border-strokedark',
    },
  },
  defaultVariants: {
    base: 'default',
    color: 'none',
  },
})

const Button = ({ base, color, className, loading, children, ...props }: ButtonProps) => {
  return (
    <button {...props} className={twMerge(btnClassName({ base: base, color: color }), className)}>
      {loading ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : children}
    </button>
  )
}

export default Button
