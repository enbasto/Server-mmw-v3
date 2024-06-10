require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { getConnection } = require("../../DB/connect-db");
const jwt = require("jsonwebtoken");
const { ValidarToken } = require("./validarToken");

const SelectReports = async (req, res) => {
  try {
    // Validar el token
    const decoded = ValidarToken(req);

    const Query = "SELECT * FROM reportmessage WHERE uuid = ?";
    const connection = await getConnection();

    // Realizar la conexión a la base de datos
    connection.connect();
    const existing = await new Promise((resolve, reject) => {
      connection.query(Query, [decoded.id], (error, results, fields) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
    connection.end();

    if (existing.length > 0) {
      // Responder con éxito si se encuentran números
      return res.status(200).json({
        Type: true,
        message: "Transacción realizada con éxito",
        Data: existing,
      });
    } else {
      // Responder si no se encuentran números
      return res.status(400).json({
        Type: false,
        message: "No se encontraron Reportes Registrados",
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

const SaveReport = async (req, res) => {
  try {
    // Validar el token
    const decoded = ValidarToken(req);

    const { phone, message, urlMedia, respestaEnvio } = req.body;

    

    const queryString =
      "INSERT INTO reportmessage ( numero_cel, message, urlMedia, estadoEnvio,uuid) VALUES (?, ?, ?, ?, ?)";
    const connection = await getConnection();

    // Realizar la conexión a la base de datos
    connection.connect();
    const results = await new Promise((resolve, reject) => {
      connection.query(
        queryString,
        [phone, message, urlMedia, respestaEnvio, decoded.id],
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
        message: "Reporte Creado Con Exito",
        Data: results,
      });
    } else {
      // Responder si no se encuentran números
      return res
        .status(400)
        .json({ Type: false, message: "No se pudo Registrar el Reporte" });
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

const Deletereport = async (req, res) => {
  try {
    // Validar el token
    const decoded = ValidarToken(req);

    // Ahora puedes usar el contenido decodificado del token
    const { id } = req.body;

    //       // Consulta SQL para obtener el usuario correspondiente a la contraseña proporcionada
    const queryString = "DELETE FROM reportmessage WHERE id = ? and uuid = ?";
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
        .json({
          Type: false,
          message: "No hay Reportes Registados para eliminar.",
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

const DeleteAllReports = async (req, res) => {
  try {
    // Validar el token
    const decoded = ValidarToken(req);

    // Ahora puedes usar el contenido decodificado del tok

    //       // Consulta SQL para obtener el usuario correspondiente a la contraseña proporcionada
    const queryString = "DELETE FROM reportmessage WHERE uuid = ?";
    const connection = await getConnection();

    // Realizar la conexión a la base de datos
    connection.connect();
    const results = await new Promise((resolve, reject) => {
      connection.query(
        queryString,
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

    if (results.affectedRows > 0) {
      // Responder con éxito si se encuentran números
      return res.status(200).json({
        Type: true,
        message: "Registros Eliminados Con Exito",
        Data: results,
      });
    } else {
      // Responder si no se encuentran números
      return res
        .status(400)
        .json({
          Type: false,
          message: "No hay Reportes Registados para eliminar.",
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

module.exports = {
  SelectReports,
  SaveReport,
  Deletereport,
  DeleteAllReports
};
