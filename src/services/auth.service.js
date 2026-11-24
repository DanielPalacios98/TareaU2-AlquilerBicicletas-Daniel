const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db/prisma');
const { jwtSecret } = require('../config/env');
const httpError = require('../utils/httpError');

function issueToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, name: user.name }, jwtSecret, { expiresIn: '2h' });
}

async function register({ name, email, password }) {
  if (!name || !email || !password || password.length < 8) {
    throw httpError(400, 'Nombre, correo y contraseña de al menos 8 caracteres son obligatorios');
  }
  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name: name.trim(), email: normalizedEmail, passwordHash } });
  return { id: user.id, name: user.name, email: user.email, token: issueToken(user) };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw httpError(401, 'Credenciales incorrectas');
  return { id: user.id, name: user.name, email: user.email, token: issueToken(user) };
}

module.exports = { register, login };
