'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DateTimePickerProps {
  date?: Date;
  setDate: (date: Date | undefined) => void;
  label?: string;
  showTime?: boolean;
}

export function DateTimePicker({
  date,
  setDate,
  label,
  showTime = true,
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    date,
  );

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) return;

    const updatedDate = date ? new Date(date) : new Date();
    updatedDate.setFullYear(newDate.getFullYear());
    updatedDate.setMonth(newDate.getMonth());
    updatedDate.setDate(newDate.getDate());

    setSelectedDate(updatedDate);
    setDate(updatedDate);
  };

  const handleTimeChange = (type: 'hour' | 'minute', value: string) => {
    const updatedDate = date ? new Date(date) : new Date();
    const numValue = parseInt(value, 10);

    if (type === 'hour') {
      updatedDate.setHours(numValue);
    } else {
      updatedDate.setMinutes(numValue);
    }

    setSelectedDate(updatedDate);
    setDate(updatedDate);
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider">
          {label}
        </label>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={'outline'}
            className={cn(
              'w-full justify-start text-left font-normal border-emerald-500 bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white',
              !date && 'text-emerald-50',
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? (
              format(date, showTime ? 'PPP HH:mm' : 'PPP')
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-2xl"
          align="start"
        >
          <Calendar mode="single" selected={date} onSelect={handleDateSelect} />
          {showTime && (
            <div className="border-t border-zinc-100 dark:border-zinc-800 p-3 flex items-center justify-between gap-2 bg-white dark:bg-zinc-950 rounded-b-md">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Time
                </span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={
                    date ? date.getHours().toString().padStart(2, '0') : '12'
                  }
                  onChange={(e) => handleTimeChange('hour', e.target.value)}
                  className="w-12 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-1 text-center text-sm dark:text-white focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-zinc-400 dark:text-zinc-600">:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={
                    date ? date.getMinutes().toString().padStart(2, '0') : '00'
                  }
                  onChange={(e) => handleTimeChange('minute', e.target.value)}
                  className="w-12 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-1 text-center text-sm dark:text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
