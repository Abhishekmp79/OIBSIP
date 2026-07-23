/**
 * Order routes.
 *
 * POST   /razorpay/create-order — create a Razorpay order (test mode)
 * POST   /razorpay/verify       — verify signature + save order + deduct stock
 * GET    /                      — list current user's orders
 * GET    /:id                   — one order by id
 */

const crypto = require('crypto');

const router = require('express').Router();
const Razorpay = require('razorpay');

const Order = require('../models/Order');
const { protect } = require('../middleware/auth');
const { deductInventoryForOrder } = require('../utils/inventoryHelper');

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

function getRazorpay() {
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        const err = new Error('Razorpay keys are not configured');
        err.status = 500;
        throw err;
    }
    return new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
}

const DELIVERY_FEE = 50;

// ── POST /razorpay/create-order ────────────────────────────────────────
router.post('/razorpay/create-order', protect, async(req, res, next) => {
    try {
        const { items, address, notes } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const subtotal = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
        const total = subtotal + DELIVERY_FEE;

        const rzp = getRazorpay();
        const rzpOrder = await rzp.orders.create({
            amount: Math.round(total * 100),
            currency: 'INR',
            receipt: 'sh_' + Date.now(),
            notes: { userId: String(req.user.id) },
        });

        res.json({
            key: RAZORPAY_KEY_ID,
            orderId: rzpOrder.id,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency,
            cart: {
                items: items,
                address: address || {},
                notes: notes || '',
                subtotal: subtotal,
                deliveryFee: DELIVERY_FEE,
                total: total,
            },
        });
    } catch (err) {
        next(err);
    }
});

// ── POST /razorpay/verify ──────────────────────────────────────────────
router.post('/razorpay/verify', protect, async(req, res, next) => {
    try {
        const razorpay_order_id = req.body.razorpay_order_id;
        const razorpay_payment_id = req.body.razorpay_payment_id;
        const razorpay_signature = req.body.razorpay_signature;
        const items = req.body.items;
        const address = req.body.address;
        const notes = req.body.notes;
        const subtotal = req.body.subtotal;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: 'Missing payment details' });
        }

        // Verify signature: HMAC_SHA256(order_id|payment_id, key_secret)
        const expected = crypto
            .createHmac('sha256', RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (expected !== razorpay_signature) {
            return res.status(400).json({ message: 'Payment signature verification failed' });
        }

        const User = require('../models/User');
        const user = await User.findById(req.user.id);

        const customerName = (user && user.fullName) ? user.fullName : req.user.email;
        const customerEmail = (user && user.email) ? user.email : req.user.email;
        const total = subtotal + DELIVERY_FEE;

        // Save the order only after successful verification.
        const order = await Order.create({
            user: req.user.id,
            customerName: customerName,
            customerEmail: customerEmail,
            items: items,
            subtotal: subtotal,
            deliveryFee: DELIVERY_FEE,
            total: total,
            address: address || {},
            notes: notes || '',
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            paymentVerified: true,
            status: 'Order Received',
        });

        // Deduct inventory + emit real-time update.
        const io = req.app.get('io');
        await deductInventoryForOrder(order, io);

        if (io) {
            io.emit('orderUpdate', { orderId: order._id, status: order.status });
        }

        res.status(201).json({ message: 'Payment verified and order placed', order: order });
    } catch (err) {
        next(err);
    }
});

// ── GET /  (current user's orders) ─────────────────────────────────────
router.get('/', protect, async(req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 }).lean();
        res.json({ orders: orders });
    } catch (err) {
        next(err);
    }
});

// ── GET /:id ───────────────────────────────────────────────────────────
router.get('/:id', protect, async(req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).lean();
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (String(order.user) !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not allowed' });
        }
        res.json({ order: order });
    } catch (err) {
        next(err);
    }
});

module.exports = router;