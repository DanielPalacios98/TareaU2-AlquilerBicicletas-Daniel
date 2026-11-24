const { mongoose } = require('../db/mongo');
const Bike = require('../models/bike');
const BikeReport = require('../models/bikeReport');
const prisma = require('../db/prisma');
const httpError = require('../utils/httpError');

function assertId(id) {
  if (!mongoose.isValidObjectId(id)) throw httpError(400, 'El id de la bicicleta no es válido');
}

async function list({ q, fields, sort }) {
  const filter = q ? { $or: [{ name: new RegExp(q, 'i') }, { station: new RegExp(q, 'i') }, { serialNumber: new RegExp(q, 'i') }] } : {};
  const projection = fields ? fields.split(',').map((field) => field.trim()).filter(Boolean).join(' ') : undefined;
  return Bike.find(filter, projection).sort(sort || '-createdAt').lean({ virtuals: true });
}

async function get(id) {
  assertId(id);
  const bike = await Bike.findById(id).lean({ virtuals: true });
  if (!bike) throw httpError(404, 'Bicicleta no encontrada');
  return bike;
}

async function create(data) {
  return new Bike(data).save();
}

async function update(id, data) {
  assertId(id);
  const bike = await Bike.findById(id);
  if (!bike) throw httpError(404, 'Bicicleta no encontrada');
  Object.assign(bike, data);
  return bike.save();
}

async function remove(id) {
  assertId(id);
  const rentals = await prisma.rental.count({ where: { bikeId: id } });
  if (rentals > 0) throw httpError(409, 'No se puede borrar: PostgreSQL todavía usa esta bicicleta');
  const bike = await Bike.findByIdAndDelete(id);
  if (!bike) throw httpError(404, 'Bicicleta no encontrada');
  await BikeReport.deleteMany({ bikeId: id });
  return { deleted: true, deletedReports: true };
}

async function exists(id) {
  assertId(id);
  return Boolean(await Bike.exists({ _id: id }));
}

module.exports = { list, get, create, update, remove, exists };
