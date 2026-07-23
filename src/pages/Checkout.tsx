/**
 * Checkout — order summary + delivery details + Razorpay payment.
 *
 * Flow:
 *  1. Show cart items, subtotal, ₹50 delivery fee, grand total.
 *  2. Pick / add a delivery address + optional notes.
 *  3. "Proceed to Payment" → backend creates a Razorpay order → open the
 *     Razorpay checkout modal → on success verify signature on the backend →
 *     order saved + inventory decremented → redirect to dashboard.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, MapPin, StickyNote, CreditCard, ShieldCheck } from 'lucide-react';
import { api } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/format';
import { isValidPincode } from '../utils/validation';

const DELIVERY_FEE = 50;

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clear } = useCart();
  const { user, refresh } = useAuth();
  const { toast } = useToast();

  const [selectedAddr, setSelectedAddr] = useState(0);
  const [notes, setNotes] = useState('');
  const [paying, setPaying] = useState(false);

  // "Add address" inline form state
  const [adding, setAdding] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: 'Home', line: '', city: '', pincode: '' });

  useEffect(() => {
    // If no addresses yet, open the add-address form.
    if (user && (user.addresses?.length || 0) === 0) setAdding(true);
  }, [user]);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="text-5xl">🛒</div>
        <h1 className="mt-4 font-serif text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-charcoal/60">Add some pizzas before checking out.</p>
        <Link to="/menu" className="btn-primary mt-6">
          Browse menu
        </Link>
      </div>
    );
  }

  const total = subtotal + DELIVERY_FEE;

  const saveAddress = async () => {
    if (!newAddr.line || !newAddr.city || !isValidPincode(newAddr.pincode)) {
      toast({ type: 'error', message: 'Enter a valid address and 6-digit pincode' });
      return;
    }
    try {
      await api.addAddress(newAddr);
      await refresh();
      toast({ type: 'success', message: 'Address saved' });
      setAdding(false);
      setNewAddr({ label: 'Home', line: '', city: '', pincode: '' });
    } catch (err: any) {
      toast({ type: 'error', message: err.message || 'Could not save address' });
    }
  };

  const handlePay = async () => {
    const addr = user?.addresses?.[selectedAddr];
    if (!addr) {
      toast({ type: 'error', message: 'Please add a delivery address' });
      return;
    }

    setPaying(true);
    try {
      // 1. Create Razorpay order on the backend.
      const payload = {
        items: items.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          image: i.image,
          custom: i.custom,
        })),
        address: addr,
        notes,
      };
      const { key, orderId, amount, currency } = await api.createRazorpayOrder(payload);

      // 2. Open Razorpay checkout modal (test mode).
      const rzp = new window.Razorpay({
        key,
        amount,
        currency,
        name: 'Slice House',
        description: 'Pizza order',
        order_id: orderId,
        // Prefill customer details.
        prefill: { name: user?.fullName, email: user?.email },
        theme: { color: '#dd5b2e' },
        handler: async (response: any) => {
          // 3. Verify signature + save order on backend.
          try {
            const verified = await api.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items: payload.items,
              address: addr,
              notes,
              subtotal,
            });
            toast({ type: 'success', message: 'Payment successful! Order placed 🎉' });
            clear();
            navigate('/dashboard');
            void verified;
          } catch (err: any) {
            toast({ type: 'error', message: err.message || 'Payment verification failed' });
          }
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
            toast({ type: 'warning', message: 'Payment cancelled' });
          },
        },
      });

      rzp.on('payment.failed', (resp: any) => {
        toast({ type: 'error', message: resp.error?.description || 'Payment failed' });
        setPaying(false);
      });

      rzp.open();
    } catch (err: any) {
      toast({ type: 'error', message: err.message || 'Could not start payment' });
      setPaying(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-3xl font-bold">Checkout</h1>

      <div className="mt-6 grid gap-6 md:grid-cols-5">
        {/* Left: items + address */}
        <div className="space-y-6 md:col-span-3">
          {/* Items */}
          <section className="card p-5">
            <h2 className="mb-3 font-serif text-lg font-bold">Order items</h2>
            <ul className="divide-y divide-charcoal/10">
              {items.map((item) => (
                <li key={item.uid} className="flex items-center gap-3 py-3">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50 text-xl">🍕</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.name}</p>
                    {item.custom && (
                      <p className="truncate text-xs text-charcoal/50">
                        {item.custom.base} · {item.custom.sauce} · {item.custom.cheese}
                        {item.custom.vegetables.length ? ` · +${item.custom.vegetables.length} veg` : ''}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-charcoal/60">×{item.quantity}</span>
                  <span className="w-20 text-right font-semibold">{formatINR(item.unitPrice * item.quantity)}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Delivery address */}
          <section className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-serif text-lg font-bold">
                <MapPin size={18} /> Delivery address
              </h2>
              <button onClick={() => setAdding((a) => !a)} className="btn-ghost text-sm">
                <Plus size={16} /> Add new
              </button>
            </div>

            {adding ? (
              <div className="space-y-3 rounded-xl bg-cream p-4">
                <input
                  className="input"
                  placeholder="Label (Home, Work…)"
                  value={newAddr.label}
                  onChange={(e) => setNewAddr((a) => ({ ...a, label: e.target.value }))}
                />
                <input
                  className="input"
                  placeholder="Flat / House no, street, area"
                  value={newAddr.line}
                  onChange={(e) => setNewAddr((a) => ({ ...a, line: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    className="input"
                    placeholder="City"
                    value={newAddr.city}
                    onChange={(e) => setNewAddr((a) => ({ ...a, city: e.target.value }))}
                  />
                  <input
                    className="input"
                    placeholder="Pincode"
                    inputMode="numeric"
                    maxLength={6}
                    value={newAddr.pincode}
                    onChange={(e) => setNewAddr((a) => ({ ...a, pincode: e.target.value.replace(/\D/g, '') }))}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setAdding(false)} className="btn-ghost">
                    Cancel
                  </button>
                  <button onClick={saveAddress} className="btn-primary">
                    Save address
                  </button>
                </div>
              </div>
            ) : user?.addresses && user.addresses.length > 0 ? (
              <div className="space-y-2">
                {user.addresses.map((a, i) => (
                  <label
                    key={i}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 transition ${
                      selectedAddr === i ? 'border-primary bg-primary-50' : 'border-charcoal/10'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddr === i}
                      onChange={() => setSelectedAddr(i)}
                      className="mt-1 accent-primary"
                    />
                    <div>
                      <p className="font-semibold">{a.label || 'Address'}</p>
                      <p className="text-sm text-charcoal/65">
                        {a.line}, {a.city} — {a.pincode}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-charcoal/50">No saved addresses yet.</p>
            )}
          </section>

          {/* Notes */}
          <section className="card p-5">
            <label className="mb-2 flex items-center gap-2 font-serif text-lg font-bold">
              <StickyNote size={18} /> Delivery notes <span className="text-xs font-normal text-charcoal/40">(optional)</span>
            </label>
            <textarea
              className="input min-h-[80px] resize-y"
              placeholder="Ring the bell, leave at door, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={300}
            />
          </section>
        </div>

        {/* Right: summary */}
        <div className="md:col-span-2">
          <div className="card sticky top-24 p-5">
            <h2 className="font-serif text-lg font-bold">Summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-charcoal/65">Subtotal</dt>
                <dd className="font-semibold">{formatINR(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-charcoal/65">Delivery fee</dt>
                <dd className="font-semibold">{formatINR(DELIVERY_FEE)}</dd>
              </div>
              <div className="mt-2 flex justify-between border-t border-charcoal/10 pt-3">
                <dt className="font-serif text-lg font-bold">Total</dt>
                <dd className="font-serif text-xl font-bold text-primary">{formatINR(total)}</dd>
              </div>
            </dl>

            <button onClick={handlePay} disabled={paying} className="btn-primary mt-5 w-full">
              {paying ? 'Processing…' : (
                <>
                  <CreditCard size={18} /> Pay {formatINR(total)}
                </>
              )}
            </button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-charcoal/50">
              <ShieldCheck size={14} /> Secured by Razorpay (Test Mode)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
