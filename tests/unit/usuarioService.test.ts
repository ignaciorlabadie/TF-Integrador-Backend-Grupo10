import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../src/models/Usuario.js', () => ({
    default: {
        findAll: vi.fn(),
        findByPk: vi.fn(),
        findOne: vi.fn(),
        create: vi.fn(),
    },
}))

vi.mock('bcryptjs', () => ({
    default: {
        hash: vi.fn(),
    },
}))

import Usuario from '../../src/models/Usuario.js'
import bcrypt from 'bcryptjs'

import {
    listarUsuarios,
    buscarUsuarioPorId,
    buscarUsuarioPorEmail,
    crearUsuario,
    actualizarUsuario,
    desactivarUsuario,
} from '../../src/services/usuarioService.js'

beforeEach(() => {
    vi.clearAllMocks()
})

describe('usuarioService', () => {
    it('debe listar usuarios', async () => {
        vi.mocked(Usuario.findAll).mockResolvedValue([])

        const resultado = await listarUsuarios()

        expect(resultado).toEqual([])
        expect(Usuario.findAll).toHaveBeenCalledWith({
            attributes: { exclude: ['password'] },
        })
    })

    it('debe buscar un usuario por ID', async () => {
        vi.mocked(Usuario.findByPk).mockResolvedValue(null)

        const resultado = await buscarUsuarioPorId(1)

        expect(resultado).toBeNull()
    })

    it('debe buscar un usuario por email normalizado', async () => {
        vi.mocked(Usuario.findOne).mockResolvedValue(null)

        const resultado = await buscarUsuarioPorEmail(' Usuario@Example.com ')

        expect(resultado).toBeNull()
        expect(Usuario.findOne).toHaveBeenCalledWith({
            where: { email: 'usuario@example.com' },
            attributes: { exclude: ['password'] },
        })
    })

    it('debe crear un usuario sin devolver la contraseña', async () => {
        vi.mocked(Usuario.findOne).mockResolvedValue(null)
        vi.mocked(bcrypt.hash).mockResolvedValue('hash' as never)
        vi.mocked(Usuario.create).mockResolvedValue({
            id: 1,
            email: 'usuario@example.com',
            password: 'hash',
            rol: 'PACIENTE',
            activo: true,
        } as never)

        const resultado = await crearUsuario({
            email: 'usuario@example.com',
            password: '123456',
            rol: 'PACIENTE',
        })

        expect(resultado).toEqual({
            id: 1,
            email: 'usuario@example.com',
            rol: 'PACIENTE',
            activo: true,
        })

        expect(Usuario.create).toHaveBeenCalledWith({
            email: 'usuario@example.com',
            password: 'hash',
            rol: 'PACIENTE',
        })

        expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10)
    })

    it('debe rechazar un email ya registrado al crear', async () => {
        vi.mocked(Usuario.findOne).mockResolvedValue({
            id: 1,
            email: 'usuario@example.com',
        } as never)

        await expect(
            crearUsuario({
                email: 'usuario@example.com',
                password: '123456',
                rol: 'PACIENTE',
            }),
        ).rejects.toThrow('El email ya está registrado')

        expect(Usuario.create).not.toHaveBeenCalled()
    })

    it('debe normalizar el email al crear un usuario', async () => {
        vi.mocked(Usuario.findOne).mockResolvedValue(null)
        vi.mocked(bcrypt.hash).mockResolvedValue('hash' as never)
        vi.mocked(Usuario.create).mockResolvedValue({
            id: 1,
            email: 'usuario@example.com',
            rol: 'PACIENTE',
            activo: true,
        } as never)

        await crearUsuario({
            email: '  Usuario@Example.com  ',
            password: '123456',
            rol: 'PACIENTE',
        })

        expect(Usuario.findOne).toHaveBeenCalledWith({
            where: { email: 'usuario@example.com' },
        })
    })

    it('debe actualizar un usuario', async () => {
        const usuario = {
            id: 1,
            email: 'usuario@example.com',
            activo: true,
            save: vi.fn(),
        }

        vi.mocked(Usuario.findByPk)
            .mockResolvedValueOnce(usuario as never)
            .mockResolvedValueOnce(usuario as never)

        const resultado = await actualizarUsuario(1, {
            activo: false,
        })

        expect(usuario.activo).toBe(false)
        expect(usuario.save).toHaveBeenCalled()
        expect(resultado).toBeDefined()
    })

    it('debe rechazar la actualización si el usuario no existe', async () => {
        vi.mocked(Usuario.findByPk).mockResolvedValue(null)

        await expect(actualizarUsuario(999, { activo: false })).rejects.toThrow(
            'Usuario no encontrado',
        )
    })

    it('debe rechazar un email perteneciente a otro usuario', async () => {
        const usuario = {
            id: 1,
            email: 'actual@example.com',
            activo: true,
            save: vi.fn(),
        }

        vi.mocked(Usuario.findByPk).mockResolvedValueOnce(usuario as never)

        vi.mocked(Usuario.findOne).mockResolvedValue({
            id: 2,
            email: 'otro@example.com',
        } as never)

        await expect(
            actualizarUsuario(1, {
                email: 'otro@example.com',
            }),
        ).rejects.toThrow('El email ya está registrado')

        expect(usuario.save).not.toHaveBeenCalled()
    })

    it('debe desactivar un usuario', async () => {
        const usuario = {
            id: 1,
            activo: true,
            save: vi.fn(),
        }

        vi.mocked(Usuario.findByPk)
            .mockResolvedValueOnce(usuario as never)
            .mockResolvedValueOnce(usuario as never)

        const resultado = await desactivarUsuario(1)

        expect(usuario.activo).toBe(false)
        expect(usuario.save).toHaveBeenCalled()
        expect(resultado).toBeDefined()
    })

    it('debe rechazar la desactivación si el usuario no existe', async () => {
        vi.mocked(Usuario.findByPk).mockResolvedValue(null)

        await expect(desactivarUsuario(999)).rejects.toThrow(
            'Usuario no encontrado',
        )
    })

    it('debe rechazar la desactivación de un usuario ya desactivado', async () => {
        const usuario = {
            id: 1,
            activo: false,
            save: vi.fn(),
        }

        vi.mocked(Usuario.findByPk).mockResolvedValue(usuario as never)

        await expect(desactivarUsuario(1)).rejects.toThrow(
            'El usuario ya está desactivado',
        )

        expect(usuario.save).not.toHaveBeenCalled()
    })
})
