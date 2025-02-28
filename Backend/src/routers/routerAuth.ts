import express from 'express'
import { login, logout, authCheck } from '@controllers/controllerAuth'

const router = express.Router()

router.post('/login', login)
router.get('/logout', logout)
router.get('/check', authCheck)

export default router
