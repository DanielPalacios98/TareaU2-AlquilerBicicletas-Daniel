const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const httpError = require('../utils/httpError');

function requireAuth(req, _res, next) {
  const header = req.get('authorization');
  if (!header?.startsWith('Bearer ')) return next(httpError(401, 'Se requiere un token Bearer'));

  try {
    req.user = jwt.verify(header.slice(7), jwtSecret);
    next();
  } catch (_error) {
    next(httpError(401, 'El token no es válido o ha expirado'));
  }
}

module.exports = { requireAuth };
