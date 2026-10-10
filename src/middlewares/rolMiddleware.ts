import type { Request, Response, NextFunction } from 'express'

type Rol = 'PACIENTE' | 'PROFESIONAL' | 'ADMIN'

export function verificarRol(...rolesPermitidos: Rol[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.usuario) {
            return res.status(401).json({
                mensaje: 'Autenticación requerida',
            })
        }

        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({
                mensaje: 'No tenés permisos para realizar esta acción',
            })
        }

        return next()
    }
}
