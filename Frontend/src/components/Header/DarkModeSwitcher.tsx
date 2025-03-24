import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSun } from '@fortawesome/free-regular-svg-icons'
import { faMoon } from '@fortawesome/free-solid-svg-icons'
import useColorMode from '../../hooks/useColorMode'

const DarkModeSwitcher = () => {
  const [colorMode, setColorMode] = useColorMode()

  const handleOnChange = () => {
    if (typeof setColorMode === 'function') setColorMode(colorMode === 'light' ? 'dark' : 'light')
  }

  return (
    <li>
      <label
        className={`relative m-0 block h-7.5 w-14 rounded-full ${
          colorMode === 'dark' ? 'bg-primary-50' : 'bg-stroke'
        }`}
      >
        <input
          type="checkbox"
          id="theme"
          onChange={handleOnChange}
          className="dur absolute top-0 z-50 m-0 h-full w-full cursor-pointer opacity-0"
        />
        <span
          className={`absolute top-1/2 left-[3px] flex h-6 w-6 -translate-y-1/2 translate-x-0 items-center justify-center rounded-full bg-white shadow-switcher duration-75 ease-linear ${
            colorMode === 'dark' && '!right-[3px] !translate-x-full'
          }`}
        >
          <span className="dark:hidden">
            <FontAwesomeIcon icon={faSun} />
          </span>
          <span className="hidden dark:inline-block">
            <FontAwesomeIcon icon={faMoon} className="text-slate-500" />
          </span>
        </span>
      </label>
    </li>
  )
}

export default DarkModeSwitcher
