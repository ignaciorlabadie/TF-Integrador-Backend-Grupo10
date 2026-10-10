import type { Request, Response } from 'express'

import { iniciarSesion } from '../services/authService.js'

export async function login(req: Request, res: Response) {
    const { email, password } = req.body

    if (
        typeof email !== 'string' ||
        typeof password !== 'string' ||
        !email.trim() ||
        !password
    ) {
        return res.status(400).json({
            mensaje: 'Email y contraseña son obligatorios',
        })
    }

    try {
        const resultado = await iniciarSesion(email, password)

        return res.status(200).json(resultado)
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Credenciales inválidas') {
                return res.status(401).json({
                    mensaje: 'Email o contraseña incorrectos',
                })
            }

            if (error.message === 'Usuario desactivado') {
                return res.status(403).json({
                    mensaje: 'El usuario está desactivado',
                })
            }
        }

        return res.status(500).json({
            mensaje: 'Error interno del servidor',
        })
    }
}
