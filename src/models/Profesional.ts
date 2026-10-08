import { DataTypes, Model } from 'sequelize'

import sequelize from '../config/database.js'

class Profesional extends Model {
    declare id: number

    declare nombre: string
    declare apellido: string
    declare dni: string
    declare matricula: string
    declare email: string
    declare telefono?: string

    declare especialidadId: number
    declare activo: boolean

    declare createdAt: Date
    declare updatedAt: Date
}

Profesional.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        apellido: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        dni: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },

        matricula: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },

        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },

        telefono: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        especialidadId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        activo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: 'profesionales',
        timestamps: true,
    },
)

export default Profesional
