import express from 'express'
import {
  projectSelect,
  projectCreate,
  projectUpdate,
  projectDelete,
} from '@controllers/controllerProject'

const router = express.Router()

router.get('/select/:key', projectSelect)
router.post('/create', projectCreate)
router.put('/update', projectUpdate)
router.delete('/delete/:uuid', projectDelete)

export default router
