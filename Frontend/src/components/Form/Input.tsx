import React, { useState, ComponentProps } from 'react'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import {
  NumericFormat,
  PatternFormat,
  NumericFormatProps,
  PatternFormatProps,
} from 'react-number-format'
import { tv } from 'tailwind-variants'
import { twMerge } from 'tailwind-merge'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

// Type props
export type InputProps = {
  base?: 'none' | 'default'
  icon?: IconProp
  iconPosition?: 'left' | 'right'
}

// tailwind variant for input
const inputClassName = tv({
  base: '',
  variants: {
    base: {
      none: '',
      default:
        'w-full rounded-xl border border-stroke bg-tranparent py-3.5 text-black outline-none focus:border-primary-50 dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary-50',
    },
    iconPosition: {
      default: 'px-6',
      left: 'pr-6 pl-11.5',
      right: 'pl-6 pr-11.5',
    },
  },
  defaultVariants: {
    base: 'default',
    iconPosition: 'default',
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

export const Input = React.forwardRef<HTMLInputElement, InputProps & ComponentProps<'input'>>(
  ({ icon, iconPosition, base, className, ...props }, ref) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false)

    return (
      <>
        {icon && (
          <span className={iconClassName({ position: iconPosition })}>
            <FontAwesomeIcon icon={icon} />
          </span>
        )}

        <input
          {...props}
          ref={ref}
          type={props.type !== 'password' ? props.type : isPasswordVisible ? 'text' : 'password'}
          className={twMerge(
            inputClassName({
              base: base,
              iconPosition: iconPosition,
            }),
            className
          )}
        />

        {props.type === 'password' && (
          <span
            onClick={() => {
              setIsPasswordVisible(!isPasswordVisible)
            }}
            className={iconClassName({
              position: icon ? (iconPosition === 'right' ? 'left' : 'right') : iconPosition,
            })}
          >
            <FontAwesomeIcon icon={isPasswordVisible ? faEyeSlash : faEye} />
          </span>
        )}
      </>
    )
  }
)

export const InputNumeric = React.forwardRef<HTMLInputElement, InputProps & NumericFormatProps>(
  ({ icon, iconPosition, base, className, ...props }, ref) => {
    return (
      <>
        {icon && (
          <span className={iconClassName({ position: iconPosition })}>
            <FontAwesomeIcon icon={icon} />
          </span>
        )}

        <NumericFormat
          {...props}
          getInputRef={ref}
          className={twMerge(
            inputClassName({
              base: base,
              iconPosition: iconPosition,
            }),
            className
          )}
        />
      </>
    )
  }
)

export const InputPattern = React.forwardRef<HTMLInputElement, InputProps & PatternFormatProps>(
  ({ icon, iconPosition, base, className, ...props }, ref) => {
    return (
      <>
        {icon && (
          <span className={iconClassName({ position: iconPosition })}>
            <FontAwesomeIcon icon={icon} />
          </span>
        )}

        <PatternFormat
          {...props}
          getInputRef={ref}
          className={twMerge(
            inputClassName({
              base: base,
              iconPosition: iconPosition,
            }),
            className
          )}
        />
      </>
    )
  }
)
