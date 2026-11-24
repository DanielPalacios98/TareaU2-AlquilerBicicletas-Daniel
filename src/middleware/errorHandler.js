function errorHandler(error, _req, res, _next) {
  if (error?.name === 'ValidationError') {
    return res.status(400).json({ error: 'Datos inválidos', details: Object.values(error.errors).map((item) => item.message) });
  }
  if (error?.code === 11000) {
    return res.status(409).json({ error: 'Ya existe un registro con uno de esos valores' });
  }
  const status = Number(error.status) || 500;
  const payload = { error: error.message || 'Error interno del servidor' };
  if (error.details) payload.details = error.details;
  if (status >= 500) console.error(error);
  return res.status(status).json(payload);
}

module.exports = errorHandler;
