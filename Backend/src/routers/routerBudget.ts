import express from 'express'
import { budgetSelect, budgetTasksUpdate } from '@controllers/controllerBudget'

const router = express.Router()

router.get('/select/:key', budgetSelect)
router.put('/task/update', budgetTasksUpdate)

export default router
