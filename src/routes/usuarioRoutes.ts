import { Router } from 'express'

import {
    obtenerUsuarios,
    obtenerUsuarioPorId,
    obtenerUsuarioPorEmail,
    registrarUsuario,
    modificarUsuario,
    desactivarUsuarioController,
} from '../controllers/usuarioController.js'

import { verificarToken } from '../middlewares/authMiddleware.js'
import { verificarRol } from '../middlewares/rolMiddleware.js'

const router = Router()

router.post('/', registrarUsuario)

router.get('/', verificarToken, verificarRol('ADMIN'), obtenerUsuarios)

router.get(
    '/email/:email',
    verificarToken,
    verificarRol('ADMIN'),
    obtenerUsuarioPorEmail,
)

router.get('/:id', verificarToken, obtenerUsuarioPorId)

router.put('/:id', verificarToken, verificarRol('ADMIN'), modificarUsuario)

router.patch(
    '/:id/desactivar',
    verificarToken,
    verificarRol('ADMIN'),
    desactivarUsuarioController,
)

export default router
