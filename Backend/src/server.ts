import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { PrismaClient } from '@prisma/client'
import { auth } from '@middlewares/auth'
import routerAuth from '@routers/routerAuth'
import routerUser from '@routers/routerUser'
import routerStatus from '@routers/routerStatus'
import routerClient from '@routers/routerClient'
import routerProject from '@routers/routerProject'
import routerBudget from '@routers/routerBudget'
import routerTasks from '@routers/routerTasks'
import routerSupplier from '@routers/routerSupplier'
import routerTransaction from '@routers/routerTransaction'

const PORT = process.env.PORT || 3000
const DOMAIN = process.env.RENDER_EXTERNAL_URL || ''
const JWT_SECRET = process.env.JWT_SECRET || ''

const corsOptions = {
  origin: process.env.CORS_ORIGIN || '',
  methods: process.env.CORS_METHODS?.split(',') || '',
  credentials: process.env.CORS_CREDENTIALS === 'true' || true,
}

const app = express()
export const prisma = new PrismaClient()

app.use(express.json())
app.use(cors(corsOptions))
app.use(cookieParser(JWT_SECRET))

app.use('/auth', routerAuth)
app.use('/user', auth, routerUser)
app.use('/status', auth, routerStatus)
app.use('/client', auth, routerClient)
app.use('/project', auth, routerProject)
app.use('/budget', auth, routerBudget)
app.use('/tasks', auth, routerTasks)
app.use('/supplier', auth, routerSupplier)
app.use('/transaction', auth, routerTransaction)

app.use('/img/user', auth, express.static('src/images/users'))

const start = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server is running on ${DOMAIN}:${PORT}`)
    })
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

start()
