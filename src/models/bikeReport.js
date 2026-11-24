const { mongoose } = require('../db/mongo');

const reportSchema = new mongoose.Schema({
  rentalId: { type: String, required: [true, 'El alquiler es obligatorio'], index: true },
  userId: { type: String, required: [true, 'El usuario es obligatorio'], index: true },
  bikeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bike', required: [true, 'La bicicleta es obligatoria'], index: true },
  rentalCode: { type: String, required: [true, 'El código de alquiler es obligatorio'] },
  bikeName: { type: String, required: [true, 'El nombre copiado de la bicicleta es obligatorio'] },
  status: {
    type: String,
    enum: { values: ['BUENO', 'DAÑO_LEVE', 'DAÑO_GRAVE', 'PERDIDA'], message: 'El estado del reporte no es válido' },
    required: [true, 'El estado del reporte es obligatorio'],
  },
  rating: { type: Number, min: [1, 'La calificación mínima es 1'], max: [5, 'La calificación máxima es 5'], required: true },
  notes: { type: String, maxlength: [500, 'Las notas no pueden superar 500 caracteres'], trim: true, default: '' },
}, { timestamps: true, versionKey: false });

reportSchema.index({ rentalId: 1, createdAt: -1 });

module.exports = mongoose.models.BikeReport || mongoose.model('BikeReport', reportSchema);
