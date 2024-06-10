const nodemailer = require("nodemailer");
require("dotenv").config();
// Configuración del servidor SMTP
const transporter = nodemailer.createTransport({
  host: process.env.HOST_EMAIL, // Cambia esto por el host de tu servidor SMTP
  port: process.env.PORT_EMAIL, // Cambia esto al puerto de tu servidor SMTP
  secure: false, // Si el servidor SMTP requiere SSL/TLS, cambia esto a true
  auth: {
    user: process.env.USER_EMAIL, // Cambia esto por tu dirección de correo electrónico
    pass: process.env.PASS_EMAIL, // Cambia esto por tu contraseña de correo electrónico
  },
});


// Datos del correo electrónico
const mailParams = {
  from: "tu_correo@example.com", // Cambia esto por tu dirección de correo electrónico
  to: "destinatario@example.com", // Cambia esto por la dirección de correo electrónico del destinatario
  subject: "Prueba de correo electrónico desde Node.js",
  text: "Hola,\nEste es un correo electrónico de prueba enviado desde Node.js. \n electron://reset-password",
};

const EnviarEmail = (mailOptions) => {
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error al enviar el correo electrónico:", error);
        reject(error); // Rechaza la promesa con el error
      } else {
        
        resolve(info.response); // Resuelve la promesa con la respuesta del envío
         
      }
    });
  });
};

module.exports = {
  EnviarEmail,
};
