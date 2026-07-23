/**
 * AdminOrders — order management panel.
 *
 *  - Search by order id / customer name
 *  - Filter by status
 *  - Update order status (emits real-time 'orderUpdate')
 *  - 3-dot menu → details popup with items, destination, total, pizza details
 */
import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  ClipboardList,
  MoreVertical,
  X,
  RotateCw,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../api';
import { socket } from '../../socket';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components/Spinner';
import { OrderStepper } from '../../components/OrderStepper';
import { formatINR, formatDateTime, timeAgo } from '../../utils/format';
import { ORDER_STATUSES, type Order, type OrderStatus } from '../../types';

const FILTERS: ('All' | OrderStatus)[] = ['All', ...ORDER_STATUSES];

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'All' | OrderStatus>('All');
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const { toast } = useToast();

  const load = async () => {
    try {
      const params: any = {};
      if (query) params.q = query;
      if (filter !== 'All') params.status = filter;
      const data = await api.adminOrders(params);
      setOrders(data.orders);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 250); // debounce search
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, filter]);

  useEffect(() => {
    socket.on('orderUpdate', load);
    return () => {
      socket.off('orderUpdate', load);
    };
  }, []);

  const advance = async (order: Order) => {
    const idx = ORDER_STATUSES.indexOf(order.status);
    if (idx === ORDER_STATUSES.length - 1) return;
    const next = ORDER_STATUSES[idx + 1];
    await updateStatus(order, next);
  };

  const updateStatus = async (order: Order, status: OrderStatus) => {
    try {
      await api.adminUpdateStatus(order._id, status);
      toast({ type: 'success', message: `Order moved to "${status}"` });
      setOpenMenuId(null);
      load();
      if (detailOrder?._id === order._id) {
        setDetailOrder({ ...order, status });
      }
    } catch (err: any) {
      toast({ type: 'error', message: err.message || 'Update failed' });
    }
  };

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: orders.length };
    for (const s of ORDER_STATUSES) map[s] = 0;
    for (const o of orders) map[o.status] = (map[o.status] || 0) + 1;
    return map;
  }, [orders]);

  return (
    <div>
      <div className="flex items-center gap-2">
        <ClipboardList size={24} className="text-primary" />
        <div>
          <h1 className="font-serif text-2xl font-bold">Orders</h1>
          <p className="text-sm text-charcoal/60">Manage and track all incoming orders.</p>
        </div>
      </div>

      {/* Search + filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
          <input
            className="input pl-10"
            placeholder="Search order id or customer…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search orders"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                filter === f ? 'bg-primary text-white' : 'bg-white text-charcoal/60 hover:bg-charcoal/5'
              }`}
            >
              {f} {counts[f] !== undefined && `(${counts[f]})`}
            </button>
          ))}
        </div>
      </div>

      {/* Orders table */}
      <div className="card mt-4 overflow-hidden">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner label="Loading orders…" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-charcoal/50">
            <ClipboardList size={40} />
            <p>No orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-cream text-xs uppercase tracking-wide text-charcoal/60">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/10">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-cream/50">
                    <td className="px-4 py-3">
                      <p className="font-semibold">#{String(o._id).slice(-6).toUpperCase()}</p>
                      <p className="text-xs text-charcoal/40">{timeAgo(o.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{o.customerName}</p>
                      <p className="text-xs text-charcoal/40">{o.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-charcoal/70">
                      {o.items.reduce((n, i) => n + i.quantity, 0)}
                    </td>
                    <td className="px-4 py-3 font-semibold">{formatINR(o.total)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {o.status !== 'Delivered' && (
                          <button
                            onClick={() => advance(o)}
                            className="btn-primary px-3 py-1.5 text-xs"
                            title="Advance to next status"
                          >
                            <RotateCw size={13} /> Advance
                          </button>
                        )}
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenuId((id) => (id === o._id ? null : o._id))}
                            className="rounded-lg p-1.5 hover:bg-charcoal/5"
                            aria-label="More actions"
                          >
                            <MoreVertical size={18} />
                          </button>
                          {openMenuId === o._id && (
                            <div className="absolute right-0 top-full z-10 mt-1 w-44 overflow-hidden rounded-lg border border-charcoal/10 bg-white py-1 shadow-card">
                              <button
                                onClick={() => {
                                  setDetailOrder(o);
                                  setOpenMenuId(null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-charcoal/5"
                              >
                                <ClipboardList size={15} /> View details
                              </button>
                              <div className="my-1 border-t border-charcoal/10" />
                              <p className="px-3 py-1 text-xs font-semibold text-charcoal/40">Set status</p>
                              {ORDER_STATUSES.map((s) => (
                                <button
                                  key={s}
                                  onClick={() => updateStatus(o, s)}
                                  disabled={s === o.status}
                                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-charcoal/5 disabled:opacity-40"
                                >
                                  {s === o.status && <CheckCircle2 size={14} className="text-sage" />}
                                  {s}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details modal */}
      {detailOrder && (
        <OrderDetailModal
          order={detailOrder}
          onClose={() => setDetailOrder(null)}
          onUpdateStatus={(s) => updateStatus(detailOrder, s)}
        />
      )}

      {/* Click-away for the 3-dot menu */}
      {openMenuId && (
        <div className="fixed inset-0 z-0" onClick={() => setOpenMenuId(null)} aria-hidden="true" />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, string> = {
    'Order Received': 'bg-amber-100 text-amber-700',
    'In Kitchen': 'bg-blue-100 text-blue-700',
    'Sent to Delivery': 'bg-purple-100 text-purple-700',
    Delivered: 'bg-sage/15 text-sage',
  };
  return <span className={`badge ${map[status]}`}>{status}</span>;
}

function OrderDetailModal({
  order,
  onClose,
  onUpdateStatus,
}: {
  order: Order;
  onClose: () => void;
  onUpdateStatus: (s: OrderStatus) => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-charcoal/50 p-4 backdrop-blur-sm">
      <div className="card animate-pop max-h-[90vh] w-full max-w-lg overflow-y-auto p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold">
              Order #{String(order._id).slice(-6).toUpperCase()}
            </h2>
            <p className="text-sm text-charcoal/60">{formatDateTime(order.createdAt)}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1.5 hover:bg-charcoal/5">
            <X size={20} />
          </button>
        </div>

        {/* Customer + delivery */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-cream p-3">
            <p className="text-xs font-semibold uppercase text-charcoal/50">Customer</p>
            <p className="font-medium">{order.customerName}</p>
            <p className="text-sm text-charcoal/60">{order.customerEmail}</p>
          </div>
          <div className="rounded-xl bg-cream p-3">
            <p className="text-xs font-semibold uppercase text-charcoal/50">Delivery</p>
            <p className="font-medium">{order.address?.line || '—'}</p>
            <p className="text-sm text-charcoal/60">
              {order.address?.city} {order.address?.pincode}
            </p>
          </div>
        </div>

        {order.notes && (
          <div className="mt-3 rounded-xl bg-cream p-3">
            <p className="text-xs font-semibold uppercase text-charcoal/50">Notes</p>
            <p className="text-sm">{order.notes}</p>
          </div>
        )}

        {/* Status stepper */}
        <div className="mt-5">
          <p className="mb-3 text-xs font-semibold uppercase text-charcoal/50">Status</p>
          <OrderStepper status={order.status} />
        </div>

        {/* Items */}
        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase text-charcoal/50">Items</p>
          <ul className="divide-y divide-charcoal/10">
            {order.items.map((it, i) => (
              <li key={i} className="py-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {it.quantity}× {it.name}
                  </span>
                  <span className="font-semibold">{formatINR(it.unitPrice * it.quantity)}</span>
                </div>
                {it.custom && (
                  <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-charcoal/55">
                    <span>Base: {it.custom.base}</span>
                    <span>Sauce: {it.custom.sauce}</span>
                    <span>Cheese: {it.custom.cheese}</span>
                    <span>
                      Veg: {it.custom.vegetables.length ? it.custom.vegetables.join(', ') : 'none'}
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Totals */}
        <div className="mt-3 space-y-1 border-t border-charcoal/10 pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-charcoal/60">Subtotal</span>
            <span>{formatINR(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-charcoal/60">Delivery fee</span>
            <span>{formatINR(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between font-serif text-lg font-bold text-primary">
            <span>Total</span>
            <span>{formatINR(order.total)}</span>
          </div>
        </div>

        {/* Status changer */}
        <div className="mt-5">
          <label className="label">Update status</label>
          <div className="flex gap-2">
            <select
              value={order.status}
              onChange={(e) => onUpdateStatus(e.target.value as OrderStatus)}
              className="input flex-1"
              aria-label="Update order status"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
