/**
 * Slice House — Express + MongoDB + Socket.IO server entry point.
 *
 * Responsibilities:
 *  - Boot Express with security middleware (helmet, cors)
 *  - Connect to MongoDB
 *  - Mount REST routes (/api/auth, /api/orders, /api/inventory, /api/admin)
 *  - Attach Socket.IO for real-time order + inventory updates
 *  - Start the 15-minute low-stock cron job
 */
require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const inventoryRoutes = require('./routes/inventory');
const adminRoutes = require('./routes/admin');
const startCronJobs = require('./utils/cronJobs');

const app = express();
const server = http.createServer(app);

// ── Socket.IO (CORS for Vite dev server) ───────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

// Expose io to route handlers via app locals so they can emit events.
app.set('io', io);

// ── Global middleware ──────────────────────────────────────────────────
app.use(helmet());
// Razorpay webhooks/signatures need raw body verification, but for this app
// signature verification is done client-side in routes; standard JSON is fine.
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// ── Health check ───────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'slice-house-api', time: new Date().toISOString() });
});

// ── REST routes ────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/admin', adminRoutes);

// ── 404 handler ────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ── Centralized error handler ──────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal server error',
  });
});

// ── Socket.IO connection log ───────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('[IO] client connected:', socket.id);
  socket.on('disconnect', () => console.log('[IO] client disconnected:', socket.id));
});

// ── Boot ───────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/slice_house';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('[DB] MongoDB connected');
    server.listen(PORT, () => {
      console.log(`[API] Slice House server running on http://localhost:${PORT}`);
      // Start scheduled jobs once the server is up.
      startCronJobs();
    });
  })
  .catch((err) => {
    console.error('[DB] MongoDB connection error:', err.message);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => {
    mongoose.connection.close(false, () => process.exit(0));
  });
});
