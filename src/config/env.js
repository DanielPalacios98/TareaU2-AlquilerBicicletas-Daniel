require('dotenv').config();

const required = ['DATABASE_URL', 'MONGODB_URI', 'JWT_SECRET'];
for (const name of required) {
  if (!process.env[name]) throw new Error(`Falta la variable de entorno ${name}`);
}

module.exports = {
  port: Number(process.env.PORT || 3000),
  jwtSecret: process.env.JWT_SECRET,
  databaseUrl: process.env.DATABASE_URL,
  mongoUri: process.env.MONGODB_URI,
};
