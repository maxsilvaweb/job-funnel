import { DateTimePicker } from './date-time-picker';
import { cn } from '@/lib/utils';

interface DateTimeInputProps {
  type: 'date' | 'time' | 'datetime-local';
  label?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  containerClassName?: string;
}

export function DateTimeInput({
  type,
  label,
  error,
  value,
  onChange,
  containerClassName,
}: DateTimeInputProps) {
  const dateValue = value ? new Date(value) : undefined;

  return (
    <div className={cn('space-y-1.5', containerClassName)}>
      <DateTimePicker
        date={dateValue}
        setDate={(newDate) => {
          if (newDate) {
            onChange(newDate.toISOString());
          } else {
            onChange('');
          }
        }}
        label={label}
        showTime={type !== 'date'}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
