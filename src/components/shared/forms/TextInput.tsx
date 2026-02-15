import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@lib/utils';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1">
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'block w-full rounded-md border-gray-300 shadow-sm',
            'focus:border-primary-500 focus:ring-primary-500',
            'disabled:bg-gray-100 disabled:text-gray-500',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';
