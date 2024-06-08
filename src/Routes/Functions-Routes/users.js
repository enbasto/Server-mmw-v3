require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { getConnection } = require("../../DB/connect-db");
const jwt = require("jsonwebtoken");
const { encriptarPasswordUser, verificarPasswordUser,encryptEmail,decryptEmail } = require("../../Function/encrypt");
const {EnviarEmail} = require("../../Server-Smtp/server-smtp");
const keyEncryption = "12345678901234567890123456789123456"

//const decodedHash = decodeURIComponent(encodedHash);
// console.log("encodedHash: " +encodedHash);
// console.log("decodedHash: " +decodedHash);


////////

// const contenidoPlantilla = fs.readFileSync(process.env.CONFIRM_EMAIL_PLANTILLA, 'utf8');
//         const dataEmail = JSON.parse(contenidoPlantilla);
//         console.log(dataEmail);
//         const contenidoHTML = fs.readFileSync(dataEmail.html, 'utf8');
//         parametros = dataEmail.Parametros
//         console.log(parametros);
//         var contenidoHTMLModificado =contenidoHTML
//         const encodedHash = encodeURIComponent("modelUser.salt");
//         for (let key in parametros) {
//             console.log("P: " + parametros[key]);
//             console.log("key: " + key);
//             const valueParametros = parametros[key] + encodedHash;
//             console.log("VP: " + valueParametros);

//             contenidoHTMLModificado=contenidoHTMLModificado.replace(key,valueParametros)
//             console.log(contenidoHTMLModificado);
//         }

///////
const functionRegisterUser = async (req, res) => {
    try {
      // Obtener los datos del cuerpo de la solicitud
      const { nombres, email, password,apellidos, numero_celular, fecha_nacimiento, genero } = req.body;
      

      console.log(req.body);
      const connection = await getConnection();
      // Realizar la conexión a la base de datos
      connection.connect();
  
      const emailExistsQuery = "SELECT * FROM users WHERE email = ?";
    var emailMinus = email.toLowerCase()
      const existingUser = await new Promise((resolve, reject) => {
        connection.query(emailExistsQuery, [emailMinus], (error, results, fields) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        });
      });
    //   console.log(existingUser);
    //   console.log(existingUser[0]);
      if (existingUser.length  > 0) {
        return res.status(400).json({Type: false, message: "El email ya está registrado" });
      }
      
      const usuario = {
        nombres: nombres,
        email: email.toLowerCase(),
        password: password,
        apellidos: apellidos,
        numero_celular: numero_celular,
        fecha_nacimiento: fecha_nacimiento,
        genero: genero
      };
      console.log(usuario)
      // Encriptar la contraseña
      const modelUser = await encriptarPasswordUser(usuario);  
      const insertUserQuery = 'INSERT INTO users (nombres, email, hashed_password, salt, apellidos, numero_celular, fecha_nacimiento, genero) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
      const registerUser = await new Promise((resolve, reject) => {
        const { nombres, email, hashed_password, salt, apellidos, numero_celular, fecha_nacimiento, genero } = modelUser;
        connection.query(insertUserQuery, [nombres, email, hashed_password, salt, apellidos, numero_celular, fecha_nacimiento, genero], (error, results, fields) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        });
      });
      connection.end();
      console.log(registerUser)
      if (registerUser.affectedRows > 0) {
        //enviar Email de verificacion
        console.log(process.env.CONFIRM_EMAIL_PLANTILLA)
        const contenidoPlantilla = fs.readFileSync(process.env.CONFIRM_EMAIL_PLANTILLA, 'utf8');
        const dataEmail = JSON.parse(contenidoPlantilla);
        console.log(dataEmail);
        const contenidoHTML = fs.readFileSync(dataEmail.html, 'utf8');
        parametros = dataEmail.Parametros
        console.log(parametros);
        const EmailCode = encryptEmail(modelUser.email, keyEncryption);
        console.log(EmailCode);
        const encodedHash = encodeURIComponent(EmailCode);
        var contenidoHTMLModificado = contenidoHTML;
        for (let key in parametros) {
            const valueParametros = parametros[key] + encodedHash;
            contenidoHTMLModificado=contenidoHTMLModificado.replace(key,valueParametros)
        }
              const mailParams = {
                from: 'MMW', // Cambia esto por tu dirección de correo electrónico
                to: modelUser.email, // Cambia esto por la dirección de correo electrónico del destinatario
                subject: dataEmail.Asunto,
                // text: 'Hola,\nEste es un correo electrónico de prueba enviado desde Node.js.\n electron://reset-password'
                html: contenidoHTMLModificado
            };
        const ResultadoEmail = await EnviarEmail(mailParams);
        console.log(ResultadoEmail);
        if (/^250/.test(ResultadoEmail)) {
            return res.status(201).json({ message: 'Usuario registrado exitosamente, Revisa tú correo para verificar la cuenta', Type: true, Panel: "/"  });
        }
      }
    } catch (error) {
      console.log("Error al registrar usuario:", error);
      return res.status(500).json({Type: false, message: "Error interno del servidor" });
    }
}
//LOGIN

