'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'relative space-y-4',
        month_caption:
          'flex justify-center pt-1 items-center text-zinc-900 dark:text-white mb-4 h-7',
        caption_label: 'text-sm font-medium',
        nav: 'flex items-center',
        button_previous: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 absolute left-2 top-[10px] z-20',
        ),
        button_next: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 absolute right-2 top-[10px] z-20',
        ),
        month_grid: 'w-full border-collapse space-y-1',
        weekdays: 'flex',
        weekday:
          'text-zinc-500 dark:text-zinc-400 rounded-md w-9 font-normal text-[0.8rem]',
        week: 'flex w-full mt-2',
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal text-zinc-900 dark:text-white hover:bg-emerald-600/20 hover:text-emerald-600 dark:hover:text-white aria-selected:opacity-100',
        ),
        selected:
          'bg-emerald-600 text-white hover:bg-emerald-600 hover:text-white focus:bg-emerald-600 focus:text-white rounded-md',
        today:
          'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-md',
        outside:
          'day-outside text-zinc-400 dark:text-zinc-600 opacity-50 aria-selected:bg-zinc-100/50 dark:aria-selected:bg-zinc-800/50 aria-selected:text-zinc-400 dark:aria-selected:text-zinc-600 aria-selected:opacity-30',
        disabled: 'text-zinc-400 dark:text-zinc-600 opacity-50',
        range_middle:
          'aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-800 aria-selected:text-zinc-900 dark:aria-selected:text-white',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: (props) => {
          if (props.orientation === 'left') {
            return <ChevronLeft className="h-4 w-4" />;
          }
          return <ChevronRight className="h-4 w-4" />;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
