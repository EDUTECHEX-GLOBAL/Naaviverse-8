// const mongoose = require('mongoose');

// const userPathSchema = new mongoose.Schema({
//     email: { type: String },
//     pathId: { type: mongoose.Types.ObjectId },
//     status: { type: String, enum: ['active', 'inactive'], default: 'active' },
//     completedSteps: [{ type: mongoose.Types.ObjectId }],
//     currentStep: { type: String }
// }, {
//     timestamps: true
// });

// module.exports = mongoose.model('userPaths', userPathSchema);

const mongoose = require('mongoose');

const UserPathSelectionSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  pathId: { type: mongoose.Schema.Types.ObjectId, ref: "Path", required: true},
  steps: [
    {
      stepId: { type: mongoose.Schema.Types.ObjectId, required: true },
      name: String,
      description: String,
    },
  ],
});

module.exports = mongoose.model("UserPathSelection", UserPathSelectionSchema);
