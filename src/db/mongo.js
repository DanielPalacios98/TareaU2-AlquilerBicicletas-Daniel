const mongoose = require('mongoose');
const { mongoUri } = require('../config/env');

async function connectMongo() {
  await mongoose.connect(mongoUri);
  console.log('MongoDB conectado');
}

module.exports = { mongoose, connectMongo };
