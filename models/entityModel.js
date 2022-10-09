const mongoose = require("mongoose");
const entitySchema = new mongoose.Schema(
  {
    entityClass: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    version: {
      type: Number,
      required: true,
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
