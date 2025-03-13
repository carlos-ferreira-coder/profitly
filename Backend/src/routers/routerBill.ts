import express from 'express'
import { billSelect, billCreate } from '@controllers/controllerBill'

const router = express.Router()

router.get('/select/:key', billSelect)
router.post('/create', billCreate)

export default router
