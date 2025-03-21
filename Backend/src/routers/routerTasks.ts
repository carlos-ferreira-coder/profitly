import express from 'express'
import { tasksSelect, tasksUpdate, doneCreate } from '@controllers/controllerTask'

const router = express.Router()

router.get('/select/:key', tasksSelect)
router.put('/update', tasksUpdate)
router.post('/done/create', doneCreate)

export default router
