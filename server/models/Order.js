/**
 * Order model
 *
 * Captures a customer order: the pizzas purchased (predefined varieties and/or
 * custom-built), delivery details, payment info, and a status the admin advances
 * through the 4-step pipeline (received → kitchen → delivery → delivered).
 */
const mongoose = require('mongoose');

const customPizzaSchema = new mongoose.Schema({
    base: { type: String, required: true },
    sauce: { type: String, required: true },
    cheese: { type: String, required: true },
    vegetables: { type: [String], default: [] },
});

const orderItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    image: { type: String, default: '' },
    custom: { type: customPizzaSchema, default: null },
});

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    items: [orderItemSchema],

    // Pricing (all in INR)
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 50 },
    total: { type: Number, required: true },

    // Delivery
    address: {
        line: { type: String, default: '' },
        city: { type: String, default: '' },
        pincode: { type: String, default: '' },
    },
    notes: { type: String, default: '' },

    // Payment (Razorpay)
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },
    paymentVerified: { type: Boolean, default: false },
    currency: { type: String, default: 'INR' },

    // Pipeline status
    status: {
        type: String,
        enum: ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered'],
        default: 'Order Received',
    },

    // Inventory decrement flag — prevents double-deduction on retries.
    inventoryDeducted: { type: Boolean, default: false },
}, { timestamps: true });

// Auto-increment-friendly readable order id.
orderSchema.virtual('orderCode').get(function() {
    return 'SH' + String(this._id).slice(-6).toUpperCase();
});

module.exports = mongoose.model('Order', orderSchema);