import * as React from 'react';
import { cn } from './utils';
import { Label } from './label';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: React.ReactNode;
  error?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, id, placeholder, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const hasError = !!error;

    const inputElement = (
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        className={cn(
          'border-input bg-background text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
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
            <Label htmlFor={inputId} className="text-sm font-medium">
              {label}
            </Label>
          )}
          {inputElement}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>
      );
    }

    // Otherwise, return just the input element
    return inputElement;
  },
);
Input.displayName = 'Input';

export { Input };
