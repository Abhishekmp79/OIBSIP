# 🍕 Slice House — Pizza Delivery (MERN Stack)

A complete, production-ready full-stack **pizza delivery** application built with the **MERN stack** + real-time updates, email, scheduled jobs, and Razorpay payments.

> React · Vite · TypeScript · Tailwind CSS · Socket.IO · Node · Express · MongoDB · Mongoose · JWT · Bcrypt · Nodemailer · node-cron · Razorpay

---

## ✨ Features

### 👤 User Side
| # | Feature |
|---|---------|
| 1 | **Registration + Email Verification** — fullName/email/phone/password, password ≥ 8 chars, JWT issued, verification email via Nodemailer, `/verify/:token` route. |
| 2 | **JWT Login** — bcrypt compare, 7-day JWT (`{ id, role, email }`), token in `localStorage`, protected routes. |
| 3 | **Forgot Password** — 1-hour reset token, secure email link, anti-enumeration (always returns success). |
| 4 | **Pizza Dashboard** — 5 varieties with images, descriptions, prices, hover effects, Add-to-Cart. |
| 5 | **Custom Pizza Builder** — 4 steps (Base → Sauce → Cheese → Vegetables), live price, progress indicator, summary. |
| 6 | **Order Summary** — cart, subtotal, ₹50 delivery, grand total, saved address picker, delivery notes. |
| 7 | **Razorpay Checkout (Test Mode)** — server-side order creation (paise), signature verification via `crypto.createHmac`, order saved only after verification, auto inventory deduction. |
| 8 | **Real-time Order Tracking** — visual stepper (Received → Kitchen → Delivery → Delivered), Socket.IO push. |

### 🛠️ Admin Side (`/admin`)
| # | Feature |
|---|---------|
| 9 | **Separate Admin Login** — `/admin/login`, role-checked JWT, no public "register as admin". |
| 10 | **Inventory Dashboard** — bases/sauces/cheeses/vegetables, qty/threshold/unit/status, low-stock visuals. |
| 11 | **Auto Stock Decrement** — on verified order: −1 base/sauce/cheese per pizza, −(veg × qty). |
| 12 | **Manual Stock Update** — inline edit with non-negative validation + toast. |
| 13 | **Low-Stock Email (cron)** — every 15 min, emails admin a low-stock table. |
| 14 | **Order Management** — search by id/name, filter by status, status dropdown, details popup (3-dot menu). |
| 15 | **Real-time Status** — admin update emits `orderUpdate`; user dashboard + toast update instantly. |

---

## 📁 Project Structure

```
slice-house/
├── server/                     # Backend (Express + MongoDB + Socket.IO)
│   ├── middleware/
│   │   └── auth.js            # protect + adminOnly JWT middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Order.js
│   │   └── Inventory.js
│   ├── routes/
│   │   ├── auth.js            # register, verify, login, me, forgot/reset password, addresses
│   │   ├── orders.js          # razorpay create-order/verify, list, detail
│   │   ├── inventory.js       # public read + low-stock
│   │   └── admin.js           # admin login, orders, inventory, stats
│   ├── utils/
│   │   ├── cronJobs.js        # 15-min low-stock monitor
│   │   ├── seedInventory.js   # seed stock + default admin
│   │   ├── inventoryHelper.js # stock deduction logic
│   │   └── mailer.js          # Nodemailer transport
│   ├── .env.example
│   ├── index.js
│   └── package.json
├── src/                        # Frontend (React + Vite + TS + Tailwind)
│   ├── api.js                 # fetch wrapper for REST API
│   ├── socket.js              # Socket.IO client
│   ├── App.tsx                # router + layout
│   ├── main.tsx               # entry + providers
│   ├── index.css              # Tailwind + theme
│   ├── vite-env.d.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── menu.ts            # pizzas + builder options
│   │   ├── validation.ts
│   │   └── format.ts
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   ├── CartContext.tsx
│   │   └── ToastContext.tsx
│   ├── components/
│   │   ├── Navbar.tsx  Footer.tsx  CartDrawer.tsx
│   │   ├── PizzaCard.tsx  OrderStepper.tsx
│   │   ├── ProtectedRoute.tsx  ErrorBoundary.tsx  Spinner.tsx
│   └── pages/
│       ├── Home.tsx  Menu.tsx  Builder.tsx
│       ├── Register.tsx  Login.tsx  VerifyEmail.tsx
│       ├── ForgotPassword.tsx  ResetPassword.tsx
│       ├── Dashboard.tsx  Orders.tsx  Checkout.tsx
│       └── admin/
│           ├── AdminLogin.tsx  AdminLayout.tsx
│           ├── AdminDashboard.tsx  AdminInventory.tsx  AdminOrders.tsx
├── public/
│   └── pizza.svg
├── .env / .env.example
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json / tsconfig.node.json
└── README.md
```

