import express from 'express'
import {
  budgetSelect,
  budgetTasksExpenseUpdate,
  budgetTasksActivityUpdate,
} from '@controllers/controllerBudget'

const router = express.Router()

router.get('/select/:key', budgetSelect)
router.put('/task/expense/update', budgetTasksExpenseUpdate)
router.put('/task/activity/update', budgetTasksActivityUpdate)

export default router
