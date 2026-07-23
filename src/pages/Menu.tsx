/**
 * Menu — grid of predefined pizzas.
 */
import React, { useState } from 'react';
import { Search, Pizza } from 'lucide-react';
import { PizzaCard } from '../components/PizzaCard';
import { PIZZAS } from '../utils/menu';
import { GridSkeleton } from '../components/Spinner';

export function Menu() {
  const [query, setQuery] = useState('');
  const [loading] = useState(false);

  const filtered = PIZZAS.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Our Menu</h1>
          <p className="mt-1 text-charcoal/60">
            Hand-crafted pizzas, fresh from our wood-fired oven.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
          <input
            className="input pl-10"
            placeholder="Search pizzas…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search pizzas"
          />
        </div>
      </div>

      {loading ? (
        <GridSkeleton count={5} />
      ) : filtered.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PizzaCard key={p.id} pizza={p} />
          ))}
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center gap-3 text-charcoal/60">
          <Pizza size={48} />
          <p>No pizzas match "{query}".</p>
        </div>
      )}
    </div>
  );
}
