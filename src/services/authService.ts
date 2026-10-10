import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import Usuario from '../models/Usuario.js'

export async function iniciarSesion(email: string, password: string) {
    const emailNormalizado = email.trim().toLowerCase()

    const usuario = await Usuario.findOne({
        where: { email: emailNormalizado },
    })

    if (!usuario) {
        throw new Error('Credenciales inválidas')
    }

    if (!usuario.activo) {
        throw new Error('Usuario desactivado')
    }

    const passwordValida = await bcrypt.compare(password, usuario.password)

    if (!passwordValida) {
        throw new Error('Credenciales inválidas')
    }

    const jwtSecret = process.env.JWT_SECRET

    if (!jwtSecret) {
        throw new Error('JWT_SECRET no está configurado')
    }

    const token = jwt.sign(
        {
            id: usuario.id,
            email: usuario.email,
            rol: usuario.rol,
        },
        jwtSecret,
        { expiresIn: '1d' },
    )

    return {
        token,
        usuario: {
            id: usuario.id,
            email: usuario.email,
            rol: usuario.rol,
            activo: usuario.activo,
        },
    }
}
