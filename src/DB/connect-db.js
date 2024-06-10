require("dotenv").config();
const mysql = require('mysql');

// Función para obtener la conexión a la base de datos
const getConnection = async () => {
  // Configurar la conexión a la base de datos
  const connection = mysql.createConnection({
    host: process.env.HOST_DB,
    user: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    database: process.env.DATABASE,
    port: process.env.PORT_DB,
    charset: 'utf8mb4'  // Esto es crucial para manejar emojis
  });
  return connection;
};
(async () => {
  try {
    const connection = await getConnection(); // Espera a que se obtenga la conexión
    connection.connect((err) => {
      if (err) {
        console.error("Error al conectar a la base de datos:", err);
        return;
      }
      console.log("Conexión a la DB establecida con éxito.");
      // Ahora puedes realizar consultas u otras operaciones con la base de datos utilizando esta conexión
    });
  } catch (error) {
    console.error("Error al obtener la conexión:", error);
  }
})();

module.exports = {
  getConnection
};
