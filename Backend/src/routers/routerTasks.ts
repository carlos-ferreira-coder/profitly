import express from 'express'
import {
  tasksExpenseSelect,
  tasksExpenseUpdate,
  tasksActivitySelect,
  tasksActivityUpdate,
} from '@controllers/controllerTask'

const router = express.Router()

router.get('/expense/select/:key', tasksExpenseSelect)
router.put('/expense/update', tasksExpenseUpdate)

router.get('/activity/select/:key', tasksActivitySelect)
router.put('/activity/update', tasksActivityUpdate)

export default router
