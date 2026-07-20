// src/components/ui/slider.tsx

'use client';

interface SliderProps {
  value: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Render as a static progress bar — no thumb, not interactive. */
  readOnly?: boolean;
  /** Optional label shown at the top-left. */
  label?: string;
  /** Whether to show the current value at the top-right. Defaults to true. */
  showValue?: boolean;
  /** Format the displayed value (e.g. add a unit). */
  formatValue?: (value: number) => string;
  /** Caption shown at the bottom-left. */
  minLabel?: string;
  /** Caption shown at the bottom-right. */
  maxLabel?: string;
  className?: string;
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  readOnly = false,
  label,
  showValue = true,
  formatValue,
  minLabel,
  maxLabel,
  className,
}: SliderProps) {
  const fillPercent =
    max === min ? 0 : Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between text-sm">
          {label ? (
            <span className="font-medium text-zinc-600">{label}</span>
          ) : (
            <span />
          )}
          {showValue && (
            <span className="inline-flex items-center rounded-md bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
              {formatValue ? formatValue(value) : value}
            </span>
          )}
        </div>
      )}

      {readOnly ? (
        <div
          className="slider-green-track"
          role="progressbar"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-label={label}
        >
          <div
            className="slider-green-fill transition-all duration-500"
            style={{ width: `${fillPercent}%` }}
          />
        </div>
      ) : (
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange?.(Number(e.target.value))}
          className="slider-green w-full"
        />
      )}

      {(minLabel || maxLabel) && (
        <div className="mt-1 flex justify-between text-xs text-zinc-400">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );
}
