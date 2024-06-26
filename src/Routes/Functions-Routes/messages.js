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

    const messageExistsQuery = "SELECT * FROM messages WHERE uuid = ?";
    const connection = await getConnection();

    // Realizar la conexión a la base de datos
    connection.connect();
    const existingMessages = await new Promise((resolve, reject) => {
      connection.query(
        messageExistsQuery,
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

    if (existingMessages.length > 0) {
      // Responder con éxito si se encuentran números
      return res.status(200).json({
        Type: true,
        message: "Transacción realizada con éxito",
        Data: existingMessages,
      });
    } else {
      // Responder si no se encuentran números
      return res
        .status(400)
        .json({
          Type: false,
          message: "No se encontraron Mensajes Registrados",
        });
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

const SelectMessage = async (req, res) => {
  try {
    // Validar el token
    const decoded = ValidarToken(req);
    const { Abreviacion } = req.body;
    
    // Ahora puedes usar el contenido decodificado del 
    const messageExistsQuery = "SELECT * FROM messages WHERE id = ? and uuid = ?";
    const connection = await getConnection();

    // Realizar la conexión a la base de datos
    connection.connect();
    const existingMessage = await new Promise((resolve, reject) => {
      connection.query(
        messageExistsQuery,
        [Abreviacion,decoded.id],
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

    if (existingMessage.length > 0) {
      // Responder con éxito si se encuentran números
      return res.status(200).json({
        Type: true,
        message: "Transacción realizada con éxito",
        Data: existingMessage[0],
      });
    } else {
      // Responder si no se encuentran números
      return res
        .status(400)
        .json({
          Type: false,
          message: "No se encontraron Mensajes Registrados",
        });
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

const SaveMessages = async (req, res) => {
  try {
    // Validar el token
    const decoded = ValidarToken(req);

    const {
      abbreviationMessage,
      textMessage,
      media,
      rutaDestino,
      tiempoInterval,
    } = req.body;

    
    const numbersExistsQuery =
      "INSERT INTO messages (abreviacion, message, media, urlmedia, intervaloMessage, uuid) VALUES (?, ?, ?, ?, ?, ?)";
    const connection = await getConnection();

    // Realizar la conexión a la base de datos
    connection.connect();
    const results = await new Promise((resolve, reject) => {
      connection.query(
        numbersExistsQuery,
        [
          abbreviationMessage,
          textMessage,
          media,
          rutaDestino,
          tiempoInterval,
          decoded.id,
        ],
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

    if (results.affectedRows > 0) {
      // Responder con éxito si se encuentran números
      return res.status(200).json({
        Type: true,
        message: "Registro Creado Con Exito",
        Data: results,
      });
    } else {
      // Responder si no se encuentran números
      return res
        .status(400)
        .json({ Type: false, message: "No se pudo Registrar el mensaje" });
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


const DeleteMessages = async (req, res) => {
  try {
    // Validar el token
    const decoded = ValidarToken(req);

    // Ahora puedes usar el contenido decodificado del token
    const { id } = req.body;

//       // Consulta SQL para obtener el usuario correspondiente a la contraseña proporcionada
    const queryString = "DELETE FROM messages WHERE id = ? and uuid = ?";
    const connection = await getConnection();

    // Realizar la conexión a la base de datos
    connection.connect();
    const results = await new Promise((resolve, reject) => {
      connection.query(
          queryString,
        [id, decoded.id],
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

    if (results.affectedRows > 0) {
      // Responder con éxito si se encuentran números
      return res.status(200).json({
        Type: true,
        message: "Registro Eliminado Con Exito",
        Data: results,
      });
    } else {
      // Responder si no se encuentran números
      return res
        .status(400)
        .json({ Type: false, message: "No hay Numeros Registados para eliminar." });
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

module.exports = {
  SelectMessages,
  SelectMessage,
  SaveMessages,
  DeleteMessages
};
