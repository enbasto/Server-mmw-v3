require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./Routes/routes');

const app = express();
const port = process.env.PORT_SERVER || 3000;

app.set('view engine', 'ejs');
app.set('views', './Templates'); // Directorio donde se encuentran las plantillas
app.use(express.static('public'));
// Middleware para parsear el cuerpo de las solicitudes como JSON
app.use(bodyParser.json());
// Rutas definidas en el archivo routes.js
app.use('/', routes);

// Manejador de errores para JSON parse error
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    res.status(400).json({ error: 'JSON parse error' });
  } else {
    next();
  }
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
