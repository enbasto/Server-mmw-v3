const bcrypt = require('bcrypt');
const crypto = require('crypto');


const encriptarPasswordUser = async (usuario) => {
    return new Promise((resolve, reject) => {
        // Generar un número aleatorio de rounds de hashing entre 8 y 12
        const saltRounds = Math.floor(Math.random() * (12 - 8 + 1)) + 8;
        
        // Generar un salt
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if (err) {
                reject('Error al generar salt: ' + err);
            } else {
                // Hash de la contraseña con el salt generado
                bcrypt.hash(usuario.password, salt, function(err, hashedPassword) {
                    if (err) {
                        reject('Error al encriptar la contraseña: ' + err);
                    } else {
                        // Crear objeto de usuario con contraseña encriptada y salt
                        const usuarioEncriptado = {
                            ...usuario,
                            hashed_password: hashedPassword,
                            salt: salt
                        };
                        resolve(usuarioEncriptado);
                    }
                });
            }
        });
    });
}

// Función para verificar la contraseña
const verificarPasswordUser = async (contraseña, hash) => {
    try {
        // Compara la contraseña proporcionada con el hash almacenado
        const match = await bcrypt.compare(contraseña, hash);
        return match;
    } catch (error) {
        // Manejar el error si ocurre alguno
        console.error('Error al verificar la contraseña:', error);
        return false;
    }
};



// Función para encriptar el email usando AES
function encryptEmail(email, key) {
    const algorithm = 'aes-256-cbc';
    // Convertir la clave a un búfer si es una cadena de caracteres
    const keyBuffer = Buffer.from(key.substring(0, 32), 'utf8');
    const cipher = crypto.createCipheriv(algorithm, keyBuffer, Buffer.alloc(16)); // IV es un búfer de 16 bytes
    let encrypted = cipher.update(email, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

// // La llave para encriptar
// const key = 'MiLlaveSecreta123456789012345678901';
// const key = '12345678901234567890123456789123456';

// // // El email a encriptar
// const encryptedEmail = 'e69482ffd886b5ffb966cc935757b805a21bd0fc7ea5b21ec41ddbdb96bd44d6';

// // // Encriptar el email
// const res = decryptEmail(encryptedEmail, key);



///________________________________________________________________
// Función para desencriptar el email usando AES
function decryptEmail(encryptedEmail, key) {
   try {
    const algorithm = 'aes-256-cbc';
    const keyBuffer = Buffer.from(key.substring(0, 32), 'utf8');
    // Creamos el descifrador con la clave y un IV (vector de inicialización) vacío
    const decipher = crypto.createDecipheriv(algorithm, keyBuffer, Buffer.alloc(16));
    // Desciframos el email
    let decrypted = decipher.update(encryptedEmail, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
   } catch (error) {
    return "";
   }
}

// // // La llave para desencriptar (debe ser la misma que usaste para encriptar)
// const key = 'MiLlaveSecreta123456789012345678901';
// const key = '12345678901234567890123456789123456';

// El email a encriptar
// const emailEncrip = '23abcf8e97b62600a2f335754d9c4050c99b0204229f951bc2565abbac15bbf4';

// // Desencriptar el email
// const decryptedEmail = decryptEmail(emailEncrip, key);



module.exports ={
    encriptarPasswordUser,
    verificarPasswordUser,
    encryptEmail,
    decryptEmail
}