---

## 🚀 Setup Instructions

### 1. Prerequisites
- **Node.js** ≥ 18
- **MongoDB** — local (`mongodb://127.0.0.1:27017`) or **MongoDB Atlas** (free cluster)

### 2. Clone & install
```bash
git clone <your-repo-url> slice-house
cd slice-house

# Frontend dependencies (root)
npm install

# Backend dependencies
cd server
npm install
```

### 3. Configure environment variables
Create **`server/.env`** (copy from `server/.env.example`):

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# MongoDB
MONGO_URI=mongodb://127.0.0.1:27017/slice_house
# Atlas template:
# MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/slice_house?retryWrites=true&w=majority

# JWT
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d

# Razorpay (Test Mode) — https://dashboard.razorpay.com/app/keys
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# SMTP (Gmail App Password) — https://myaccount.google.com/apppasswords
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your.email@gmail.com
SMTP_PASS=your_16_char_app_password

# Default admin (created by seed)
ADMIN_EMAIL=admin@slicehouse.com
ADMIN_PASSWORD=Admin@12345
ADMIN_NAME=Slice House Admin
ALERT_RECIPIENT=admin@slicehouse.com
MAIL_FROM="Slice House" <no-reply@slicehouse.com>
```

### 4. Seed the database
```bash
cd server
npm run seed
```
This inserts the inventory rows (bases, sauces, cheeses, vegetables) and creates the **default admin account**.

### 5. Run the app
```bash
# Terminal 1 — backend (from /server)
npm run dev          # or: node index.js

# Terminal 2 — frontend (from project root)
npm run dev
```

Open **http://localhost:5173** 🎉

> The Vite dev server proxies `/api` and `/socket.io` to the backend on `:5000`, so both run on a single origin in development.

---

## 🔐 Demo Admin Credentials

```
URL:      http://localhost:5173/admin/login
Email:    admin@slicehouse.com
Password: Admin@12345
```
(Override these via `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `server/.env` before running `npm run seed`.)

---

## 💳 Razorpay Test Mode

The app runs against Razorpay **test mode**. Use these test cards at checkout:

| Card Number | Expiry | CVV | Result |
|---|---|---|---|
| `4111 4111 4111 4111` | Any future date | Any | ✅ Success |

**Flow:** Frontend → `POST /api/orders/razorpay/create-order` → open Razorpay modal → handler → `POST /api/orders/razorpay/verify` (HMAC signature check) → order saved + stock deducted.

---

## 📧 Email (Gmail SMTP)

Emails use a **Gmail App Password** (not your normal password):
1. Enable 2-Step Verification on your Google account.
2. Visit **https://myaccount.google.com/apppasswords** and create an app password.
3. Put it in `SMTP_PASS`.

If SMTP isn't configured, the app still runs — emails are simply skipped (errors are logged, not thrown).

---

## ⏰ Cron Job — Low-Stock Alerts

`server/utils/cronJobs.js` runs **every 15 minutes** (`*/15 * * * *`). It queries inventory where `quantity ≤ threshold` and, if any exist, emails the admin an HTML table. Safe to leave running — only sends when there's something to report.

---

## 🎨 Design System

| Token | Value |
|---|---|
| Primary (orange) | `#dd5b2e` |
| Secondary (sage) | `#557267` |
| Cream background | `#fdf8f3` |
| Charcoal text | `#2b2522` |
| Headings | Georgia (serif) |
| Body | Inter (sans) |

Fully responsive (mobile-first), with toast notifications, loading skeletons/spinners, error boundaries, and ARIA labels throughout.

---

## 🧱 Tech Stack

**Frontend:** React 18 · Vite · TypeScript · Tailwind CSS · Lucide React · Socket.IO Client · React Router

**Backend:** Node.js · Express · MongoDB · Mongoose · Socket.IO · JWT · Bcrypt · Nodemailer · node-cron · Razorpay · Helmet · CORS

---

## 📜 License

MIT — free to use and adapt. Built with 🍕 in Bengaluru.
