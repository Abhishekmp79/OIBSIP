/**
 * Inventory routes (read-mostly; admin writes go through /api/admin).
 *
 * GET /          — list all inventory rows
 * GET /low-stock — rows where quantity ≤ threshold (public for demo)
 */

const router = require('express').Router();
const Inventory = require('../models/Inventory');

router.get('/', async (req, res, next) => {
  try {
    const items = await Inventory.find().sort({ category: 1, name: 1 }).lean();
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

router.get('/low-stock', async (req, res, next) => {
  try {
    // quantity ≤ threshold
    const items = await Inventory.find({ $expr: { $lte: ['$quantity', '$threshold'] } }).lean();
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
