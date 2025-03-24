import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useEffect } from 'react'

const Home = () => {
  const navigate = useNavigate()
  const { auth } = useAuth()

  useEffect(() => {
    if (auth?.project) navigate('/project/select')
    else navigate('client/select')
  }, [auth, navigate])

  return <></>
}

export default Home
