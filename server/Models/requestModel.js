import { sequelize } from "../config/db/config.js";
import { DataTypes } from "sequelize";

const Request = sequelize.define('solicitudes', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    estado: DataTypes.ENUM('pendiente', 'en revision', 'rechazada', 'aprobada', 'firmada', 'finalizada'),
    folio: DataTypes.INTEGER,
    respuestas: DataTypes.JSON,
    documentos: DataTypes.JSON
})

export default Request