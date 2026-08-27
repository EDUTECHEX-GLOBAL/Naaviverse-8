const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  country: { type: String, required: true, trim: true },
  state:   { type: String, required: true, trim: true },
  cities:  [{ type: String, trim: true }],
});

LocationSchema.index({ country: 1 });
LocationSchema.index({ country: 1, state: 1 });

const Location = mongoose.model('Location', LocationSchema);

module.exports = Location;