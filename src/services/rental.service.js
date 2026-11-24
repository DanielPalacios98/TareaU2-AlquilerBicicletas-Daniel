const crypto = require('node:crypto');
const { mongoose } = require('../db/mongo');
const Bike = require('../models/bike');
const BikeReport = require('../models/bikeReport');
const prisma = require('../db/prisma');
const httpError = require('../utils/httpError');

function assertBikeId(id) {
  if (!mongoose.isValidObjectId(id)) throw httpError(400, 'El bikeId no es un ObjectId válido');
}

async function create(userId, { bikeId }) {
  assertBikeId(bikeId);
  const bike = await Bike.findById(bikeId).lean();
  if (!bike) throw httpError(404, 'La bicicleta indicada no existe en MongoDB');
  if (bike.status !== 'DISPONIBLE') throw httpError(409, 'La bicicleta no está disponible');

  const active = await prisma.rental.findFirst({ where: { bikeId, status: 'ACTIVE' } });
  if (active) throw httpError(409, 'Esta bicicleta ya tiene un alquiler activo');

  const rental = await prisma.rental.create({
    data: {
      code: `ALQ-${Date.now()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
      userId,
      bikeId,
      bikeName: bike.name,
      bikeType: bike.type,
    },
  });
  await Bike.updateOne({ _id: bikeId }, { $set: { status: 'INACTIVA' } });
  return rental;
}

async function list(userId) {
  return prisma.rental.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
}

async function get(userId, id) {
  const rental = await prisma.rental.findFirst({ where: { id, userId } });
  if (!rental) throw httpError(404, 'Alquiler no encontrado');
  return rental;
}

async function joined(userId) {
  const rentals = await list(userId);
  const ids = [...new Set(rentals.map((rental) => rental.bikeId).filter(Boolean))];
  const bikes = ids.length ? await Bike.find({ _id: { $in: ids } }).lean({ virtuals: true }) : [];
  const byId = new Map(bikes.map((bike) => [String(bike._id), bike]));
  return rentals.map((rental) => ({ ...rental, bike: rental.bikeId ? byId.get(rental.bikeId) || null : null }));
}

async function returnRental(userId, id) {
  const rental = await get(userId, id);
  if (rental.status !== 'ACTIVE') throw httpError(409, 'El alquiler ya no está activo');
  const updated = await prisma.rental.update({ where: { id }, data: { status: 'RETURNED', returnedAt: new Date() } });
  if (rental.bikeId) await Bike.updateOne({ _id: rental.bikeId }, { $set: { status: 'DISPONIBLE' } });
  return updated;
}

async function remove(userId, id) {
  const rental = await get(userId, id);
  if (rental.status === 'ACTIVE') throw httpError(409, 'Devuelve el alquiler antes de eliminarlo');
  await BikeReport.deleteMany({ rentalId: id });
  await prisma.rental.delete({ where: { id } });
  return { deleted: true };
}

module.exports = { create, list, get, joined, returnRental, remove };
