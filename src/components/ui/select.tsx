// src/components/ui/select.tsx

import { clsx } from 'clsx';
import type { SelectHTMLAttributes } from 'react';

type SelectVariant = 'default' | 'ghost';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  variant?: SelectVariant;
}

const variantClasses: Record<SelectVariant, string> = {
  default:
    'select-caret rounded-lg border border-zinc-200 bg-white py-1.5 pl-3 text-sm text-zinc-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500',
  ghost:
    'select-caret-sm rounded border-0 bg-transparent py-0 pl-1 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-0',
};

export function Select({
  className,
  variant = 'default',
  children,
  ...props
}: SelectProps) {
  return (
    <select
      className={clsx('cursor-pointer', variantClasses[variant], className)}
      {...props}
    >
      {children}
    </select>
  );
}
