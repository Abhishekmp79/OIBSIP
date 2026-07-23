/**
 * Admin routes — all require protect + adminOnly middleware.
 *
 * POST   /login              — admin-only login (checks role)
 * GET    /orders             — all orders (with search + status filter)
 * GET    /orders/:id         — one order detail
 * PATCH  /orders/:id/status  — advance status + emit 'orderUpdate'
 * GET    /inventory          — all inventory rows
 * PUT    /inventory/:id      — update quantity/threshold + emit 'inventoryUpdate'
 * GET    /stats              — quick dashboard counters
 */

const router = require('express').Router();
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const { protect, adminOnly } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

const STATUS_FLOW = ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered'];

// ── POST /login (admin only) ───────────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() }).select('+password');
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: 'Invalid admin credentials' });

    const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
    res.json({
      message: 'Admin login successful',
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

// Everything below requires an authenticated admin.
router.use(protect, adminOnly);

// ── GET /orders ────────────────────────────────────────────────────────
router.get('/orders', async (req, res, next) => {
  try {
    const { q, status } = req.query;
    const filter = {};
    if (status && status !== 'All') filter.status = status;
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      // Match order id (last 6 of _id hex) or customer name.
      filter.$or = [{ customerName: rx }, { customerEmail: rx }];
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ orders });
  } catch (err) {
    next(err);
  }
});

// ── GET /orders/:id ────────────────────────────────────────────────────
router.get('/orders/:id', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ order });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /orders/:id/status ───────────────────────────────────────────
router.patch('/orders/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!STATUS_FLOW.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Real-time push to connected clients.
    const io = req.app.get('io');
    if (io) io.emit('orderUpdate', { orderId: order._id, status: order.status });

    res.json({ message: 'Status updated', order });
  } catch (err) {
    next(err);
  }
});

// ── GET /inventory ─────────────────────────────────────────────────────
router.get('/inventory', async (req, res, next) => {
  try {
    const items = await Inventory.find().sort({ category: 1, name: 1 }).lean();
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

// ── PUT /inventory/:id  (manual stock update) ──────────────────────────
router.put('/inventory/:id', async (req, res, next) => {
  try {
    const { quantity, threshold } = req.body;
    const update = {};
    if (quantity !== undefined) {
      if (Number(quantity) < 0 || Number.isNaN(Number(quantity))) {
        return res.status(400).json({ message: 'Quantity must be a non-negative number' });
      }
      update.quantity = Number(quantity);
    }
    if (threshold !== undefined) {
      if (Number(threshold) < 0 || Number.isNaN(Number(threshold))) {
        return res.status(400).json({ message: 'Threshold must be a non-negative number' });
      }
      update.threshold = Number(threshold);
    }

    const item = await Inventory.findByIdAndUpdate(
      req.params.id,
      { $set: { ...update, lastUpdated: new Date() } },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: 'Inventory item not found' });

    // Broadcast to admin dashboard in real time.
    const io = req.app.get('io');
    if (io) io.emit('inventoryUpdate', await Inventory.find().lean());

    res.json({ message: 'Inventory updated', item });
  } catch (err) {
    next(err);
  }
});

// ── GET /stats (dashboard counters) ────────────────────────────────────
router.get('/stats', async (req, res, next) => {
  try {
    const [totalOrders, pendingOrders, deliveredOrders, lowStock] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: { $ne: 'Delivered' } }),
      Order.countDocuments({ status: 'Delivered' }),
      Inventory.countDocuments({ $expr: { $lte: ['$quantity', '$threshold'] } }),
    ]);
    const revenueAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    res.json({
      totalOrders,
      pendingOrders,
      deliveredOrders,
      lowStockItems: lowStock,
      revenue: revenueAgg[0]?.total || 0,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
