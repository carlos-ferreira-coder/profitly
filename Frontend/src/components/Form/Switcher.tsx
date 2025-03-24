import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons'

// Type props
interface SwitcherProps {
  name: string
  value: boolean
  disabled?: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const Switcher = React.forwardRef<HTMLInputElement, SwitcherProps>((props, ref) => {
  const [enabled, setEnabled] = useState<boolean>(props.value)

  // Initiate value
  useEffect(() => {
    setEnabled(props.value)
  }, [props.value])

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (props.disabled !== true) setEnabled(!enabled)
    props.onChange(e)
  }

  return (
    <div>
      <label htmlFor={props.name} className="flex cursor-pointer select-none items-center">
        <div className="relative">
          <input
            type="checkbox"
            id={props.name}
            ref={ref}
            name={props.name}
            checked={props.value}
            className="sr-only"
            disabled={props.disabled ? props.disabled : false}
            onChange={handleOnChange}
          />
          <div
            className={`block h-8 w-14 rounded-full bg-transparent border border-stroke dark:border-form-strokedark ${
              enabled ? 'dark:bg-primary-50' : 'dark:bg-form-input'
            }`}
          ></div>
          <div
            className={`dot absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full text-white bg-form-strokedark dark:text-slate-500 transition ${
              enabled && '!right-1 !translate-x-full !bg-primary dark:!bg-white'
            }`}
          >
            <span className={`hidden ${enabled && '!block'}`}>
              <FontAwesomeIcon icon={faCheck} />
            </span>
            <span className={`${enabled && 'hidden'}`}>
              <FontAwesomeIcon icon={faXmark} className="dark:text-white" />
            </span>
          </div>
        </div>
      </label>
    </div>
  )
})

export default Switcher
