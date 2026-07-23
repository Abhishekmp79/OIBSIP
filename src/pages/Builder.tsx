/**
 * Builder — 4-step custom pizza builder.
 *
 *  Step 1: Base (5)   Step 2: Sauce (5)   Step 3: Cheese (4)   Step 4: Vegetables (multi)
 *  Shows a progress indicator, live price calculation, a summary review, and an
 *  "Add to cart" action.
 */
import React, { useMemo, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Layers,
  Droplet,
  Milk,
  Carrot,
} from 'lucide-react';
import {
  BUILDER_OPTIONS,
  CUSTOM_BASE_PRICE,
} from '../utils/menu';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/format';

const STEPS = [
  { key: 'base', title: 'Choose Base', icon: Layers },
  { key: 'sauce', title: 'Choose Sauce', icon: Droplet },
  { key: 'cheese', title: 'Choose Cheese', icon: Milk },
  { key: 'vegetable', title: 'Choose Vegetables', icon: Carrot },
] as const;

type StepKey = (typeof STEPS)[number]['key'];

export function Builder() {
  const { addItem } = useCart();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [base, setBase] = useState<string>('');
  const [sauce, setSauce] = useState<string>('');
  const [cheese, setCheese] = useState<string>('');
  const [vegetables, setVegetables] = useState<string[]>([]);

  const selections: Record<StepKey, string | string[]> = {
    base,
    sauce,
    cheese,
    vegetable: vegetables,
  };

  const canAdvance = useMemo(() => {
    const v = selections[STEPS[step].key];
    return Array.isArray(v) ? true : !!v; // vegetables are optional
  }, [step, selections]);

  // Price calc — base price + selected add-ons.
  const unitPrice = useMemo(() => {
    const baseOpt = BUILDER_OPTIONS.base.find((b) => b.name === base);
    const sauceOpt = BUILDER_OPTIONS.sauce.find((b) => b.name === sauce);
    const cheeseOpt = BUILDER_OPTIONS.cheese.find((b) => b.name === cheese);
    const vegPrice = vegetables.reduce(
      (sum, v) => sum + (BUILDER_OPTIONS.vegetable.find((b) => b.name === v)?.price || 0),
      0
    );
    return (
      CUSTOM_BASE_PRICE +
      (baseOpt?.price || 0) +
      (sauceOpt?.price || 0) +
      (cheeseOpt?.price || 0) +
      vegPrice
    );
  }, [base, sauce, cheese, vegetables]);

  const toggleVeg = (name: string) => {
    setVegetables((prev) =>
      prev.includes(name) ? prev.filter((v) => v !== name) : [...prev, name]
    );
  };

  const addToCart = () => {
    if (!base || !sauce || !cheese) {
      toast({ type: 'error', message: 'Please complete all required steps' });
      return;
    }
    addItem({
      name: 'Custom Pizza',
      unitPrice,
      custom: { base, sauce, cheese, vegetables },
    });
    toast({ type: 'success', message: `Custom pizza added · ${formatINR(unitPrice)}` });
    // reset
    setBase(''); setSauce(''); setCheese(''); setVegetables([]);
    setStep(0);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-3xl font-bold">Build Your Own Pizza</h1>
      <p className="mt-1 text-charcoal/60">Craft your perfect slice in four simple steps.</p>

      {/* Progress indicator */}
      <div className="mt-8 flex items-center">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isDone = i < step;
          const isCurrent = i === step;
          return (
            <React.Fragment key={s.key}>
              <button
                onClick={() => i <= step && setStep(i)}
                className="flex flex-col items-center gap-1.5"
                aria-label={`Step ${i + 1}: ${s.title}`}
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${
                    isDone
                      ? 'border-primary bg-primary text-white'
                      : isCurrent
                      ? 'border-primary bg-white text-primary'
                      : 'border-charcoal/20 bg-white text-charcoal/40'
                  }`}
                >
                  {isDone ? <Check size={18} /> : <Icon size={18} />}
                </span>
                <span
                  className={`hidden text-xs sm:block ${
                    isCurrent ? 'font-semibold text-primary' : 'text-charcoal/50'
                  }`}
                >
                  {s.title}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={`mx-2 h-0.5 flex-1 rounded transition ${
                    i < step ? 'bg-primary' : 'bg-charcoal/15'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step content */}
      <div className="card mt-8 p-6">
        <h2 className="font-serif text-xl font-bold">
          Step {step + 1}: {STEPS[step].title}
          {STEPS[step].key === 'vegetable' && (
            <span className="ml-2 text-sm font-normal text-charcoal/50">(optional)</span>
          )}
        </h2>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {STEPS[step].key === 'vegetable'
            ? BUILDER_OPTIONS.vegetable.map((opt) => {
                const selected = vegetables.includes(opt.name);
                return (
                  <button
                    key={opt.name}
                    onClick={() => toggleVeg(opt.name)}
                    className={`flex items-center justify-between rounded-xl border-2 p-4 text-left transition ${
                      selected
                        ? 'border-primary bg-primary-50'
                        : 'border-charcoal/10 bg-white hover:border-primary/40'
                    }`}
                    aria-pressed={selected}
                  >
                    <span className="font-medium">{opt.name}</span>
                    <span className="flex items-center gap-2">
                      {opt.price > 0 && (
                        <span className="text-sm text-charcoal/50">+{formatINR(opt.price)}</span>
                      )}
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-md border-2 ${
                          selected ? 'border-primary bg-primary text-white' : 'border-charcoal/25'
                        }`}
                      >
                        {selected && <Check size={14} />}
                      </span>
                    </span>
                  </button>
                );
              })
            : BUILDER_OPTIONS[STEPS[step].key as 'base' | 'sauce' | 'cheese'].map((opt) => {
                const value = selections[STEPS[step].key] as string;
                const selected = value === opt.name;
                return (
                  <button
                    key={opt.name}
                    onClick={() => {
                      if (STEPS[step].key === 'base') setBase(opt.name);
                      if (STEPS[step].key === 'sauce') setSauce(opt.name);
                      if (STEPS[step].key === 'cheese') setCheese(opt.name);
                    }}
                    className={`flex items-center justify-between rounded-xl border-2 p-4 text-left transition ${
                      selected
                        ? 'border-primary bg-primary-50'
                        : 'border-charcoal/10 bg-white hover:border-primary/40'
                    }`}
                    aria-pressed={selected}
                  >
                    <span className="font-medium">{opt.name}</span>
                    <span className="flex items-center gap-2">
                      {opt.price > 0 && (
                        <span className="text-sm text-charcoal/50">+{formatINR(opt.price)}</span>
                      )}
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                          selected ? 'border-primary bg-primary text-white' : 'border-charcoal/25'
                        }`}
                      >
                        {selected && <Check size={14} />}
                      </span>
                    </span>
                  </button>
                );
              })}
        </div>

        {/* Summary + nav */}
        <div className="mt-6 border-t border-charcoal/10 pt-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm">
            <div className="text-charcoal/60">
              {base && <span className="mr-2">Base: <b>{base}</b></span>}
              {sauce && <span className="mr-2">Sauce: <b>{sauce}</b></span>}
              {cheese && <span>Cheese: <b>{cheese}</b></span>}
              {vegetables.length > 0 && (
                <span className="ml-2">Veg: <b>{vegetables.join(', ')}</b></span>
              )}
            </div>
            <span className="font-serif text-lg font-bold text-primary">
              {formatINR(unitPrice)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="btn-ghost"
            >
              <ChevronLeft size={18} /> Back
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => canAdvance && setStep((s) => s + 1)}
                disabled={!canAdvance}
                className="btn-primary"
              >
                Next <ChevronRight size={18} />
              </button>
            ) : (
              <button onClick={addToCart} className="btn-primary">
                <ShoppingBag size={18} /> Add to cart · {formatINR(unitPrice)}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
