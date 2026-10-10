import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Request, Response } from 'express'

vi.mock('../../src/services/authService.js', () => ({
    iniciarSesion: vi.fn(),
}))

import { iniciarSesion } from '../../src/services/authService.js'
import { login } from '../../src/controllers/authController.js'

function crearMocks(body: object) {
    const req = {
        body,
    } as Request

    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
    } as unknown as Response

    return { req, res }
}

beforeEach(() => {
    vi.clearAllMocks()
})

describe('authController', () => {
    it('debe iniciar sesión correctamente', async () => {
        vi.mocked(iniciarSesion).mockResolvedValue({
            token: 'token-de-prueba',
            usuario: {
                id: 1,
                email: 'usuario@example.com',
                rol: 'PACIENTE',
                activo: true,
            },
        } as never)

        const { req, res } = crearMocks({
            email: 'usuario@example.com',
            password: '123456',
        })

        await login(req, res)

        expect(iniciarSesion).toHaveBeenCalledWith(
            'usuario@example.com',
            '123456',
        )

        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith({
            token: 'token-de-prueba',
            usuario: {
                id: 1,
                email: 'usuario@example.com',
                rol: 'PACIENTE',
                activo: true,
            },
        })
    })

    it('debe rechazar datos faltantes', async () => {
        const { req, res } = crearMocks({
            email: 'usuario@example.com',
        })

        await login(req, res)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({
            mensaje: 'Email y contraseña son obligatorios',
        })
        expect(iniciarSesion).not.toHaveBeenCalled()
    })

    it('debe rechazar un email vacío', async () => {
        const { req, res } = crearMocks({
            email: '   ',
            password: '123456',
        })

        await login(req, res)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(iniciarSesion).not.toHaveBeenCalled()
    })

    it('debe rechazar campos que no sean cadenas', async () => {
        const { req, res } = crearMocks({
            email: 123,
            password: '123456',
        })

        await login(req, res)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(iniciarSesion).not.toHaveBeenCalled()
    })

    it('debe devolver 401 si las credenciales son incorrectas', async () => {
        vi.mocked(iniciarSesion).mockRejectedValue(
            new Error('Credenciales inválidas'),
        )

        const { req, res } = crearMocks({
            email: 'usuario@example.com',
            password: 'incorrecta',
        })

        await login(req, res)

        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({
            mensaje: 'Email o contraseña incorrectos',
        })
    })

    it('debe devolver 403 si el usuario está desactivado', async () => {
        vi.mocked(iniciarSesion).mockRejectedValue(
            new Error('Usuario desactivado'),
        )

        const { req, res } = crearMocks({
            email: 'usuario@example.com',
            password: '123456',
        })

        await login(req, res)

        expect(res.status).toHaveBeenCalledWith(403)
        expect(res.json).toHaveBeenCalledWith({
            mensaje: 'El usuario está desactivado',
        })
    })

    it('debe devolver 500 ante un error inesperado', async () => {
        vi.mocked(iniciarSesion).mockRejectedValue(
            new Error('Error de conexión con la base de datos'),
        )

        const { req, res } = crearMocks({
            email: 'usuario@example.com',
            password: '123456',
        })

        await login(req, res)

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({
            mensaje: 'Error interno del servidor',
        })
    })
})
