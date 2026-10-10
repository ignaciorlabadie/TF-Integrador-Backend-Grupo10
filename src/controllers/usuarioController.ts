import type { Request, Response } from 'express'

import {
    listarUsuarios,
    buscarUsuarioPorId,
    buscarUsuarioPorEmail,
    crearUsuario,
    actualizarUsuario,
    desactivarUsuario,
} from '../services/usuarioService.js'

export async function obtenerUsuarios(_req: Request, res: Response) {
    try {
        const usuarios = await listarUsuarios()

        return res.status(200).json(usuarios)
    } catch {
        return res.status(500).json({
            mensaje: 'Error interno del servidor',
        })
    }
}

export async function obtenerUsuarioPorId(req: Request, res: Response) {
    try {
        const id = Number(req.params.id)

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'El ID debe ser un número entero positivo',
            })
        }

        const usuario = await buscarUsuarioPorId(id)

        if (!usuario) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado',
            })
        }

        return res.status(200).json(usuario)
    } catch {
        return res.status(500).json({
            mensaje: 'Error interno del servidor',
        })
    }
}

export async function obtenerUsuarioPorEmail(req: Request, res: Response) {
    try {
        const email = req.params.email

        if (typeof email !== 'string' || !email.trim()) {
            return res.status(400).json({
                mensaje: 'El email es obligatorio',
            })
        }

        const usuario = await buscarUsuarioPorEmail(email)

        if (!usuario) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado',
            })
        }

        return res.status(200).json(usuario)
    } catch {
        return res.status(500).json({
            mensaje: 'Error interno del servidor',
        })
    }
}

export async function registrarUsuario(req: Request, res: Response) {
    try {
        const { email, password, rol } = req.body

        if (
            typeof email !== 'string' ||
            typeof password !== 'string' ||
            !email.trim() ||
            !password ||
            !['PACIENTE', 'PROFESIONAL', 'ADMIN'].includes(rol)
        ) {
            return res.status(400).json({
                mensaje: 'Datos de usuario inválidos',
            })
        }

        if (rol !== 'PACIENTE') {
            return res.status(400).json({
                mensaje: 'El registro público solo permite crear pacientes',
            })
        }

        const usuario = await crearUsuario({ email, password, rol })

        return res.status(201).json(usuario)
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === 'El email ya está registrado'
        ) {
            return res.status(409).json({
                mensaje: error.message,
            })
        }

        return res.status(500).json({
            mensaje: 'Error interno del servidor',
        })
    }
}

export async function modificarUsuario(req: Request, res: Response) {
    try {
        const id = Number(req.params.id)

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'El ID debe ser un número entero positivo',
            })
        }

        const { email, activo } = req.body

        if (
            (email !== undefined &&
                (typeof email !== 'string' || !email.trim())) ||
            (activo !== undefined && typeof activo !== 'boolean') ||
            (email === undefined && activo === undefined)
        ) {
            return res.status(400).json({
                mensaje: 'Datos de actualización inválidos',
            })
        }

        const usuario = await actualizarUsuario(id, { email, activo })

        return res.status(200).json(usuario)
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Usuario no encontrado') {
                return res.status(404).json({
                    mensaje: error.message,
                })
            }

            if (error.message === 'El email ya está registrado') {
                return res.status(409).json({
                    mensaje: error.message,
                })
            }
        }

        return res.status(500).json({
            mensaje: 'Error interno del servidor',
        })
    }
}

export async function desactivarUsuarioController(req: Request, res: Response) {
    try {
        const id = Number(req.params.id)

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'El ID debe ser un número entero positivo',
            })
        }

        const usuario = await desactivarUsuario(id)

        return res.status(200).json(usuario)
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Usuario no encontrado') {
                return res.status(404).json({
                    mensaje: error.message,
                })
            }

            if (error.message === 'El usuario ya está desactivado') {
                return res.status(409).json({
                    mensaje: error.message,
                })
            }
        }

        return res.status(500).json({
            mensaje: 'Error interno del servidor',
        })
    }
}
