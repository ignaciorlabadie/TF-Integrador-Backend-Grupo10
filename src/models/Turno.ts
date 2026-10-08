import { DataTypes, Model } from 'sequelize'

import sequelize from '../config/database.js'

type EstadoTurno = 'pendiente' | 'confirmado' | 'cancelado' | 'completado'

class Turno extends Model {
    declare id: number

    declare profesionalId: number
    declare pacienteId: number

    declare fecha: Date
    declare hora: Date

    declare estado: EstadoTurno
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

        profesionalId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        pacienteId: {
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
