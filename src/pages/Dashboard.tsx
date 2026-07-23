/**
 * Dashboard — user home showing pizza varieties + live order tracking.
 *
 * Combines a quick "order again" menu grid with a real-time tracker for the
 * user's most recent order. Listens to the 'orderUpdate' socket event so the
 * stepper advances without a page refresh.
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { PizzaCard } from '../components/PizzaCard';
import { OrderStepper } from '../components/OrderStepper';
import { PIZZAS } from '../utils/menu';
import { api } from '../api';
import { socket } from '../socket';
import { useAuth } from '../context/AuthContext';
import { formatINR, formatDateTime } from '../utils/format';
import type { Order } from '../types';

export function Dashboard() {
  const { user } = useAuth();
  const [recent, setRecent] = useState<Order | null>(null);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);

  const loadOrders = async () => {
    try {
      const data = await api.myOrders();
      const active = data.orders.filter((o: Order) => o.status !== 'Delivered');
      setActiveOrders(active);
      setRecent(data.orders[0] || null);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Real-time updates: refresh active orders whenever a status changes.
  useEffect(() => {
    const handler = () => loadOrders();
    socket.on('orderUpdate', handler);
    return () => {
      socket.off('orderUpdate', handler);
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="rounded-2xl bg-gradient-to-r from-primary to-primary-600 p-6 text-white shadow-card sm:p-8">
        <h1 className="font-serif text-3xl font-bold">Welcome back, {user?.fullName.split(' ')[0]} 👋</h1>
        <p className="mt-1 text-white/85">Hungry? Your next favourite pizza is just a click away.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/menu" className="btn bg-white text-primary hover:bg-white/90">
            Order now <ArrowRight size={18} />
          </Link>
          <Link to="/builder" className="btn bg-white/15 text-white hover:bg-white/25">
            <Sparkles size={18} /> Build your own
          </Link>
        </div>
      </div>

      {/* Active order tracking */}
      {activeOrders.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 flex items-center gap-2 font-serif text-xl font-bold">
            <Clock size={20} className="text-primary" /> Track your order
          </h2>
          <div className="space-y-4">
            {activeOrders.map((order) => (
              <article key={order._id} className="card animate-fade-in p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-charcoal/50">Order #{String(order._id).slice(-6).toUpperCase()}</p>
                    <p className="font-semibold">{formatDateTime(order.createdAt)}</p>
                  </div>
                  <span className="badge bg-primary-50 text-primary">{order.status}</span>
                </div>
                <div className="mt-6 px-2">
                  <OrderStepper status={order.status} />
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-charcoal/10 pt-3 text-sm">
                  <span className="text-charcoal/60">
                    {order.items.reduce((n, i) => n + i.quantity, 0)} item(s) · {formatINR(order.total)}
                  </span>
                  <Link to="/orders" className="font-semibold text-primary hover:underline">
                    View details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Menu grid */}
      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-serif text-xl font-bold">
            <Package size={20} className="text-primary" /> Order again
          </h2>
          <Link to="/menu" className="text-sm font-semibold text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PIZZAS.slice(0, 3).map((p) => (
            <PizzaCard key={p.id} pizza={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
