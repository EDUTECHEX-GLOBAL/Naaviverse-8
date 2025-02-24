const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pathSchema = new mongoose.Schema(
  {
    email: { type: String },
    nameOfPath: { type: String, required: true },
    description: { type: String },
    current_coordinates: { type: String },
    feature_coordinates: { type: String },
    program: { type: String },
    university: [{ type: String }],
    the_ids: [{
      step_id: { type: mongoose.Types.ObjectId, required: true }, // Step ID
      stepName: { type: String }, // Step name
      stepDescription: { type: String }, // Step description
      backup_pathId: { type: mongoose.Types.ObjectId, required: true }, // Backup path ID
      backupPathName: { type: String }, // Backup path name
      backupPathDescription: { type: String } // Backup path description
    }],
    path_type: { type: String, enum: ['education', 'careers', 'immigration'], default: 'education' },
    path_cat: { type: String, enum: ['K12', 'Degree'], default: 'K12' },
    personality: { type: String, enum: ['realistic', 'investigative', 'artistic', 'social', 'enterprising', 'conventional'] },
    destination_degree: { type: String },
    destination_institution: { type: String },
    length: { type: String},
    city: { type: String },
    country: { type: String },
    status: { type: String, enum: ['active', 'inactive', 'waitingforapproval', 'delete'], default: 'waitingforapproval' },
    financialSituation: [{ type: String, enum: ['0-25L', '25L-75L', '75L-3CR', '3CR+', "other"] }], // Changed to an array of strings
    curriculum: [{ type: String, enum: ['IB', 'CBSE', 'IGCSE', 'CSE', 'ICSE', 'Nordic'] }], // Changed to an array of strings
    grade: [{ type: String, enum: ['9', '10', '11', '12'] }], // Changed to an array of strings
    grade_avg: [{ type: String, enum: ['0-35%', '36% - 60%', '61% - 75%', '76% - 85%', '86% - 95%', '96% - 100%'] }],
    stream: [{ type: String, enum: ['MPC', 'BIPC', 'CEC', 'MEC', 'HEC'] }], // Changed to an array of strings
    performance: { type: String, enum: ['0-35%', '36%-60%', '61%-75%', '76%-85%', '86%-95%', '96%-100%'] } // New field for performance
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('paths', pathSchema);
