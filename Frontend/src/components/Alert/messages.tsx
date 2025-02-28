import { tv } from 'tailwind-variants'
import { AlertType } from './Index'

// tailwind variant for li
const liClassName = tv({
  base: 'leading-relaxed',
  variants: {
    color: {
      danger: 'text-red-400',
      warning: 'text-orange-400',
      success: 'text-gree-400',
    },
  },
})

const Messages = (type: AlertType, data: (string | JSX.Element)[]) => {
  return (
    <ul>
      {data.map((msg, idx) => (
        <li key={idx} className={liClassName({ color: type })}>
          {msg}
        </li>
      ))}
    </ul>
  )
}

export default Messages
