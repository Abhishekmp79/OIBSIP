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
                src="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Cdefs%3E%3CradialGradient id='g' cx='50%25' cy='45%25' r='60%25'%3E%3Cstop offset='0%25' stop-color='%23fbe2d4'/%3E%3Cstop offset='60%25' stop-color='%23e87a4f'/%3E%3Cstop offset='100%25' stop-color='%23a73618'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='400' height='400' fill='transparent'/%3E%3Ccircle cx='200' cy='200' r='170' fill='url(%23g)'/%3E%3Ccircle cx='200' cy='200' r='170' fill='none' stroke='%23872e18' stroke-width='10'/%3E%3Ccircle cx='150' cy='160' r='20' fill='%23fdf8f3'/%3E%3Ccircle cx='250' cy='170' r='18' fill='%23fdf8f3'/%3E%3Ccircle cx='170' cy='250' r='18' fill='%23fdf8f3'/%3E%3Ccircle cx='245' cy='245' r='20' fill='%23fdf8f3'/%3E%3Ccircle cx='205' cy='200' r='13' fill='%23fdf8f3'/%3E%3Ccircle cx='145' cy='205' r='10' fill='%23557267'/%3E%3Ccircle cx='260' cy='215' r='10' fill='%23557267'/%3E%3Ccircle cx='210' cy='150' r='9' fill='%23557267'/%3E%3C/svg%3E"
                alt="Delicious pizza"
                className="relative w-80 drop-shadow-2xl"
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
