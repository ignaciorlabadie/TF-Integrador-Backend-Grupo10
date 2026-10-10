import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { verificarToken } from '../../src/middlewares/authMiddleware.js'

const JWT_SECRET = 'secreto-de-prueba'

function crearMocks(authorization?: string) {
    const req = {
        headers: {
            authorization,
        },
    } as Request

    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
    } as unknown as Response

    const next = vi.fn() as NextFunction

    return { req, res, next }
}

describe('verificarToken', () => {
    beforeEach(() => {
        vi.stubEnv('JWT_SECRET', JWT_SECRET)
    })

    afterEach(() => {
        vi.unstubAllEnvs()
    })

    it('debe responder 401 si falta el token', () => {
        const { req, res, next } = crearMocks()

        verificarToken(req, res, next)

        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({
            mensaje: 'Token de autenticación requerido',
        })
        expect(next).not.toHaveBeenCalled()
    })

    it('debe responder 401 si el token es inválido', () => {
        const { req, res, next } = crearMocks('Bearer token-invalido')

        verificarToken(req, res, next)

        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({
            mensaje: 'Token inválido o expirado',
        })
        expect(next).not.toHaveBeenCalled()
    })

    it('debe responder 401 si el token expiró', () => {
        const token = jwt.sign(
            { id: 1, email: 'paciente@test.com', rol: 'PACIENTE' },
            JWT_SECRET,
            { expiresIn: -1 },
        )

        const { req, res, next } = crearMocks(`Bearer ${token}`)

        verificarToken(req, res, next)

        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({
            mensaje: 'Token inválido o expirado',
        })
        expect(next).not.toHaveBeenCalled()
    })

    it('debe responder 500 si falta JWT_SECRET', () => {
        vi.stubEnv('JWT_SECRET', '')

        const { req, res, next } = crearMocks('Bearer cualquier-token')

        verificarToken(req, res, next)

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({
            mensaje: 'Error interno del servidor',
        })
        expect(next).not.toHaveBeenCalled()
    })

    it('debe responder 401 si el token tiene datos inválidos', () => {
        const token = jwt.sign(
            {
                id: 'no-es-un-numero',
                email: 'paciente@test.com',
                rol: 'PACIENTE',
            },
            JWT_SECRET,
        )

        const { req, res, next } = crearMocks(`Bearer ${token}`)

        verificarToken(req, res, next)

        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({
            mensaje: 'Token de autenticación inválido',
        })
        expect(next).not.toHaveBeenCalled()
    })

    it('debe validar el token y agregar el usuario a la request', () => {
        const token = jwt.sign(
            { id: 1, email: 'paciente@test.com', rol: 'PACIENTE' },
            JWT_SECRET,
        )

        const { req, res, next } = crearMocks(`Bearer ${token}`)

        verificarToken(req, res, next)

        expect(req.usuario).toEqual({
            id: 1,
            email: 'paciente@test.com',
            rol: 'PACIENTE',
        })
        expect(next).toHaveBeenCalledOnce()
        expect(res.status).not.toHaveBeenCalled()
    })
})
