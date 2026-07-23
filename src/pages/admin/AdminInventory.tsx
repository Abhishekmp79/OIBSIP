/**
 * AdminInventory — manage stock for bases, sauces, cheeses, vegetables.
 *
 *  - Real-time updates via 'inventoryUpdate' socket event.
 *  - Visual low-stock indicator (quantity ≤ threshold).
 *  - Inline edit of quantity + threshold with validation + save.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Boxes, AlertTriangle, Save, X, Pencil } from 'lucide-react';
import { api } from '../../api';
import { socket } from '../../socket';
import { useToast } from '../../context/ToastContext';
import { Spinner } from '../../components/Spinner';
import { timeAgo } from '../../utils/format';
import type { InventoryItem } from '../../types';

const CATEGORY_LABEL: Record<string, string> = {
  base: 'Pizza Bases',
  sauce: 'Sauces',
  cheese: 'Cheeses',
  vegetable: 'Vegetables',
};

export function AdminInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ quantity: string; threshold: string }>({ quantity: '', threshold: '' });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    try {
      const data = await api.adminInventory();
      setItems(data.items);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    socket.on('inventoryUpdate', load);
    return () => {
      socket.off('inventoryUpdate', load);
    };
  }, []);

  const grouped = useMemo(() => {
    const map: Record<string, InventoryItem[]> = {};
    for (const it of items) {
      (map[it.category] = map[it.category] || []).push(it);
    }
    return map;
  }, [items]);

  const startEdit = (item: InventoryItem) => {
    setEditingId(item._id);
    setDraft({ quantity: String(item.quantity), threshold: String(item.threshold) });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({ quantity: '', threshold: '' });
  };

  const save = async (item: InventoryItem) => {
    const q = Number(draft.quantity);
    const t = Number(draft.threshold);
    if (Number.isNaN(q) || q < 0) {
      toast({ type: 'error', message: 'Quantity must be a non-negative number' });
      return;
    }
    if (Number.isNaN(t) || t < 0) {
      toast({ type: 'error', message: 'Threshold must be a non-negative number' });
      return;
    }
    setSaving(true);
    try {
      await api.adminUpdateInventory(item._id, { quantity: q, threshold: t });
      toast({ type: 'success', message: `${item.name} updated` });
      cancelEdit();
      await load();
    } catch (err: any) {
      toast({ type: 'error', message: err.message || 'Update failed' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size={32} label="Loading inventory…" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <Boxes size={24} className="text-primary" />
        <div>
          <h1 className="font-serif text-2xl font-bold">Inventory</h1>
          <p className="text-sm text-charcoal/60">Manage stock levels for all ingredients.</p>
        </div>
      </div>

      <div className="mt-6 space-y-8">
        {Object.entries(CATEGORY_LABEL).map(([cat, label]) => (
          <section key={cat}>
            <h2 className="mb-3 font-serif text-lg font-bold">{label}</h2>
            <div className="card overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-cream text-xs uppercase tracking-wide text-charcoal/60">
                  <tr>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3 text-center">Quantity</th>
                    <th className="px-4 py-3 text-center">Threshold</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Updated</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal/10">
                  {grouped[cat]?.map((item) => {
                    const low = item.quantity <= item.threshold;
                    const editing = editingId === item._id;
                    return (
                      <tr key={item._id} className={low ? 'bg-primary-50/40' : ''}>
                        <td className="px-4 py-3 font-medium">
                          {item.name}
                          <span className="block text-xs text-charcoal/40">{item.unit}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {editing ? (
                            <input
                              type="number"
                              min={0}
                              className="input mx-auto w-20 px-2 py-1 text-center"
                              value={draft.quantity}
                              onChange={(e) => setDraft((d) => ({ ...d, quantity: e.target.value }))}
                            />
                          ) : (
                            <span className={`font-semibold ${low ? 'text-primary' : ''}`}>
                              {item.quantity}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {editing ? (
                            <input
                              type="number"
                              min={0}
                              className="input mx-auto w-20 px-2 py-1 text-center"
                              value={draft.threshold}
                              onChange={(e) => setDraft((d) => ({ ...d, threshold: e.target.value }))}
                            />
                          ) : (
                            item.threshold
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {low ? (
                            <span className="badge bg-primary/15 text-primary">
                              <AlertTriangle size={12} /> Low
                            </span>
                          ) : (
                            <span className="badge bg-sage/15 text-sage">In stock</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-charcoal/50">
                          {item.lastUpdated ? timeAgo(item.lastUpdated) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            {editing ? (
                              <>
                                <button
                                  onClick={() => save(item)}
                                  disabled={saving}
                                  className="btn-primary px-3 py-1.5 text-xs"
                                >
                                  <Save size={14} /> Save
                                </button>
                                <button onClick={cancelEdit} className="btn-ghost px-2 py-1.5">
                                  <X size={14} />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => startEdit(item)}
                                className="btn-outline px-3 py-1.5 text-xs"
                              >
                                <Pencil size={14} /> Edit
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
