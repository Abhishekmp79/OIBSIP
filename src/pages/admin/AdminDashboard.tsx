/**
 * AdminDashboard — overview counters + recent orders + low-stock summary.
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  IndianRupee,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { api } from '../../api';
import { socket } from '../../socket';
import { formatINR, timeAgo } from '../../utils/format';
import { Spinner } from '../../components/Spinner';
import type { Order } from '../../types';

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  lowStockItems: number;
  revenue: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [s, o] = await Promise.all([api.adminStats(), api.adminOrders()]);
      setStats(s);
      setRecent(o.orders.slice(0, 5));
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    socket.on('orderUpdate', load);
    socket.on('inventoryUpdate', load);
    return () => {
      socket.off('orderUpdate', load);
      socket.off('inventoryUpdate', load);
    };
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size={32} label="Loading dashboard…" />
      </div>
    );
  }

  const cards = [
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'bg-primary' },
    { label: 'In Progress', value: stats.pendingOrders, icon: Clock, color: 'bg-amber-500' },
    { label: 'Delivered', value: stats.deliveredOrders, icon: CheckCircle2, color: 'bg-sage' },
    {
      label: 'Revenue',
      value: formatINR(stats.revenue),
      icon: IndianRupee,
      color: 'bg-charcoal',
    },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold">Dashboard</h1>
      <p className="text-sm text-charcoal/60">Overview of today's operations.</p>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="card p-5">
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg text-white ${c.color}`}>
                <Icon size={20} />
              </span>
              <p className="mt-3 text-2xl font-bold">{c.value}</p>
              <p className="text-sm text-charcoal/60">{c.label}</p>
            </div>
          );
        })}
      </div>

      {/* Low stock alert */}
      {stats.lowStockItems > 0 && (
        <Link
          to="/admin/inventory"
          className="mt-6 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary-50 p-4 transition hover:bg-primary-100"
        >
          <AlertTriangle className="text-primary" size={22} />
          <div className="flex-1">
            <p className="font-semibold text-primary">{stats.lowStockItems} item(s) low on stock</p>
            <p className="text-sm text-charcoal/60">Review and restock before you run out.</p>
          </div>
          <ArrowRight className="text-primary" size={18} />
        </Link>
      )}

      {/* Recent orders */}
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold">Recent orders</h2>
          <Link to="/admin/orders" className="text-sm font-semibold text-primary hover:underline">
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="card p-8 text-center text-charcoal/60">No orders yet.</div>
        ) : (
          <div className="card divide-y divide-charcoal/10">
            {recent.map((o) => (
              <div key={o._id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-semibold">
                    #{String(o._id).slice(-6).toUpperCase()} · {o.customerName}
                  </p>
                  <p className="text-xs text-charcoal/50">{timeAgo(o.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="badge bg-primary-50 text-primary">{o.status}</span>
                  <span className="font-semibold">{formatINR(o.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
