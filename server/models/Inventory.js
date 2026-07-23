/**
 * Inventory model
 *
 * Tracks stock for the 4 ingredient categories the kitchen relies on:
 * bases, sauces, cheeses, vegetables. Each row holds a current quantity,
 * a threshold (below which it's considered "low stock"), and a unit.
 */
const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['base', 'sauce', 'cheese', 'vegetable'],
    },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    threshold: { type: Number, required: true, min: 0, default: 5 },
    unit: { type: String, default: 'units' },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Convenience: is this item currently low on stock?
inventorySchema.virtual('isLow').get(function () {
  return this.quantity <= this.threshold;
});

// Keep lastUpdated current on every save.
inventorySchema.pre('save', function (next) {
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('Inventory', inventorySchema);
