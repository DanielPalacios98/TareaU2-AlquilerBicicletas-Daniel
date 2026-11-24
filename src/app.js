const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());
app.get('/', (_req, res) => res.json({ api: 'Tarea U2 · Alquiler de bicicletas', estado: 'ok' }));
app.use('/api', routes);
app.use((_req, _res, next) => next(Object.assign(new Error('Ruta no encontrada'), { status: 404 })));
app.use(errorHandler);

module.exports = app;
