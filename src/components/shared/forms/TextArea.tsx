import { forwardRef, TextareaHTMLAttributes } from 'react';
import { cn } from '@lib/utils';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className, id, rows = 4, ...props }, ref) => {
    const textareaId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1">
        <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
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

TextArea.displayName = 'TextArea';
