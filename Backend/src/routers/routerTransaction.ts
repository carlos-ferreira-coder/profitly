import express from 'express'
import { expenseSelect, expenseCreate } from '@controllers/controllerExpense'
import { incomeSelect, incomeCreate } from '@controllers/controllerIncome'
import { refundSelect, refundCreate } from '@controllers/controllerRefund'
import { loanSelect, loanCreate } from '@controllers/controllerLoan'

const router = express.Router()

router.get('/expense/select/:key', expenseSelect)
router.post('/expense/create', expenseCreate)

router.get('/income/select/:key', incomeSelect)
router.post('/income/create', incomeCreate)

router.get('/refund/select/:key', refundSelect)
router.post('/refund/create', refundCreate)

router.get('/loan/select/:key', loanSelect)
router.post('/loan/create', loanCreate)

export default router
