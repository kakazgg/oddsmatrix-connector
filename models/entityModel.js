const mongoose = require("mongoose");
const entitySchema = new mongoose.Schema(
  { id: String },
  { timestamps: true, strict: false }
);
entitySchema.index({ entityClass: 1, id: 1 });

module.exports = mongoose.model("Entity", entitySchema);
