/**
 * PizzaCard — single pizza in the menu grid.
 */
import React from 'react';
import { Plus, Star } from 'lucide-react';
import type { MenuPizza } from '../utils/menu';
import { formatINR } from '../utils/format';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export function PizzaCard({ pizza }: { pizza: MenuPizza }) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAdd = () => {
    addItem({ name: pizza.name, unitPrice: pizza.price, image: pizza.image });
    toast({ type: 'success', message: `${pizza.name} added to cart` });
  };

  return (
    <article className="card group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
      <div className="relative h-44 overflow-hidden bg-primary-50">
        <img
          src={pizza.image}
          alt={pizza.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {pizza.tags && pizza.tags.length > 0 && (
          <span className="badge absolute left-3 top-3 bg-white/90 text-primary shadow-sm">
            <Star size={12} /> {pizza.tags[0]}
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-lg font-bold leading-tight">{pizza.name}</h3>
          <span className="shrink-0 font-serif text-lg font-bold text-primary">
            {formatINR(pizza.price)}
          </span>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-charcoal/65">{pizza.description}</p>

        <button
          onClick={handleAdd}
          className="btn-primary mt-4 w-full"
          aria-label={`Add ${pizza.name} to cart`}
        >
          <Plus size={18} /> Add to Cart
        </button>
      </div>
    </article>
  );
}
