require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { getConnection } = require("../../DB/connect-db");
const jwt = require("jsonwebtoken");
const {
  encriptarPasswordUser,
  verificarPasswordUser,
  encryptEmail,
  decryptEmail,
} = require("../../Function/encrypt");
const { EnviarEmail } = require("../../Server-Smtp/server-smtp");
const keyEncryption = "12345678901234567890123456789123456";

//const decodedHash = decodeURIComponent(encodedHash);



////////


///////
const RegisterUser = async (req, res) => {
  try {
    // Obtener los datos del cuerpo de la solicitud
    const {
      nombres,
      email,
      password,
      apellidos,
      numero_celular,
      fecha_nacimiento,
      genero,
    } = req.body;

    
    const connection = await getConnection();
    
    connection.connect();

    const emailExistsQuery = "SELECT * FROM users WHERE email = ?";
    var emailMinus = email.toLowerCase();
    const existingUser = await new Promise((resolve, reject) => {
      connection.query(
        emailExistsQuery,
        [emailMinus],
        (error, results, fields) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        }
      );
    });
    if (existingUser.length > 0) {
      return res
        .status(400)
        .json({ Type: false, message: "El email ya está registrado" });
    }

    const usuario = {
      nombres: nombres,
      email: email.toLowerCase(),
      password: password,
      apellidos: apellidos,
      numero_celular: numero_celular,
      fecha_nacimiento: fecha_nacimiento,
      genero: genero,
    };
    
    // Encriptar la contraseña
    const modelUser = await encriptarPasswordUser(usuario);
    const insertUserQuery =
      "INSERT INTO users (nombres, email, hashed_password, salt, apellidos, numero_celular, fecha_nacimiento, genero) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    const registerUser = await new Promise((resolve, reject) => {
      const {
        nombres,
        email,
        hashed_password,
        salt,
        apellidos,
        numero_celular,
        fecha_nacimiento,
        genero,
      } = modelUser;
      connection.query(
        insertUserQuery,
        [
          nombres,
          email,
          hashed_password,
          salt,
          apellidos,
          numero_celular,
          fecha_nacimiento,
          genero,
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
    
    if (registerUser.affectedRows > 0) {
      //enviar Email de verificacion
      
      
      

      const contenidoPlantilla = fs.readFileSync(
        process.cwd() + process.env.CONFIRM_EMAIL_PLANTILLA,
        "utf8"
      );
      const dataEmail = JSON.parse(contenidoPlantilla);
      
      const contenidoHTML = fs.readFileSync(
        process.cwd() + dataEmail.html,
        "utf8"
      );
      parametros = dataEmail.Parametros;
      
      const EmailCode = encryptEmail(modelUser.email, keyEncryption);
      
      const encodedHash = encodeURIComponent(EmailCode);
      var contenidoHTMLModificado = contenidoHTML;
      for (let key in parametros) {
        const valueParametros = parametros[key] + encodedHash;
        contenidoHTMLModificado = contenidoHTMLModificado.replace(
          key,
          valueParametros
        );
      }
      const mailParams = {
        from: "MMW", // Cambia esto por tu dirección de correo electrónico
        to: modelUser.email, // Cambia esto por la dirección de correo electrónico del destinatario
        subject: dataEmail.Asunto,
        // text: 'Hola,\nEste es un correo electrónico de prueba enviado desde Node.js.\n electron://reset-password'
        html: contenidoHTMLModificado,
      };
      const ResultadoEmail = await EnviarEmail(mailParams);
      
      if (/^250/.test(ResultadoEmail)) {
        return res.status(201).json({
          message:
            "Usuario registrado exitosamente, Revisa tú correo para verificar la cuenta",
          Type: true,
          Panel: "/",
        });
      }
    }
  } catch (error) {
    console.log("Error al registrar usuario:", error);
    return res
      .status(500)
      .json({ Type: false, message: "Error interno del servidor" });
  }
};
//LOGIN

const LoginUser = async (req, res) => {
  const { email, password } = req.body;
  const emailExistsQuery = "SELECT * FROM users WHERE email = ?";
  const connection = await getConnection();
  const emailMinus = email.toLowerCase();
  // Realizar la conexión a la base de datos
  connection.connect();
  const existingUser = await new Promise((resolve, reject) => {
    connection.query(
      emailExistsQuery,
      [emailMinus],
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
    const passworDescryp = await verificarPasswordUser(
      password,
      existingUser[0].hashed_password
    );
    
    if (!existingUser[0].verificacion_email) {
      return res.status(200).json({
        Type: false,
        message:
          "No ha verificado su cuenta, por faverifiquela antes de acceder",
      });
    }
    if (passworDescryp) {
      const token = jwt.sign(
        { id: existingUser[0].uuid },
        process.env.JWT_SECRET || "masmahulnsqpiw28p3273hlm23hoalms.jmqñw"
      );
      return res
        .status(200)
        .json({ Type: true, message: "", Token: token, Panel: "/dashboard" });
    } else {
      return res
        .status(404)
        .json({ Type: false, message: "Datos de Usuario Incorrectos." });
    }
  } else {
    return res
      .status(404)
      .json({ Type: false, message: "Datos de Usuario Incorrectos." });
  }
};

const ResetPasswordUser = async (req, res) => {
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
    const contenidoPlantilla = fs.readFileSync(
      process.cwd() + process.env.RESET_PASS_USER,
      "utf8"
    );
    const dataEnvioEmail = JSON.parse(contenidoPlantilla);
    
    const contenidoHTML = fs.readFileSync(
      process.cwd() + dataEnvioEmail.html,
      "utf8"
    );
    parametros = dataEnvioEmail.Parametros;
    
    const EmailCode = encryptEmail(existingUser[0].email, keyEncryption);
    
    const encodedHash = encodeURIComponent(EmailCode);
    var contenidoHTMLModificado = contenidoHTML;
    for (let key in parametros) {
      const valueParametros = parametros[key] + encodedHash;
      contenidoHTMLModificado = contenidoHTMLModificado.replace(
        key,
        valueParametros
      );
    }
    const mailParams = {
      from: "MMW", // Cambia esto por tu dirección de correo electrónico
      to: existingUser[0].email, // Cambia esto por la dirección de correo electrónico del destinatario
      subject: dataEnvioEmail.Asunto,
      // text: 'Hola,\nEste es un correo electrónico de prueba enviado desde Node.js.\n electron://reset-password'
      html: contenidoHTMLModificado,
    };
    const ResultadoEmail = await EnviarEmail(mailParams);
    
    if (/^250/.test(ResultadoEmail)) {
      return res.status(201).json({
        message:
          "Email Enviado exitosamente, Revisa tú correo para Cambiar la Contraseña",
        Type: true,
        Panel: "/",
      });
    } else {
      return res.status(200).json({
        message: "Ocurrio un error al enviar el Email",
        Type: false,
        Panel: "/",
      });
    }
  } else {
    return res
      .status(404)
      .json({ Type: false, message: "Datos de Usuario Incorrectos." });
  }
};

const VerificarCuentaUser = async (req, res) => {
  const parametro = req.query.parametro;
 
  const email = decryptEmail(parametro, keyEncryption);
  const emailExistsQuery =
    "UPDATE users SET verificacion_email = 1 WHERE email = ?";
  const connection = await getConnection();
  const emailMinus = email.toLowerCase();
  // Realizar la conexión a la base de datos
  connection.connect();
  const existingUser = await new Promise((resolve, reject) => {
    connection.query(
      emailExistsQuery,
      [emailMinus],
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
  if (existingUser.affectedRows > 0) {
    const mensaje = `Se verificó con éxito tu cuenta ${email}. Ahora puedes acceder a nuestro sistema sin restricciones.`;
    return res.render(process.cwd() + "/src/Templates/views/verify-count", {
      parametro: mensaje,
      ocultarSVG: true,
    });
  } else {
    const mensaje = `Lo sentimos no Encontramos datos relacionados con esa cuenta`;
    return res.render(process.cwd() + "/src/Templates/views/verify-count", {
      parametro: mensaje,
      ocultarSVG: false,
    });
    // return res.status(404).json({ Type: false, message: "Datos de Usuario Incorrectos." });
  }
};

const NewPasswordUser = async (req, res) => {
  const parametro = req.query.parametro;
 
  const email = decryptEmail(parametro, keyEncryption);
  const emailExistsQuery = "SELECT * FROM users WHERE email = ?";
  const connection = await getConnection();
  const emailMinus = email.toLowerCase();
  // Realizar la conexión a la base de datos
  connection.connect();
  const existingUser = await new Promise((resolve, reject) => {
    connection.query(
      emailExistsQuery,
      [emailMinus],
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
    return res.render(process.cwd() + "/src/Templates/views/new-password-user");
  } else {
    const mensaje = `Lo sentimos no Encontramos datos relacionados con esa cuenta`;
    return res.render(process.cwd() + "/src/Templates/views/not-found", {
      parametro: mensaje,
    });
  }
};

const NewPassword = async (req, res) => {
  const parametro = req.headers["authorization"].replace("Bearer ", "");
  const { password } = req.body;
  const email = decryptEmail(parametro, keyEncryption);
  const emailExistsQuery = "Select * From users WHERE email = ?";
  const connection = await getConnection();
  const emailMinus = email.toLowerCase();
  // Realizar la conexión a la base de datos
  connection.connect();
  const existingUser = await new Promise((resolve, reject) => {
    connection.query(
      emailExistsQuery,
      [emailMinus],
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
    var usuario = {
      password: password,
    };

    const modelUser = await encriptarPasswordUser(usuario);

    const Query = "UPDATE users SET hashed_password = ?, salt = ? WHERE email = ?";
    const connection = await getConnection();
    const emailMinus = email.toLowerCase();
    // Realizar la conexión a la base de datos
    connection.connect();
    const existing = await new Promise((resolve, reject) => {
      connection.query(
        Query,
        [modelUser.hashed_password, modelUser.salt, emailMinus],
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
    if (existing.affectedRows > 0) {
      return res.status(200).json({
        message: "Contraseña Actualizada con Exito",
        Type: true,
        Panel: "http://localhost:3001/",
      });
    } else {
      return res.status(200).json({
        message: "No de puso Actualizar Contraseña con Exito",
        Type: false,
      });
    }
  } else {
    return res.status(200).json({
      message: "Usuario no Existe",
      Type: false,
    });
    // return res.status(404).json({ Type: false, message: "Datos de Usuario Incorrectos." });
  }
};

module.exports = {
  RegisterUser,
  LoginUser,
  ResetPasswordUser,
  VerificarCuentaUser,
  NewPasswordUser,
  NewPassword,
};
