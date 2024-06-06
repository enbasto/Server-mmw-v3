require("dotenv").config();
const jwt = require("jsonwebtoken");

const ValidarToken = (req) => {
  // Obtener el token del header Authorization
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new Error("No autorizado para realizar esta transacción");
  }

  // Extraer el token del header Authorization (formato "Bearer token")
  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new Error("No autorizado para realizar esta transacción");
  }

  // Desencriptar y verificar el token
  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET || "masmahulnsqpiw28p3273hlm23hoalms.jmqñw"
  );

  return decoded;
};

module.exports = {
  ValidarToken,
};
