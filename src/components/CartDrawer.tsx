/**
 * CartDrawer — slide-in panel showing cart contents.
 *
 * Lets the user adjust quantities, remove items, and proceed to checkout.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatINR } from '../utils/format';

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, updateQty, removeItem, subtotal, count } = useCart();

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-[min(92vw,420px)] flex-col bg-cream shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-charcoal/10 px-5 py-4">
          <h2 className="flex items-center gap-2 font-serif text-lg font-bold">
            <ShoppingBag size={20} /> Your Cart ({count})
          </h2>
          <button onClick={onClose} aria-label="Close cart" className="rounded-full p-1.5 hover:bg-charcoal/5">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-charcoal/60">
              <div className="text-5xl">🍕</div>
              <p>Your cart is empty.</p>
              <button onClick={onClose} className="btn-primary mt-2">
                Browse the menu
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.uid} className="card flex gap-3 p-3">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-16 w-16 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-2xl">
                      🍕
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{item.name}</p>
                    {item.custom && (
                      <p className="truncate text-xs text-charcoal/50">
                        {item.custom.base} · {item.custom.sauce} · {item.custom.cheese}
                        {item.custom.vegetables.length > 0
                          ? ` · +${item.custom.vegetables.length} veg`
                          : ''}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-primary">{formatINR(item.unitPrice)}</p>

                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex items-center rounded-lg border border-charcoal/15">
                        <button
                          onClick={() => updateQty(item.uid, -1)}
                          aria-label="Decrease quantity"
                          className="p-1.5 hover:text-primary"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.uid, 1)}
                          aria-label="Increase quantity"
                          className="p-1.5 hover:text-primary"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.uid)}
                        aria-label="Remove item"
                        className="ml-auto rounded-lg p-1.5 text-charcoal/40 hover:bg-primary/10 hover:text-primary"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-charcoal/10 px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-charcoal/70">Subtotal</span>
              <span className="font-serif text-xl font-bold">{formatINR(subtotal)}</span>
            </div>
            <Link to="/checkout" onClick={onClose} className="btn-primary w-full">
              Checkout <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
