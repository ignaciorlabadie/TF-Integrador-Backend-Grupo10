import { DataTypes, Model } from 'sequelize'

import type { EstadoTurno } from '../types/EstadoTurno.js'

import sequelize from '../config/database.js'

class Turno extends Model {
    declare id: number

    declare pacienteId: number
    declare profesionalId: number
    declare agendaId: number

    declare fecha: Date
    declare hora: Date

    declare estado: EstadoTurno
    declare motivo: string
    declare observaciones?: string

    declare createdAt: Date
    declare updatedAt: Date
}

Turno.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        pacienteId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        profesionalId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        agendaId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        fecha: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        hora: {
            type: DataTypes.TIME,
            allowNull: false,
        },

        estado: {
            type: DataTypes.ENUM(
                'pendiente',
                'confirmado',
                'cancelado',
                'completado',
            ),
            allowNull: false,
            defaultValue: 'pendiente',
        },

        motivo: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        observaciones: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'turnos',
        timestamps: true,
    },
)

export default Turno
