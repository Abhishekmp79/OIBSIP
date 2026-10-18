/**
 * Home — landing page with hero + feature highlights + CTA.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Clock,
  Leaf,
  ArrowRight,
  Pizza,
  Truck,
  ChefHat,
} from 'lucide-react';

export function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-cream to-sage/10">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div className="animate-fade-in">
            <span className="badge bg-primary/10 text-primary">
              <Flame size={14} /> Wood-fired · Hand-tossed
            </span>
            <h1 className="mt-4 font-serif text-4xl font-bold leading-tight text-charcoal sm:text-5xl lg:text-6xl">
              Pizza that arrives <span className="text-primary">piping hot</span>, every time.
            </h1>
            <p className="mt-4 max-w-md text-lg text-charcoal/70">
              Slow-fermented sourdough, San Marzano tomatoes, and the freshest toppings — built
              your way and delivered in 30 minutes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/menu" className="btn-primary">
                Order now <ArrowRight size={18} />
              </Link>
              <Link to="/builder" className="btn-outline">
                Build your own <Pizza size={18} />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-charcoal/60">
              <span className="flex items-center gap-2">
                <Clock size={16} className="text-primary" /> 30-min delivery
              </span>
              <span className="flex items-center gap-2">
                <Leaf size={16} className="text-sage" /> Fresh ingredients
              </span>
            </div>
          </div>

          {/* Decorative pizza */}
          <div className="relative hidden justify-center md:flex">
            <div className="animate-pop relative">
              <div className="absolute inset-0 -rotate-12 scale-110 rounded-full bg-primary/20 blur-3xl" />
              <img
  src="/hero-pizza.png"
  alt="Delicious pizza"
  className="relative h-80 w-80 rounded-full object-cover drop-shadow-2xl"
/>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          <Feature
            icon={Flame}
            title="Wood-fired Ovens"
            text="Pizzas blistered at 450°C for that signature leopard-spotted crust."
          />
          <Feature
            icon={ChefHat}
            title="Crafted Daily"
            text="Dough fermented for 48 hours and sauces made from scratch every morning."
          />
          <Feature
            icon={Truck}
            title="Fast Delivery"
            text="Hot, insulated bags and real-time order tracking from kitchen to door."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="overflow-hidden rounded-3xl bg-charcoal px-8 py-12 text-center text-cream">
          <h2 className="font-serif text-3xl font-bold">Hungry yet?</h2>
          <p className="mx-auto mt-2 max-w-md text-cream/70">
            Browse our menu or design your dream pizza from scratch.
          </p>
          <Link to="/menu" className="btn-primary mt-6">
            Explore the menu <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <div className="card p-6 transition hover:-translate-y-1 hover:shadow-card">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary">
        <Icon size={24} />
      </span>
      <h3 className="mt-4 font-serif text-xl font-bold">{title}</h3>
      <p className="mt-2 text-charcoal/65">{text}</p>
    </div>
  );
}
