'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('pacientes', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            usuarioId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                unique: true,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
            },
            nombre: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            apellido: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            dni: {
                type: Sequelize.STRING(10),
                allowNull: false,
                unique: true,
            },
            telefono: {
                type: Sequelize.STRING(25),
                allowNull: false,
            },
            fechaNacimiento: {
                type: Sequelize.DATEONLY,
                allowNull: false,
            },
            direccion: {
                type: Sequelize.STRING(150),
                allowNull: false,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        })
    },

    async down(queryInterface) {
        await queryInterface.dropTable('pacientes')
    },
}
