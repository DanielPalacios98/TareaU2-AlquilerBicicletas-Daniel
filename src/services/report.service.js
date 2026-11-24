const { mongoose } = require('../db/mongo');
const Bike = require('../models/bike');
const BikeReport = require('../models/bikeReport');
const prisma = require('../db/prisma');
const httpError = require('../utils/httpError');

async function create(userId, { rentalId, status, rating, notes }) {
  const rental = await prisma.rental.findFirst({ where: { id: rentalId, userId } });
  if (!rental) {
    const exists = await prisma.rental.findUnique({ where: { id: rentalId } });
    if (exists) throw httpError(403, 'El alquiler no pertenece al usuario autenticado');
    throw httpError(404, 'El alquiler no existe en PostgreSQL');
  }
  if (!rental.bikeId || !mongoose.isValidObjectId(rental.bikeId)) throw httpError(400, 'El alquiler no tiene un bikeId válido');
  const bike = await Bike.findById(rental.bikeId).lean();
  if (!bike) throw httpError(404, 'La bicicleta del alquiler ya no existe en MongoDB');

  return new BikeReport({
    rentalId: rental.id,
    userId,
    bikeId: rental.bikeId,
    rentalCode: rental.code,
    bikeName: rental.bikeName || bike.name,
    status,
    rating,
    notes,
  }).save();
}

async function list(userId) {
  const [items, summary] = await Promise.all([
    BikeReport.find({ userId }).sort({ createdAt: -1 }).populate('bikeId', 'name type station serialNumber').lean(),
    BikeReport.aggregate([
      { $match: { userId } },
      { $group: { _id: null, averageRating: { $avg: '$rating' }, totalReports: { $sum: 1 } } },
    ]),
  ]);
  return { items, summary: summary[0] || { averageRating: 0, totalReports: 0 } };
}

async function remove(userId, id) {
  if (!mongoose.isValidObjectId(id)) throw httpError(400, 'El id del reporte no es válido');
  const result = await BikeReport.deleteOne({ _id: id, userId });
  if (!result.deletedCount) throw httpError(404, 'Reporte no encontrado');
  return { deleted: true };
}

module.exports = { create, list, remove };
