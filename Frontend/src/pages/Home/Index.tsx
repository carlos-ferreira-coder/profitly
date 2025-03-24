import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Home = () => {
  const navigate = useNavigate()
  const { auth } = useAuth()

  if (auth?.project) navigate('/project/select')
  else navigate('client/select')

  return <></>
}

export default Home
