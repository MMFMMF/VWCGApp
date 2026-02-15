---
wave: 2
depends_on:
  - 01-PLAN-project-setup
files_modified:
  - src/components/shared/forms/SliderInput.tsx
  - src/components/shared/forms/TextInput.tsx
  - src/components/shared/forms/TextArea.tsx
  - src/components/shared/forms/Select.tsx
  - src/components/shared/ui/Button.tsx
  - src/components/shared/ui/Card.tsx
  - src/components/shared/ui/Badge.tsx
  - src/components/shared/ui/Modal.tsx
  - src/components/shared/navigation/ToolNavigation.tsx
  - src/components/shared/navigation/ProgressIndicator.tsx
  - src/components/shared/index.ts
autonomous: true
---

# Plan: Shared UI Component Library

## Objective

Build a library of reusable UI components that assessment tools will use consistently. This ensures visual consistency, reduces code duplication, and establishes patterns for tool development. Components are built with Tailwind CSS and follow accessibility best practices.

## Tasks

### Task 1: Install Dependencies

**Action:** Add shadcn/ui and required dependencies
**Files:** package.json
**Details:**

```bash
npm install @radix-ui/react-slider @radix-ui/react-select @radix-ui/react-dialog
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react
```

Note: We're using Radix UI primitives directly (same foundation as shadcn/ui) for maximum control.

### Task 2: Create Utility Functions

**Action:** Add className merge utility
**Files:** src/lib/utils.ts
**Details:**

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Task 3: Create SliderInput Component

**Action:** Build accessible slider for rating inputs (0-100, 0-10 scales)
**Files:** src/components/shared/forms/SliderInput.tsx
**Details:**

```typescript
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
```

### Task 4: Create TextInput Component

**Action:** Build standard text input with label and error states
**Files:** src/components/shared/forms/TextInput.tsx
**Details:**

```typescript
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
```

### Task 5: Create TextArea Component

**Action:** Build textarea for notes and longer text inputs
**Files:** src/components/shared/forms/TextArea.tsx
**Details:**

```typescript
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
```

### Task 6: Create Select Component

**Action:** Build accessible dropdown select using Radix UI
**Files:** src/components/shared/forms/Select.tsx
**Details:**

```typescript
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
```

### Task 7: Create Button Component

**Action:** Build button with variants (primary, secondary, ghost)
**Files:** src/components/shared/ui/Button.tsx
**Details:**

```typescript
import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
        ghost: 'hover:bg-gray-100 text-gray-700 focus:ring-gray-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
```

### Task 8: Create Card Component

**Action:** Build card container for tool sections
**Files:** src/components/shared/ui/Card.tsx
**Details:**

```typescript
import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding = 'md', children, ...props }, ref) => {
    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'bg-white rounded-lg shadow border border-gray-200',
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('border-b border-gray-200 pb-3 mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-lg font-semibold text-gray-900', className)} {...props}>
      {children}
    </h3>
  );
}
```

### Task 9: Create Badge Component

**Action:** Build badge for status indicators and severity levels
**Files:** src/components/shared/ui/Badge.tsx
**Details:**

```typescript
import { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
```

### Task 10: Create Modal Component

**Action:** Build accessible modal dialog using Radix UI
**Files:** src/components/shared/ui/Modal.tsx
**Details:**

```typescript
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@lib/utils';
import { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content
          className={cn(
            'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            'bg-white rounded-lg shadow-xl z-50 w-full max-w-md p-6',
            'focus:outline-none',
            className
          )}
        >
          <Dialog.Title className="text-lg font-semibold text-gray-900">
            {title}
          </Dialog.Title>
          {description && (
            <Dialog.Description className="mt-1 text-sm text-gray-600">
              {description}
            </Dialog.Description>
          )}

          <div className="mt-4">{children}</div>

          <Dialog.Close
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

### Task 11: Create ToolNavigation Component

**Action:** Build sidebar navigation for assessment tools
**Files:** src/components/shared/navigation/ToolNavigation.tsx
**Details:**

```typescript
import { NavLink } from 'react-router-dom';
import { cn } from '@lib/utils';
import { toolRegistry } from '@lib/tools';

