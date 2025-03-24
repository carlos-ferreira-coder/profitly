import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect, useState } from 'react'

interface CheckboxProps {
  name: string
  label: string
  value: boolean
  disabled?: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>((props, ref) => {
  const [isChecked, setIsChecked] = useState<boolean>(props.value)

  // Initiate value
  useEffect(() => {
    setIsChecked(props.value)
  }, [props.value])

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(!isChecked)
    props.onChange(e)
  }

  return (
    <div>
      <label htmlFor={props.name} className="flex cursor-pointer select-none items-center">
        <div className="relative">
          <input
            type="checkbox"
            ref={ref}
            id={props.name}
            name={props.name}
            checked={props.value}
            className="sr-only"
            disabled={props.disabled ? props.disabled : false}
            onChange={handleOnChange}
          />
          <div
            className={`mr-4 flex h-5 w-5 items-center justify-center text-primary-50 rounded border dark:bg-form-input ${
              isChecked
                ? 'border-primary-50 dark:border-primary-50'
                : 'border-stroke dark:border-form-strokedark'
            }`}
          >
            <span className={`opacity-0 ${isChecked && '!opacity-100'}`}>
              <FontAwesomeIcon icon={faCheck} />
            </span>
          </div>
        </div>
        {props.label}
      </label>
    </div>
  )
})