const funcionLogin = async (req, res) => {
    const { email, password } = req.body;
    const emailExistsQuery = "SELECT * FROM users WHERE email = ?";
    const connection = await getConnection();
    const emailMinus = email.toLowerCase()
    // Realizar la conexión a la base de datos
    connection.connect();
      const existingUser = await new Promise((resolve, reject) => {
      connection.query(emailExistsQuery, [emailMinus], (error, results, fields) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
    connection.end();
    if (existingUser.length > 0) {
      const passworDescryp = await verificarPasswordUser(password, existingUser[0].hashed_password);
      // console.log("VERI: "+existingUser[0].verificacion_email);
      if (!existingUser[0].verificacion_email) {
        return res.status(200).json({ Type: false, message: "No ha verificado su cuenta, por faverifiquela antes de acceder",  });
      }
      if (passworDescryp) {
        const token = jwt.sign({ id: existingUser[0].uuid },process.env.JWT_SECRET || "masmahulnsqpiw28p3273hlm23hoalms.jmqñw");
        return res.status(200).json({ Type: true, message: "", Token: token, Panel: "/dashboard" });
      }else{
        return res.status(404).json({ Type: false, message: "Datos de Usuario Incorrectos." });
      }
    } else {
      return res.status(404).json({ Type: false, message: "Datos de Usuario Incorrectos." });
    }
}

const funcionResetPassword = async (req, res) => {
    const { email } = req.body;
    const emailExistsQuery = "SELECT * FROM users WHERE email = ?";
    const connection = await getConnection();
    // Realizar la conexión a la base de datos
    connection.connect();
      const existingUser = await new Promise((resolve, reject) => {
      connection.query(emailExistsQuery, [email], (error, results, fields) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
    connection.end();
    if (existingUser.length > 0) {

        const contenidoHTML = fs.readFileSync('./src/public/assets/Plantillas/send-email.html', 'utf8');
              const mailParams = {
                from: 'MMW', // Cambia esto por tu dirección de correo electrónico
                to: 'Enbo98@hotmail.com', // Cambia esto por la dirección de correo electrónico del destinatario
                subject: 'Prueba de correo electrónico desde Node.js',
                // text: 'Hola,\nEste es un correo electrónico de prueba enviado desde Node.js.\n electron://reset-password'
                html: contenidoHTML
            };
             const ResultadoEmail = await EnviarEmail(mailParams);
             console.log(ResultadoEmail);
    //   if (passworDescryp) {
    //     const token = jwt.sign({ id: existingUser[0].uuid },process.env.JWT_SECRET || "masmahulnsqpiw28p3273hlm23hoalms.jmqñw");
    //     return res.status(200).json({ Type: true, message: "", Token: token, Panel: "/dashboard" });
    //   }else{
    //     return res.status(404).json({ Type: false, message: "Datos de Usuario Incorrectos." });
    //   }
    } else {
      return res.status(404).json({ Type: false, message: "Datos de Usuario Incorrectos." });
    }
}


const funcionVerificarCuenta = async (req, res) => {
    const parametro = req.query.parametro;
     console.log(parametro)
  const email = decryptEmail(parametro, keyEncryption);
  const emailExistsQuery = "UPDATE users SET verificacion_email = 1 WHERE email = ?";
  const connection = await getConnection();
  const emailMinus = email.toLowerCase()
  // Realizar la conexión a la base de datos
  connection.connect();
    const existingUser = await new Promise((resolve, reject) => {
    connection.query(emailExistsQuery, [emailMinus], (error, results, fields) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
  connection.end();
  if (existingUser.affectedRows > 0) {
    const mensaje = `Se verificó con éxito tu cuenta ${email}. Ahora puedes acceder a nuestro sistema sin restricciones.`; 
    return res.render(process.cwd() + '/src/Templates/views/verify-count', { parametro: mensaje, ocultarSVG:true });
  } else {
    const mensaje = `Lo sentimos no Encontramos datos relacionados con esa cuenta`; 
    return res.render(process.cwd() + '/src/Templates/views/verify-count', { parametro: mensaje, ocultarSVG: false });
    // return res.status(404).json({ Type: false, message: "Datos de Usuario Incorrectos." });
  }
}

module.exports = {
    functionRegisterUser,
    funcionLogin,
    funcionResetPassword,
    funcionVerificarCuenta
};