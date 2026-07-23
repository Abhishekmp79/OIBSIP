/**
 * OrderStepper — visual pipeline of the 4 order statuses.
 *
 * Highlights the current step and dims upcoming steps. Used on both the user
 * dashboard (read-only) and the admin order details popup.
 */
import React from 'react';
import { Check, ClipboardList, ChefHat, Bike, Home } from 'lucide-react';
import { ORDER_STATUSES, type OrderStatus } from '../types';

const ICONS = [ClipboardList, ChefHat, Bike, Home];

export function OrderStepper({
  status,
  size = 'md',
}: {
  status: OrderStatus;
  size?: 'sm' | 'md';
}) {
  const currentIndex = ORDER_STATUSES.indexOf(status);

  return (
    <ol className="flex w-full items-center">
      {ORDER_STATUSES.map((step, i) => {
        const Icon = ICONS[i];
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex;
        const isLast = i === ORDER_STATUSES.length - 1;

        return (
          <React.Fragment key={step}>
            <li className="flex flex-col items-center gap-1.5">
              <div
                className={`flex items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  size === 'sm' ? 'h-8 w-8' : 'h-10 w-10'
                } ${
                  isDone || isCurrent
                    ? 'border-primary bg-primary text-white'
                    : 'border-charcoal/20 bg-white text-charcoal/40'
                }`}
              >
                {isDone ? <Check size={size === 'sm' ? 14 : 18} /> : <Icon size={size === 'sm' ? 14 : 18} />}
              </div>
              <span
                className={`text-center text-[10px] font-medium leading-tight sm:text-xs ${
                  isCurrent ? 'text-primary' : isDone ? 'text-charcoal/70' : 'text-charcoal/40'
                }`}
              >
                {step}
              </span>
            </li>
            {!isLast && (
              <li
                aria-hidden
                className={`mx-1 h-0.5 flex-1 rounded transition-all duration-500 sm:mx-2 ${
                  i < currentIndex ? 'bg-primary' : 'bg-charcoal/15'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </ol>
  );
}
