/**
 * Footer — simple branded footer with quick links + admin shortcut.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Pizza as PizzaIcon, Phone, Mail, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-charcoal/10 bg-charcoal text-cream">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white">
              <PizzaIcon size={20} />
            </span>
            <span className="font-serif text-xl font-bold">Slice House</span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-cream/70">
            Wood-fired artisan pizzas made with slow-fermented dough, San Marzano tomatoes, and the
            freshest toppings. Delivered hot to your door.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-cream/60">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/menu" className="hover:text-primary">Menu</Link>
            </li>
            <li>
              <Link to="/builder" className="hover:text-primary">Build Your Own</Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-primary">Dashboard</Link>
            </li>
            <li>
              <Link to="/admin/login" className="hover:text-primary">Admin Login</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-cream/60">Contact</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            <li className="flex items-center gap-2">
              <Phone size={14} /> +91 90000 12345
            </li>
            <li className="flex items-center gap-2">
              <Mail size={14} /> hello@slicehouse.com
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={14} /> Bengaluru, India
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10 py-4 text-center text-xs text-cream/50">
        © {new Date().getFullYear()} Slice House · Crafted with 🍕 in Bengaluru
      </div>
    </footer>
  );
}
