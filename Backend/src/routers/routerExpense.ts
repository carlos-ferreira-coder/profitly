import express from 'express'
import { expenseSelect, expenseCreate } from '@controllers/controllerExpense'

const router = express.Router()

router.get('/select/:key', expenseSelect)
router.post('/create', expenseCreate)

export default router
