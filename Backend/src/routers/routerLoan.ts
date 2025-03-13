import express from 'express'
import { loanSelect, loanCreate } from '@controllers/controllerLoan'

const router = express.Router()

router.get('/select/:key', loanSelect)
router.post('/create', loanCreate)

export default router
