// src/components/ui/spinner.tsx

import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface SpinnerProps {
  /** Icon size in pixels. Defaults to 24. */
  size?: number;
  /** Extra classes. Colour defaults to the app's green theme. */
  className?: string;
}

export function Spinner({ size = 24, className }: SpinnerProps) {
  return (
    <Loader2
      size={size}
      role="status"
      aria-label="Loading"
      className={clsx('animate-spin text-emerald-500', className)}
    />
  );
}
