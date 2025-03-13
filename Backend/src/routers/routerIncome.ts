import express from 'express'
import { incomeSelect, incomeCreate } from '@controllers/controllerIncome'

const router = express.Router()

router.get('/select/:key', incomeSelect)
router.post('/create', incomeCreate)

export default router
