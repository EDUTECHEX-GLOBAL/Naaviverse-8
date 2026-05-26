const mongoose = require('mongoose');

const UniversityProgramSchema = new mongoose.Schema({
  university: { type: String, required: true, trim: true },
  program:    { type: String, required: true, trim: true },
});

// Index for fast university lookup
UniversityProgramSchema.index({ university: 1 });

const UniversityProgram = mongoose.model('UniversityProgram', UniversityProgramSchema);

module.exports = UniversityProgram;