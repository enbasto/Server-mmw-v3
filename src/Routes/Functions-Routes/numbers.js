require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { getConnection } = require("../../DB/connect-db");
const jwt = require("jsonwebtoken");
const { ValidarToken } = require("./validarToken");
const SelectNumbers = async (req, res) => {
  try {
    // Validar el token
    const decoded = ValidarToken(req);

    // Ahora puedes usar el contenido decodificado del token
    console.log("Decoded Token:", decoded.id);
    const numbersExistsQuery = "SELECT * FROM numbers WHERE uuid = ?";
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

const SaveNumber = async (req, res) => {
  try {
    // Validar el token
    const decoded = ValidarToken(req);

    // Ahora puedes usar el contenido decodificado del token
    //   console.log("Decoded Token:", decoded.id);
    const { name, numero_cel } = req.body;
    const numbersExistsQuery =
      "INSERT INTO numbers (nombre,  numero_cel, uuid) VALUES (?,  ?, ?)";
    const connection = await getConnection();

    // Realizar la conexión a la base de datos
    connection.connect();
    const results = await new Promise((resolve, reject) => {
      connection.query(
        numbersExistsQuery,
        [name, numero_cel, decoded.id],
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

const DeleteNumber = async (req, res) => {
    try {
      // Validar el token
      const decoded = ValidarToken(req);
  
      // Ahora puedes usar el contenido decodificado del token
      //   console.log("Decoded Token:", decoded.id);
      const { id } = req.body;

//       // Consulta SQL para obtener el usuario correspondiente a la contraseña proporcionada
      const queryString = "DELETE FROM numbers WHERE id = ? and uuid = ?";
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

const SaveNumberPlantilla = async (req, res) => {
  try {
    // Validar el token
    const decoded = ValidarToken(req);

    // Ahora puedes usar el contenido decodificado del token
    //   console.log("Decoded Token:", decoded.id);
    const { name, numero_cel } = req.body;
    const numbersExistsQuery =
      "INSERT INTO numbers (nombre,  numero_cel, uuid) VALUES (?,  ?, ?)";
    const connection = await getConnection();

    // Realizar la conexión a la base de datos
    connection.connect();
    const results = await new Promise((resolve, reject) => {
      connection.query(
        numbersExistsQuery,
        [name, numero_cel, decoded.id],
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

module.exports = {
    SelectNumbers,
  SaveNumber,
  DeleteNumber,
  SaveNumberPlantilla,
};