export function ToolNavigation() {
  const tools = toolRegistry.getSorted();
  const categories = ['assessment', 'planning', 'sop', 'synthesis'];

  return (
    <nav className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Assessment Tools
        </h2>

        {categories.map(category => {
          const categoryTools = tools.filter(t => t.metadata.category === category);
          if (categoryTools.length === 0) return null;

          return (
            <div key={category} className="mt-4">
              <h3 className="text-xs font-medium text-gray-400 uppercase">
                {category}
              </h3>
              <ul className="mt-2 space-y-1">
                {categoryTools.map(tool => (
                  <li key={tool.metadata.id}>
                    <NavLink
                      to={`/tools/${tool.metadata.id}`}
                      className={({ isActive }) =>
                        cn(
                          'block px-3 py-2 rounded-md text-sm',
                          isActive
                            ? 'bg-primary-50 text-primary-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        )
                      }
                    >
                      {tool.metadata.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
```

### Task 12: Create ProgressIndicator Component

**Action:** Build progress bar showing assessment completion
**Files:** src/components/shared/navigation/ProgressIndicator.tsx
**Details:**

```typescript
import { cn } from '@lib/utils';
import { toolRegistry } from '@lib/tools';
import { useWorkspaceStore } from '@stores/workspaceStore';

export function ProgressIndicator() {
  const tools = useWorkspaceStore(s => s.tools);
  const allTools = toolRegistry.getAll();

  const completedCount = allTools.filter(tool => {
    const data = tools[tool.metadata.id];
    // Consider a tool "completed" if it has any data
    return data && Object.keys(data).length > 0;
  }).length;

  const percentage = allTools.length > 0
    ? Math.round((completedCount / allTools.length) * 100)
    : 0;

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">Progress</span>
        <span className="font-medium text-gray-900">
          {completedCount}/{allTools.length} tools
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={cn(
            'h-2 rounded-full transition-all duration-300',
            percentage === 100 ? 'bg-green-500' : 'bg-primary-600'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
```

### Task 13: Create Shared Components Index

**Action:** Create barrel export for all shared components
**Files:** src/components/shared/index.ts
**Details:**

```typescript
// Forms
export { SliderInput } from './forms/SliderInput';
export { TextInput } from './forms/TextInput';
export { TextArea } from './forms/TextArea';
export { Select } from './forms/Select';

// UI
export { Button } from './ui/Button';
export { Card, CardHeader, CardTitle } from './ui/Card';
export { Badge } from './ui/Badge';
export { Modal } from './ui/Modal';

// Navigation
export { ToolNavigation } from './navigation/ToolNavigation';
export { ProgressIndicator } from './navigation/ProgressIndicator';
```

## Verification

- [ ] SliderInput renders and updates value on drag
- [ ] SliderInput is accessible via keyboard (arrow keys)
- [ ] TextInput shows label, handles input, displays error state
- [ ] TextArea handles multiline text input
- [ ] Select opens dropdown and allows selection
- [ ] Button renders all variants (primary, secondary, ghost, danger)
- [ ] Card renders with different padding options
- [ ] Badge shows different severity colors
- [ ] Modal opens, closes, and traps focus correctly
- [ ] ToolNavigation shows registered tools grouped by category
- [ ] ProgressIndicator shows correct completion percentage
- [ ] All components accept className prop for customization
- [ ] All components work with disabled state

## Must-Haves

- Consistent styling across all form components
- Accessibility: keyboard navigation, ARIA labels, focus states
- Reusable components for tool development
- Type-safe props with TypeScript
- className prop support for customization
- Disabled states for readonly mode
