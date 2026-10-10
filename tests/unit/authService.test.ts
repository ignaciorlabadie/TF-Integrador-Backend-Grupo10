import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../src/models/Usuario.js', () => ({
    default: {
        findOne: vi.fn(),
    },
}))

vi.mock('bcryptjs', () => ({
    default: {
        compare: vi.fn(),
    },
}))

vi.mock('jsonwebtoken', () => ({
    default: {
        sign: vi.fn(),
    },
}))

import Usuario from '../../src/models/Usuario.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import { iniciarSesion } from '../../src/services/authService.js'

beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('JWT_SECRET', 'secreto-de-prueba')
})

afterEach(() => {
    vi.unstubAllEnvs()
})

describe('authService', () => {
    it('debe iniciar sesión correctamente', async () => {
        const usuario = {
            id: 1,
            email: 'usuario@example.com',
            password: 'hash',
            rol: 'PACIENTE',
            activo: true,
        }

        vi.mocked(Usuario.findOne).mockResolvedValue(usuario as never)
        vi.mocked(bcrypt.compare).mockResolvedValue(true as never)
        vi.mocked(jwt.sign).mockReturnValue('token-de-prueba' as never)

        const resultado = await iniciarSesion('usuario@example.com', '123456')

        expect(resultado).toEqual({
            token: 'token-de-prueba',
            usuario: {
                id: 1,
                email: 'usuario@example.com',
                rol: 'PACIENTE',
                activo: true,
            },
        })

        expect(bcrypt.compare).toHaveBeenCalledWith('123456', 'hash')
        expect(jwt.sign).toHaveBeenCalled()
    })

    it('debe normalizar el email antes de buscarlo', async () => {
        vi.mocked(Usuario.findOne).mockResolvedValue(null)

        await expect(
            iniciarSesion(' Usuario@Example.com ', '123456'),
        ).rejects.toThrow('Credenciales inválidas')

        expect(Usuario.findOne).toHaveBeenCalledWith({
            where: { email: 'usuario@example.com' },
        })
    })

    it('debe rechazar un usuario inexistente', async () => {
        vi.mocked(Usuario.findOne).mockResolvedValue(null)

        await expect(
            iniciarSesion('usuario@example.com', '123456'),
        ).rejects.toThrow('Credenciales inválidas')

        expect(bcrypt.compare).not.toHaveBeenCalled()
    })

    it('debe rechazar una contraseña incorrecta', async () => {
        vi.mocked(Usuario.findOne).mockResolvedValue({
            id: 1,
            email: 'usuario@example.com',
            password: 'hash',
            rol: 'PACIENTE',
            activo: true,
        } as never)

        vi.mocked(bcrypt.compare).mockResolvedValue(false as never)

        await expect(
            iniciarSesion('usuario@example.com', 'incorrecta'),
        ).rejects.toThrow('Credenciales inválidas')

        expect(jwt.sign).not.toHaveBeenCalled()
    })

    it('debe rechazar un usuario desactivado', async () => {
        vi.mocked(Usuario.findOne).mockResolvedValue({
            id: 1,
            email: 'usuario@example.com',
            password: 'hash',
            rol: 'PACIENTE',
            activo: false,
        } as never)

        await expect(
            iniciarSesion('usuario@example.com', '123456'),
        ).rejects.toThrow('Usuario desactivado')

        expect(bcrypt.compare).not.toHaveBeenCalled()
        expect(jwt.sign).not.toHaveBeenCalled()
    })

    it('debe rechazar el inicio de sesión si falta JWT_SECRET', async () => {
        vi.stubEnv('JWT_SECRET', '')

        vi.mocked(Usuario.findOne).mockResolvedValue({
            id: 1,
            email: 'usuario@example.com',
            password: 'hash',
            rol: 'PACIENTE',
            activo: true,
        } as never)

        vi.mocked(bcrypt.compare).mockResolvedValue(true as never)

        await expect(
            iniciarSesion('usuario@example.com', '123456'),
        ).rejects.toThrow('JWT_SECRET no está configurado')

        expect(jwt.sign).not.toHaveBeenCalled()
    })
})
