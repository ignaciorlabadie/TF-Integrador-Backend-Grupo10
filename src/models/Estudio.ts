import { DataTypes, Model } from 'sequelize'

import sequelize from '../config/database.js'

class Estudio extends Model {
    declare id: number
    declare pacienteId: number
    declare tipo: string
    declare fecha: Date
    declare descripcion: string
    declare archivoURL: string

    declare createdAt: Date
    declare updatedAt: Date

    // Métodos de instancia según el diagrama UML
    public adjuntarArchivo(url: string): void {
        this.archivoURL = url
    }

    public actualizarArchivo(nuevaUrl: string): void {
        this.archivoURL = nuevaUrl
    }
}

Estudio.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        pacienteId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'pacientes',
                key: 'id',
            },
        },

        tipo: {
            type: DataTypes.STRING,
            allowNull: false,
        },

        fecha: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        descripcion: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        archivoURL: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'estudios',
        timestamps: true,
    },
)

export default Estudio