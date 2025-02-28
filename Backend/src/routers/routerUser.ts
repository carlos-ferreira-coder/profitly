import express from 'express'
import { userSelect } from '@controllers/controllerUser'

const router = express.Router()

router.get('/select/:key', userSelect)

export default router
