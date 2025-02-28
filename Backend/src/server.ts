import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { PrismaClient } from '@prisma/client'

const PORT = process.env.PORT || 3000
const DOMAIN = process.env.RENDER_EXTERNAL_URL || 'http://localhost'
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
