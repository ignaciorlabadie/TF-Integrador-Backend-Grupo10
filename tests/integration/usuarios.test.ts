import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'

vi.mock('../../src/models/Usuario.js', () => ({
    default: {
        findAll: vi.fn(),
        findByPk: vi.fn(),
        findOne: vi.fn(),
        create: vi.fn(),
    },
}))

import Usuario from '../../src/models/Usuario.js'
import app from '../../src/app.js'

const JWT_SECRET = 'secreto-de-prueba'

function tokenPara(id: number, rol: 'PACIENTE' | 'PROFESIONAL' | 'ADMIN') {
    return jwt.sign(
        { id, email: `${rol.toLowerCase()}@test.com`, rol },
        JWT_SECRET,
    )
}

beforeEach(() => {
    vi.resetAllMocks()
    vi.stubEnv('JWT_SECRET', JWT_SECRET)
})

afterEach(() => {
    vi.unstubAllEnvs()
})

describe('POST /usuarios', () => {
    it('debe registrar un paciente', async () => {
        vi.mocked(Usuario.findOne).mockResolvedValue(null)
        vi.mocked(Usuario.create).mockResolvedValue({
            id: 1,
            email: 'paciente@test.com',
            rol: 'PACIENTE',
            activo: true,
        } as never)

        const respuesta = await request(app).post('/usuarios').send({
            email: 'paciente@test.com',
            password: '12345678',
            rol: 'PACIENTE',
        })

        expect(respuesta.status).toBe(201)
        expect(respuesta.body).toEqual({
            id: 1,
            email: 'paciente@test.com',
            rol: 'PACIENTE',
            activo: true,
        })
    })

    it('debe rechazar un email inválido', async () => {
        const respuesta = await request(app).post('/usuarios').send({
            email: 'no-es-un-email',
            password: '12345678',
            rol: 'PACIENTE',
        })

        expect(respuesta.status).toBe(400)
        expect(Usuario.create).not.toHaveBeenCalled()
    })

    it('debe rechazar una contraseña corta', async () => {
        const respuesta = await request(app).post('/usuarios').send({
            email: 'paciente@test.com',
            password: 'corta',
            rol: 'PACIENTE',
        })

        expect(respuesta.status).toBe(400)
    })

    it('debe rechazar un email ya registrado', async () => {
        vi.mocked(Usuario.findOne).mockResolvedValue({
            id: 1,
            email: 'paciente@test.com',
        } as never)

        const respuesta = await request(app).post('/usuarios').send({
            email: 'paciente@test.com',
            password: '12345678',
            rol: 'PACIENTE',
        })

        expect(respuesta.status).toBe(409)
        expect(Usuario.create).not.toHaveBeenCalled()
    })

    it('debe rechazar el registro público con rol ADMIN', async () => {
        const respuesta = await request(app).post('/usuarios').send({
            email: 'admin@test.com',
            password: '12345678',
            rol: 'ADMIN',
        })

        expect(respuesta.status).toBe(400)
        expect(Usuario.create).not.toHaveBeenCalled()
    })
})

describe('GET /usuarios', () => {
    it('debe responder 401 sin token', async () => {
        const respuesta = await request(app).get('/usuarios')

        expect(respuesta.status).toBe(401)
    })

    it('debe responder 403 a un paciente', async () => {
        const respuesta = await request(app)
            .get('/usuarios')
            .set('Authorization', `Bearer ${tokenPara(1, 'PACIENTE')}`)

        expect(respuesta.status).toBe(403)
    })

    it('debe listar usuarios a un administrador', async () => {
        vi.mocked(Usuario.findAll).mockResolvedValue([])

        const respuesta = await request(app)
            .get('/usuarios')
            .set('Authorization', `Bearer ${tokenPara(99, 'ADMIN')}`)

        expect(respuesta.status).toBe(200)
        expect(respuesta.body).toEqual([])
    })
})

describe('GET /usuarios/:id', () => {
    it('debe permitir al propio usuario ver su perfil', async () => {
        vi.mocked(Usuario.findByPk).mockResolvedValue({
            id: 1,
            email: 'paciente@test.com',
            rol: 'PACIENTE',
            activo: true,
        } as never)

        const respuesta = await request(app)
            .get('/usuarios/1')
            .set('Authorization', `Bearer ${tokenPara(1, 'PACIENTE')}`)

        expect(respuesta.status).toBe(200)
        expect(respuesta.body.id).toBe(1)
    })

    it('debe impedir que un paciente vea a otro usuario', async () => {
        const respuesta = await request(app)
            .get('/usuarios/2')
            .set('Authorization', `Bearer ${tokenPara(1, 'PACIENTE')}`)

        expect(respuesta.status).toBe(403)
        expect(Usuario.findByPk).not.toHaveBeenCalled()
    })

    it('debe permitir a un administrador ver cualquier usuario', async () => {
        vi.mocked(Usuario.findByPk).mockResolvedValue({
            id: 2,
            email: 'otro@test.com',
            rol: 'PACIENTE',
            activo: true,
        } as never)

        const respuesta = await request(app)
            .get('/usuarios/2')
            .set('Authorization', `Bearer ${tokenPara(99, 'ADMIN')}`)

        expect(respuesta.status).toBe(200)
    })
})

describe('PUT /usuarios/:id', () => {
    it('debe permitir al propio usuario cambiar su contraseña', async () => {
        const usuario = {
            id: 1,
            email: 'paciente@test.com',
            password: 'hash-viejo',
            rol: 'PACIENTE',
            activo: true,
            save: vi.fn(),
        }

        vi.mocked(Usuario.findByPk).mockResolvedValue(usuario as never)

        const respuesta = await request(app)
            .put('/usuarios/1')
            .set('Authorization', `Bearer ${tokenPara(1, 'PACIENTE')}`)
            .send({ password: 'nueva-clave-123' })

        expect(respuesta.status).toBe(200)
        expect(usuario.save).toHaveBeenCalled()
    })

    it('debe impedir que un usuario no admin modifique el campo activo', async () => {
        const respuesta = await request(app)
            .put('/usuarios/1')
            .set('Authorization', `Bearer ${tokenPara(1, 'PACIENTE')}`)
            .send({ activo: false })

        expect(respuesta.status).toBe(403)
    })
})

describe('PATCH /usuarios/:id/desactivar', () => {
    it('debe desactivar un usuario como administrador', async () => {
        const usuario = {
            id: 1,
            email: 'paciente@test.com',
            activo: true,
            save: vi.fn(),
        }

        vi.mocked(Usuario.findByPk).mockResolvedValue(usuario as never)

        const respuesta = await request(app)
            .patch('/usuarios/1/desactivar')
            .set('Authorization', `Bearer ${tokenPara(99, 'ADMIN')}`)

        expect(respuesta.status).toBe(200)
        expect(usuario.save).toHaveBeenCalled()
    })
})

describe('PATCH /usuarios/:id/reactivar', () => {
    it('debe reactivar un usuario como administrador', async () => {
        const usuario = {
            id: 1,
            email: 'paciente@test.com',
            activo: false,
            save: vi.fn(),
        }

        vi.mocked(Usuario.findByPk).mockResolvedValue(usuario as never)

        const respuesta = await request(app)
            .patch('/usuarios/1/reactivar')
            .set('Authorization', `Bearer ${tokenPara(99, 'ADMIN')}`)

        expect(respuesta.status).toBe(200)
        expect(usuario.save).toHaveBeenCalled()
    })
})
