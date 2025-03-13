import express from 'express'
import { refundSelect, refundCreate } from '@controllers/controllerRefund'

const router = express.Router()

router.get('/select/:key', refundSelect)
router.post('/create', refundCreate)

export default router
