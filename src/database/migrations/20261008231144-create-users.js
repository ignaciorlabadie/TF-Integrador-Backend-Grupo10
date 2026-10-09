'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('users', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            email: {
                type: Sequelize.STRING(254),
                allowNull: false,
                unique: true,
            },
            password: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            rol: {
                type: Sequelize.ENUM('PACIENTE', 'PROFESIONAL', 'ADMIN'),
                allowNull: false,
            },
            activo: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
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
        await queryInterface.dropTable('users')
        await queryInterface.sequelize.query(
            'DROP TYPE IF EXISTS "enum_users_rol";',
        )
    },
}
