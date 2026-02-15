import * as SelectPrimitive from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@lib/utils';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function Select({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  className
}: SelectProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <SelectPrimitive.Root value={value} onValueChange={onChange} disabled={disabled}>
        <SelectPrimitive.Trigger
          className={cn(
            'flex items-center justify-between w-full px-3 py-2',
            'border border-gray-300 rounded-md shadow-sm bg-white',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'disabled:bg-gray-100 disabled:text-gray-500'
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content className="bg-white rounded-md shadow-lg border border-gray-200 z-50">
            <SelectPrimitive.Viewport className="p-1">
              {options.map(option => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  className={cn(
                    'flex items-center px-3 py-2 rounded cursor-pointer',
                    'hover:bg-primary-50 focus:bg-primary-50 focus:outline-none',
                    'data-[highlighted]:bg-primary-50'
                  )}
                >
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator className="ml-auto">
                    <Check className="h-4 w-4 text-primary-600" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
}
