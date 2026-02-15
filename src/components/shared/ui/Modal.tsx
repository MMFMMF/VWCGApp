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
