import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

interface PageTitleProps {
  title: string
}

const PageTitle = ({ title }: PageTitleProps) => {
  const location = useLocation()

  useEffect(() => {
    document.title = title
  }, [location, title])

  return null // This component doesn't render anything
}

export default PageTitle
