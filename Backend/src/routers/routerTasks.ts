import express from 'express'
import { tasksSelect, tasksUpdate } from '@controllers/controllerTask'

const router = express.Router()

router.get('/select/:key', tasksSelect)
router.put('/update', tasksUpdate)

export default router
