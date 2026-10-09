import { DataTypes, Model } from 'sequelize'

import sequelize from '../config/database.js'
import type { EstadoAutorizacionEstudio } from '../types/EstadoAutorizacionEstudio.js'

class AutorizacionEstudio extends Model {
    declare id: number
    declare estudioId: number
    declare profesionalId: number
    declare fechaAutorizacion: Date
    declare fechaVencimiento: Date
    declare estado: EstadoAutorizacionEstudio

    declare createdAt: Date
    declare updatedAt: Date

    // Métodos de instancia según el diagrama UML
    public autorizarProfesional(profesionalId: number): void {
        this.profesionalId = profesionalId
        this.estado = 'DISPONIBLE'
    }

    public revocarProfesional(): void {
        this.estado = 'VENCIDO'
    }

    public estaVigente(): boolean {
        const hoy = new Date()
        return (
            this.estado === 'DISPONIBLE' &&
            new Date(this.fechaVencimiento) >= hoy
        )
    }

    public estaVencida(): boolean {
        return !this.estaVigente()
    }
}

AutorizacionEstudio.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        estudioId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'estudios',
                key: 'id',
            },
        },

        profesionalId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'profesionales',
                key: 'id',
            },
        },

        fechaAutorizacion: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        fechaVencimiento: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        estado: {
            type: DataTypes.ENUM('DISPONIBLE', 'VENCIDO'),
            allowNull: false,
            defaultValue: 'DISPONIBLE',
        },
    },
    {
        sequelize,
        tableName: 'autorizaciones_estudio',
        timestamps: true,
    },
)

export default AutorizacionEstudio
