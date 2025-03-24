import React, { useState, ComponentProps } from 'react'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons'
import { tv } from 'tailwind-variants'
import { twMerge } from 'tailwind-merge'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// type props
export interface Options {
  value: string | number
  label: string
  disabled: boolean
}

type SelectProps = ComponentProps<'select'> & {
  name: string
  value: string | number
  icon?: IconProp
  options: Options[]
  isSelected?: boolean
  base?: 'default' | 'none'
  iconPosition?: 'left' | 'right'
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
}

// tailwind variant for select
const selectClassName = tv({
  base: '',
  variants: {
    base: {
      none: '',
      default:
        'relative z-20 w-full appearance-none rounded-xl border border-stroke bg-transparent py-3.5 px-12 outline-none focus:border-primary active:border-primary dark:focus:border-primary-50 dark:active:border-primary-50 dark:border-form-strokedark dark:bg-form-input',
    },
  },
  defaultVariants: {
    base: 'default',
  },
})

// tailwind variant for icon
const iconClassName = tv({
  base: 'absolute top-4 z-30',
  variants: {
    position: {
      default: '',
      left: 'left-4.5',
      right: 'right-4.5',
    },
  },
})

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ icon, iconPosition, base, className, isSelected, ...props }, ref) => {
    const [isOptionSelected, setIsOptionSelected] = useState<boolean>(
      isSelected ? isSelected : false
    )

    const handleOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setIsOptionSelected(true)
      props.onChange(e)
    }

    return (
      <div className="relative z-20">
        {icon && (
          <span className={iconClassName({ position: iconPosition })}>
            <FontAwesomeIcon icon={icon} />
          </span>
        )}

        <select
          {...props}
          ref={ref}
          name={props.name}
          value={props.value}
          onChange={handleOnChange}
          className={twMerge(
            selectClassName({ base: base }),
            isOptionSelected ? 'text-black dark:text-white' : '',
            className
          )}
        >
          {props.options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className="text-body dark:text-bodydark"
            >
              {option.label}
            </option>
          ))}
        </select>

        <span
          className={iconClassName({
            position: icon ? (iconPosition === 'right' ? 'left' : 'right') : iconPosition,
          })}
        >
          <FontAwesomeIcon icon={faAngleDown} />
        </span>
      </div>
    )
  }
)
