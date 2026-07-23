/**
 * Orders — full history of the user's orders with live status updates.
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { api } from '../api';
import { socket } from '../socket';
import { OrderStepper } from '../components/OrderStepper';
import { FullPageSpinner } from '../components/Spinner';
import { formatINR, formatDateTime } from '../utils/format';
import type { Order } from '../types';

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await api.myOrders();
      setOrders(data.orders);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const handler = () => load();
    socket.on('orderUpdate', handler);
    return () => {
      socket.off('orderUpdate', handler);
    };
  }, []);

  if (loading) return <FullPageSpinner label="Loading your orders…" />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-3xl font-bold">My Orders</h1>
      <p className="mt-1 text-charcoal/60">All your Slice House orders in one place.</p>

      {orders.length === 0 ? (
        <div className="card mt-8 flex flex-col items-center gap-3 p-12 text-center text-charcoal/60">
          <Package size={48} />
          <p className="font-semibold">No orders yet</p>
          <p>Your order history will appear here.</p>
          <Link to="/menu" className="btn-primary mt-2">
            Start an order
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <article key={order._id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-charcoal/50">
                    #{String(order._id).slice(-6).toUpperCase()}
                  </p>
                  <p className="font-semibold">{formatDateTime(order.createdAt)}</p>
                </div>
                <span className="badge bg-primary-50 text-primary">{order.status}</span>
              </div>

              <ul className="mt-4 divide-y divide-charcoal/10 text-sm">
                {order.items.map((it, i) => (
                  <li key={i} className="flex items-center justify-between py-2">
                    <span className="text-charcoal/75">
                      {it.quantity}× {it.name}
                      {it.custom && (
                        <span className="ml-1 text-xs text-charcoal/40">
                          ({it.custom.base}, {it.custom.cheese})
                        </span>
                      )}
                    </span>
                    <span className="font-medium">{formatINR(it.unitPrice * it.quantity)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 border-t border-charcoal/10 pt-4">
                <OrderStepper status={order.status} size="sm" />
              </div>

              <div className="mt-4 flex justify-between text-sm">
                <span className="text-charcoal/60">
                  Delivering to: {order.address?.line || '—'}, {order.address?.city || ''}
                </span>
                <span className="font-serif text-lg font-bold text-primary">{formatINR(order.total)}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
