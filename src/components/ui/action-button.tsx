import * as React from 'react';
import Link from 'next/link';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ActionButtonProps extends ButtonProps {
  icon?: React.ReactNode;
  label: string;
  href?: string;
}

export const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ icon, label, href, className, ...props }, ref) => {
    if (href) {
      return (
        <Button asChild className={cn(className)} {...props}>
          <Link href={href}>
            {icon}
            {label}
          </Link>
        </Button>
      );
    }

    return (
      <Button ref={ref} className={cn(className)} {...props}>
        {icon}
        {label}
      </Button>
    );
  }
);
ActionButton.displayName = 'ActionButton';
