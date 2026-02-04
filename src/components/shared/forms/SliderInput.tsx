import * as Slider from '@radix-ui/react-slider';
import { cn } from '@lib/utils';

interface SliderInputProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  showValue?: boolean;
  className?: string;
}

export function SliderInput({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  disabled = false,
  showValue = true,
  className
}: SliderInputProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {showValue && (
          <span className="text-sm font-semibold text-primary-600">{value}</span>
        )}
      </div>
      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-5"
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
      >
        <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
          <Slider.Range className="absolute bg-primary-600 rounded-full h-full" />
        </Slider.Track>
        <Slider.Thumb
          className="block w-5 h-5 bg-white border-2 border-primary-600 rounded-full hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
          aria-label={label}
        />
      </Slider.Root>
    </div>
  );
}
