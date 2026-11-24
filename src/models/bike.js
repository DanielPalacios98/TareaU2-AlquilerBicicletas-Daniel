const { mongoose } = require('../db/mongo');

const bikeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre de la bicicleta es obligatorio'],
    minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
    maxlength: [80, 'El nombre no puede superar 80 caracteres'],
    trim: true,
  },
  type: {
    type: String,
    required: [true, 'El tipo de bicicleta es obligatorio'],
    enum: { values: ['URBANA', 'MONTAÑA', 'ELÉCTRICA', 'CARRETERA'], message: 'El tipo de bicicleta no es válido' },
  },
  serialNumber: {
    type: String,
    required: [true, 'El número de serie es obligatorio'],
    match: [/^BIC-\d{4}$/, 'El número de serie debe tener el formato BIC-0000'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  accessories: {
    type: [String],
    default: [],
    validate: {
      validator: (items) => new Set(items.map((item) => item.toLowerCase())).size === items.length,
      message: 'Los accesorios no pueden repetirse',
    },
  },
  station: {
    type: String,
    required: [true, 'La estación es obligatoria'],
    minlength: [3, 'La estación debe tener al menos 3 caracteres'],
    trim: true,
  },
  status: {
    type: String,
    enum: { values: ['DISPONIBLE', 'MANTENIMIENTO', 'INACTIVA'], message: 'El estado no es válido' },
    default: 'DISPONIBLE',
  },
}, { timestamps: true, versionKey: false });

bikeSchema.virtual('isAvailable').get(function isAvailable() {
  return this.status === 'DISPONIBLE';
});

bikeSchema.pre('validate', function normalizeBike() {
  this.accessories = (this.accessories || []).map((item) => item.trim()).filter(Boolean);
  if (this.type === 'ELÉCTRICA' && !this.accessories.some((item) => item.toLowerCase() === 'cargador')) {
    this.accessories.push('Cargador');
  }
});

bikeSchema.index({ station: 1, status: 1 });
bikeSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.models.Bike || mongoose.model('Bike', bikeSchema);
