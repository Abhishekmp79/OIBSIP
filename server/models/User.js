/**
 * User model
 *
 * Stores both regular customers and admins.
 * Passwords are hashed with bcrypt via pre-save hook.
 * Supports email verification + password reset flows.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    // Email verification
    verified: { type: Boolean, default: false },
    verificationToken: { type: String, default: null },

    // Password reset
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },

    // Saved delivery addresses
    addresses: [
      {
        label: { type: String, default: 'Home' },
        line: { type: String, required: true },
        city: { type: String, required: true },
        pincode: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

// Hash password before saving whenever it changes.
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Instance helper to compare a plaintext password.
userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
