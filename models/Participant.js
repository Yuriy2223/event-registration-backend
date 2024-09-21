const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: {
    type: String,
    required: true,
    match: /.+\@.+\..+/,
  },
  dob: {
    type: Date,
    required: true,
  },
  referral: { type: String, required: true },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
});

//  перевірка дати народження
participantSchema.methods.isDobValid = function () {
  return this.dob <= new Date();
};

module.exports = mongoose.model("Participant", participantSchema);
