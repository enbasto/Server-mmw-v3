require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { getConnection } = require("../../DB/connect-db");
const jwt = require("jsonwebtoken");
const { ValidarToken } = require("./validarToken");

const SelectMessages = async (req, res) => {
    try {
      // Validar el token
      const decoded = ValidarToken(req);
  
      // Ahora puedes usar el contenido decodificado del token
      console.log("Decoded Token:", decoded.id);
      const numbersExistsQuery = "SELECT * FROM messages WHERE uuid = ?";
      const connection = await getConnection();
  
      // Realizar la conexión a la base de datos
      connection.connect();
      const existingUser = await new Promise((resolve, reject) => {
        connection.query(
          numbersExistsQuery,
          [decoded.id],
          (error, results, fields) => {
            if (error) {
              reject(error);
            } else {
              resolve(results);
            }
          }
        );
      });
      connection.end();
  
      if (existingUser.length > 0) {
        // Responder con éxito si se encuentran números
        return res.status(200).json({
          Type: true,
          message: "Transacción realizada con éxito",
          Data: existingUser,
        });
      } else {
        // Responder si no se encuentran números
        return res
          .status(400)
          .json({ Type: false, message: "No se encontraron números" });
      }
    } catch (err) {
      // Manejar el error si el token no es válido o ha expirado
      console.error("Error verificando el token:", err);
      return res.status(401).json({
        Type: false,
        message: "No autorizado para realizar esta transacción",
      });
    }
  };

  module.exports ={
    SelectMessages,
  }