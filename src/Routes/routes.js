const express = require("express");
const router = express.Router();
//funciones del usuario
const {functionRegisterUser,funcionLogin,funcionVerificarCuenta} = require("./Functions-Routes/users");

const {SelectNumbers,SaveNumber,DeleteNumber,SaveNumberPlantilla} = require("./Functions-Routes/numbers.js");
const {SelectMessages} = require("./Functions-Routes/messages.js")

// Ruta para registrar un usuario
router.post("/register-user", functionRegisterUser)
router.post("/login", funcionLogin);
router.post("/rest-password", funcionLogin);
router.get("/verify-account", funcionVerificarCuenta);
router.post("/numbers", SelectNumbers);
router.post("/save-number", SaveNumber);
router.post("/delete-number", DeleteNumber);
router.post("/save-number-plantilla", SaveNumberPlantilla);
router.post("/messages", SelectMessages);
///save-number-plantilla

module.exports = router;
