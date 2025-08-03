// models/Registro.js
const mongoose = require('mongoose');

const registroSchema = new mongoose.Schema({
  peso: Number,
  lote: String,
  validade: String,
  codigoBarras: String,
  timestamp: { type: Date, default: Date.now },
  caixa: {type: String, required: false},
  status: {type: String, required: false}
});

module.exports = mongoose.model('Registro', registroSchema);
