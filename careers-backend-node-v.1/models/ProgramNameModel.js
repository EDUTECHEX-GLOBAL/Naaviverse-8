const mongoose = require('mongoose');

const ProgramNameSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
});

const ProgramName = mongoose.model('ProgramName', ProgramNameSchema);

module.exports = ProgramName;