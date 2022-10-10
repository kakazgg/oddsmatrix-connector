const mongoose = require("mongoose");
const entitySchema = new mongoose.Schema(
  {
    entityClass: {
      type: String,
    },
    name: {
      type: String,
    },
    id: {
      type: String,
    },
    version: {
      type: Number,
    },
    odds: {
      type: Number,
    },
    lastChangedTime: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true }
);
entitySchema.index({ entityClass: 1, id: 1 });

module.exports = mongoose.model("Entity", entitySchema);
