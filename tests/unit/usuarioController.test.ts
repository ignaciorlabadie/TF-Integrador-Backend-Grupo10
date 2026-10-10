import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Request, Response } from 'express'

vi.mock('../../src/services/usuarioService.js', () => ({
    listarUsuarios: vi.fn(),
    buscarUsuarioPorId: vi.fn(),
    buscarUsuarioPorEmail: vi.fn(),
    crearUsuario: vi.fn(),
    actualizarUsuario: vi.fn(),
    desactivarUsuario: vi.fn(),
}))

import {
    listarUsuarios,
    buscarUsuarioPorId,
    buscarUsuarioPorEmail,
    crearUsuario,
    actualizarUsuario,
    desactivarUsuario,
} from '../../src/services/usuarioService.js'

import {
    obtenerUsuarios,
    obtenerUsuarioPorId,
    obtenerUsuarioPorEmail,
    registrarUsuario,
    modificarUsuario,
    desactivarUsuarioController,
} from '../../src/controllers/usuarioController.js'

function crearMocks(body: object = {}, params: Record<string, string> = {}) {
    const req = {
        body,
        params,
    } as unknown as Request

    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
    } as unknown as Response

    return { req, res }
}

beforeEach(() => {
    vi.clearAllMocks()
})

describe('usuarioController', () => {
    it('debe listar usuarios', async () => {
        vi.mocked(listarUsuarios).mockResolvedValue([])

        const { req, res } = crearMocks()

        await obtenerUsuarios(req, res)

        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith([])
    })

    it('debe devolver 500 si falla el listado', async () => {
        vi.mocked(listarUsuarios).mockRejectedValue(new Error('Error de DB'))

        const { req, res } = crearMocks()

        await obtenerUsuarios(req, res)

        expect(res.status).toHaveBeenCalledWith(500)
    })

    it('debe buscar un usuario por ID', async () => {
        const usuario = {
            id: 1,
            email: 'usuario@example.com',
            rol: 'PACIENTE',
            activo: true,
        }

        vi.mocked(buscarUsuarioPorId).mockResolvedValue(usuario as never)

        const { req, res } = crearMocks({}, { id: '1' })

        await obtenerUsuarioPorId(req, res)

        expect(buscarUsuarioPorId).toHaveBeenCalledWith(1)
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith(usuario)
    })

    it('debe rechazar un ID inválido', async () => {
        const { req, res } = crearMocks({}, { id: 'abc' })

        await obtenerUsuarioPorId(req, res)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(buscarUsuarioPorId).not.toHaveBeenCalled()
    })

    it('debe devolver 404 si el usuario no existe', async () => {
        vi.mocked(buscarUsuarioPorId).mockResolvedValue(null)

        const { req, res } = crearMocks({}, { id: '999' })

        await obtenerUsuarioPorId(req, res)

        expect(res.status).toHaveBeenCalledWith(404)
    })

    it('debe buscar un usuario por email', async () => {
        const usuario = {
            id: 1,
            email: 'usuario@example.com',
            rol: 'PACIENTE',
            activo: true,
        }

        vi.mocked(buscarUsuarioPorEmail).mockResolvedValue(usuario as never)

        const { req, res } = crearMocks(
            {},
            {
                email: 'usuario@example.com',
            },
        )

        await obtenerUsuarioPorEmail(req, res)

        expect(buscarUsuarioPorEmail).toHaveBeenCalledWith(
            'usuario@example.com',
        )
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith(usuario)
    })

    it('debe devolver 404 si no encuentra el email', async () => {
        vi.mocked(buscarUsuarioPorEmail).mockResolvedValue(null)

        const { req, res } = crearMocks(
            {},
            {
                email: 'inexistente@example.com',
            },
        )

        await obtenerUsuarioPorEmail(req, res)

        expect(res.status).toHaveBeenCalledWith(404)
    })

    it('debe registrar un usuario', async () => {
        const usuario = {
            id: 1,
            email: 'usuario@example.com',
            rol: 'PACIENTE',
            activo: true,
        }

        vi.mocked(crearUsuario).mockResolvedValue(usuario as never)

        const { req, res } = crearMocks({
            email: 'usuario@example.com',
            password: '123456',
            rol: 'PACIENTE',
        })

        await registrarUsuario(req, res)

        expect(crearUsuario).toHaveBeenCalledWith({
            email: 'usuario@example.com',
            password: '123456',
            rol: 'PACIENTE',
        })
        expect(res.status).toHaveBeenCalledWith(201)
        expect(res.json).toHaveBeenCalledWith(usuario)
    })

    it('debe registrar un usuario con rol PACIENTE', async () => {
        const usuarioCreado = {
            id: 1,
            email: 'paciente@test.com',
            rol: 'PACIENTE',
            activo: true,
        }

        vi.mocked(crearUsuario).mockResolvedValue(usuarioCreado as never)

        const { req, res } = crearMocks({
            email: 'paciente@test.com',
            password: 'Password123!',
            rol: 'PACIENTE',
        })

        await registrarUsuario(req, res)

        expect(crearUsuario).toHaveBeenCalledOnce()
        expect(res.status).toHaveBeenCalledWith(201)
    })

    it.each(['ADMIN', 'PROFESIONAL'])(
        'debe rechazar el registro público con rol %s',
        async (rol) => {
            const { req, res } = crearMocks({
                email: 'usuario@test.com',
                password: 'Password123!',
                rol,
            })

            await registrarUsuario(req, res)

            expect(res.status).toHaveBeenCalledWith(400)
            expect(crearUsuario).not.toHaveBeenCalled()
        },
    )

    it('debe rechazar datos inválidos al registrar', async () => {
        const { req, res } = crearMocks({
            email: '',
            password: '123456',
            rol: 'PACIENTE',
        })

        await registrarUsuario(req, res)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(crearUsuario).not.toHaveBeenCalled()
    })

    it('debe devolver 409 si el email ya está registrado', async () => {
        vi.mocked(crearUsuario).mockRejectedValue(
            new Error('El email ya está registrado'),
        )

        const { req, res } = crearMocks({
            email: 'usuario@example.com',
            password: '123456',
            rol: 'PACIENTE',
        })

        await registrarUsuario(req, res)

        expect(res.status).toHaveBeenCalledWith(409)
    })

    it('debe actualizar un usuario', async () => {
        const usuario = {
            id: 1,
            email: 'usuario@example.com',
            activo: false,
        }

        vi.mocked(actualizarUsuario).mockResolvedValue(usuario as never)

        const { req, res } = crearMocks({ activo: false }, { id: '1' })

        await modificarUsuario(req, res)

        expect(actualizarUsuario).toHaveBeenCalledWith(1, {
            email: undefined,
            activo: false,
        })
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith(usuario)
    })

    it('debe rechazar una actualización sin datos', async () => {
        const { req, res } = crearMocks({}, { id: '1' })

        await modificarUsuario(req, res)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(actualizarUsuario).not.toHaveBeenCalled()
    })

    it('debe devolver 404 al actualizar un usuario inexistente', async () => {
        vi.mocked(actualizarUsuario).mockRejectedValue(
            new Error('Usuario no encontrado'),
        )

        const { req, res } = crearMocks({ activo: false }, { id: '999' })

        await modificarUsuario(req, res)

        expect(res.status).toHaveBeenCalledWith(404)
    })

    it('debe desactivar un usuario', async () => {
        const usuario = {
            id: 1,
            email: 'usuario@example.com',
            activo: false,
        }

        vi.mocked(desactivarUsuario).mockResolvedValue(usuario as never)

        const { req, res } = crearMocks({}, { id: '1' })

        await desactivarUsuarioController(req, res)

        expect(desactivarUsuario).toHaveBeenCalledWith(1)
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith(usuario)
    })

    it('debe devolver 404 al desactivar un usuario inexistente', async () => {
        vi.mocked(desactivarUsuario).mockRejectedValue(
            new Error('Usuario no encontrado'),
        )

        const { req, res } = crearMocks({}, { id: '999' })

        await desactivarUsuarioController(req, res)

        expect(res.status).toHaveBeenCalledWith(404)
    })

    it('debe devolver 409 si el usuario ya está desactivado', async () => {
        vi.mocked(desactivarUsuario).mockRejectedValue(
            new Error('El usuario ya está desactivado'),
        )

        const { req, res } = crearMocks({}, { id: '1' })

        await desactivarUsuarioController(req, res)

        expect(res.status).toHaveBeenCalledWith(409)
    })
})
