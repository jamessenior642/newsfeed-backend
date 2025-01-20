const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  summary: { type: String, default: "" },
  author: { type: String, default: "Anonymous" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to User
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Article", articleSchema);
