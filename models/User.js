const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  oauthProvider: { type: String, required: true }, // e.g., "google"
  oauthId: { type: String, required: true },       // Google ID
  name: { type: String, required: true },
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
