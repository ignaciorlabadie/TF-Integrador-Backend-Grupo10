import { Router } from 'express'

import authRoutes from './authRoutes.js'
import usuarioRoutes from './usuarioRoutes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/usuarios', usuarioRoutes)

export default router
