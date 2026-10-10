import { describe, it, expect, vi } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { verificarRol } from '../../src/middlewares/rolMiddleware.js'

function crearMocks(rol?: 'PACIENTE' | 'PROFESIONAL' | 'ADMIN') {
    const req = {
        usuario: rol
            ? {
                  id: 1,
                  email: 'usuario@test.com',
                  rol,
              }
            : undefined,
    } as Request

    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
    } as unknown as Response

    const next = vi.fn() as NextFunction

    return { req, res, next }
}

describe('verificarRol', () => {
    it('debe responder 401 si no hay usuario autenticado', () => {
        const { req, res, next } = crearMocks()
        const middleware = verificarRol('ADMIN')

        middleware(req, res, next)

        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({
            mensaje: 'Autenticación requerida',
        })
        expect(next).not.toHaveBeenCalled()
    })

    it('debe responder 403 si el rol no está permitido', () => {
        const { req, res, next } = crearMocks('PACIENTE')
        const middleware = verificarRol('ADMIN')

        middleware(req, res, next)

        expect(res.status).toHaveBeenCalledWith(403)
        expect(res.json).toHaveBeenCalledWith({
            mensaje: 'No tenés permisos para realizar esta acción',
        })
        expect(next).not.toHaveBeenCalled()
    })

    it('debe permitir el acceso si el rol está autorizado', () => {
        const { req, res, next } = crearMocks('ADMIN')
        const middleware = verificarRol('ADMIN')

        middleware(req, res, next)

        expect(next).toHaveBeenCalledOnce()
        expect(res.status).not.toHaveBeenCalled()
    })

    it('debe permitir cualquiera de los roles indicados', () => {
        const { req, res, next } = crearMocks('PROFESIONAL')
        const middleware = verificarRol('ADMIN', 'PROFESIONAL')

        middleware(req, res, next)

        expect(next).toHaveBeenCalledOnce()
        expect(res.status).not.toHaveBeenCalled()
    })
})
