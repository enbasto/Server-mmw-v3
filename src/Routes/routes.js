const express = require("express");
const router = express.Router();
//funciones del usuario
const {
  RegisterUser,
  LoginUser,
  ResetPasswordUser,
  VerificarCuentaUser,
  NewPasswordUser,
  NewPassword
} = require("./Functions-Routes/users");

const {
  SelectNumbers,
  SaveNumber,
  DeleteNumber,
  DeleteAllNumbers,
  SaveNumberPlantilla,
} = require("./Functions-Routes/numbers.js");
const {
  SelectMessages,
  SelectMessage,
  SaveMessages,
  DeleteMessages,
} = require("./Functions-Routes/messages.js");

const { SelectReports,SaveReport,Deletereport,DeleteAllReports } = require("./Functions-Routes/reportEnvios.js");

// Ruta para registrar un usuario
router.post("/register-user", RegisterUser);
router.post("/login", LoginUser);
router.post("/rest-password-user", ResetPasswordUser);
router.post("/new-password", NewPassword);
router.get("/new-password-user", NewPasswordUser);
router.get("/verify-account", VerificarCuentaUser);
router.post("/numbers", SelectNumbers);
router.post("/save-number", SaveNumber);
router.post("/delete-number", DeleteNumber);
router.post("/delete-all-numbers", DeleteAllNumbers); //
router.post("/save-number-plantilla", SaveNumberPlantilla);
router.post("/messages", SelectMessages);
router.post("/message", SelectMessage);
router.post("/save-message", SaveMessages);
router.post("/delete-message", DeleteMessages);
router.post("/report", SelectReports);
router.post("/save-report", SaveReport);
router.post("/delete-report", Deletereport);
router.post("/delete-all-reports", DeleteAllReports);


///save-number-plantilla

module.exports = router;
