/**
 * Authentication routes.
 *
 * POST   /register          — create user, send verification email
 * GET    /verify/:token     — mark email as verified
 * POST   /login             — authenticate, return JWT
 * GET    /me                — current user profile (protected)
 * POST   /forgot-password   — send reset link (always 200 to prevent enumeration)
 * POST   /reset-password/:t — set new password from reset token
 * POST   /addresses         — add a saved address (protected)
 */

const crypto = require('crypto');

const router = require('express').Router();
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendMail } = require('../utils/mailer');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Basic email shape check.
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// ── POST /register ─────────────────────────────────────────────────────
router.post('/register', async (req, res, next) => {
  try {
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!isEmail(email)) return res.status(400).json({ message: 'Invalid email address' });
    if (String(password).length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    // role forced to 'user' — admins are only created via the seed script.
    const user = await User.create({
      fullName,
      email,
      phone,
      password,
      role: 'user',
      verified: false,
      verificationToken,
    });

    // Fire-and-forget verification email.
    const verifyLink = `${FRONTEND_URL}/verify/${verificationToken}`;
    await sendMail({
      to: user.email,
      subject: 'Verify your Slice House account 🍕',
      html: `
        <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:auto">
          <h2 style="color:#dd5b2e">Welcome to Slice House, ${fullName}!</h2>
          <p>Please confirm your email address to activate your account:</p>
          <p>
            <a href="${verifyLink}" style="background:#dd5b2e;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;display:inline-block">
              Verify Email
            </a>
          </p>
          <p style="color:#888;font-size:13px">Or paste this link into your browser:<br>${verifyLink}</p>
        </div>`,
    });

    // Return a JWT so the user can immediately use the app (verified gates optional).
    const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.status(201).json({
      message: 'Registration successful. Check your inbox to verify your email.',
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role, verified: user.verified },
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /verify/:token ─────────────────────────────────────────────────
router.get('/verify/:token', async (req, res, next) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) return res.status(400).json({ message: 'Invalid or expired verification token' });

    user.verified = true;
    user.verificationToken = null;
    await user.save();

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    next(err);
  }
});

// ── POST /login ────────────────────────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // We need the password field (select:false on the model).
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        verified: user.verified,
        addresses: user.addresses,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /me ────────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        verified: user.verified,
        addresses: user.addresses,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /forgot-password ──────────────────────────────────────────────
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetToken = resetToken;
      user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      const resetLink = `${FRONTEND_URL}/reset-password/${resetToken}`;
      await sendMail({
        to: user.email,
        subject: 'Reset your Slice House password',
        html: `
          <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:auto">
            <h2 style="color:#dd5b2e">Password reset request</h2>
            <p>We received a request to reset the password for your Slice House account.</p>
            <p>
              <a href="${resetLink}" style="background:#dd5b2e;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;display:inline-block">
                Reset Password
              </a>
            </p>
            <p style="color:#888;font-size:13px">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
          </div>`,
      });
    }

    // Always return success — prevents email enumeration.
    res.json({ message: 'If an account exists for that email, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
});

// ── POST /reset-password/:token ────────────────────────────────────────
router.post('/reset-password/:token', async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || String(password).length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

    user.password = password;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (err) {
    next(err);
  }
});

// ── POST /addresses (add a saved delivery address) ─────────────────────
router.post('/addresses', protect, async (req, res, next) => {
  try {
    const { label, line, city, pincode } = req.body;
    if (!line || !city || !pincode) {
      return res.status(400).json({ message: 'Address line, city and pincode are required' });
    }
    const user = await User.findById(req.user.id);
    user.addresses.push({ label: label || 'Home', line, city, pincode });
    await user.save();
    res.json({ message: 'Address added', addresses: user.addresses });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
