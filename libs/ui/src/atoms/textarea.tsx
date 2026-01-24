import * as React from 'react';
import { cn } from './utils';
import { Label } from './label';

export type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: React.ReactNode;
  error?: string;
};

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, error, id, placeholder, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;
    const hasError = !!error;

    const textareaElement = (
      <textarea
        id={textareaId}
        placeholder={placeholder}
        className={cn(
          'border-input bg-background text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          hasError && 'border-destructive',
          className,
        )}
        ref={ref}
        {...props}
      />
    );

    // If label or error is provided, wrap in a container
    if (label || error) {
      return (
        <div className="space-y-2">
          {label && (
            <Label htmlFor={textareaId} className="text-sm font-medium">
              {label}
            </Label>
          )}
          {textareaElement}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      );
    }

    // Otherwise, return just the textarea element
    return textareaElement;
  },
);
TextArea.displayName = 'TextArea';

export { TextArea };
