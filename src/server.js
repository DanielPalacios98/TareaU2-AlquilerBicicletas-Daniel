const app = require('./app');
const { port } = require('./config/env');
const prisma = require('./db/prisma');
const { connectMongo } = require('./db/mongo');

async function start() {
  await connectMongo();
  await prisma.$connect();
  app.listen(port, () => console.log(`Servidor ejecutándose en http://localhost:${port}`));
}

start().catch(async (error) => {
  console.error('No se pudo iniciar el servidor:', error.message);
  await prisma.$disconnect().catch(() => {});
  process.exit(1);
});

async function shutdown() {
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
