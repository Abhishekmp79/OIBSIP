/**
 * Spinner + loading skeletons.
 */
import React from 'react';

export function Spinner({ size = 24, label }: { size?: number; label?: string }) {
  return (
    <span
      role="status"
      aria-label={label || 'Loading'}
      className="inline-flex items-center gap-2"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className="animate-spin text-primary"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
        <path
          d="M22 12a10 10 0 0 1-10 10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {label && <span className="text-sm text-charcoal/70">{label}</span>}
    </span>
  );
}

export function FullPageSpinner({ label }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center">
      <Spinner size={36} label={label} />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card animate-pulse overflow-hidden">
      <div className="h-40 bg-charcoal/5" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-2/3 rounded bg-charcoal/10" />
        <div className="h-3 w-full rounded bg-charcoal/10" />
        <div className="h-3 w-4/5 rounded bg-charcoal/10" />
        <div className="h-9 w-full rounded bg-charcoal/10" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
