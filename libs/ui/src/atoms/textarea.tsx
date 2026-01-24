import * as React from 'react';
import { cn } from './utils';
import { Label } from './label';

export type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: React.ReactNode;
  error?: string;
};

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, error, id, placeholder, onChange, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;
    const hasError = !!error;
    const internalRef = React.useRef<HTMLTextAreaElement>(null);

    // Combined ref callback
    const setRefs = React.useCallback(
      (element: HTMLTextAreaElement | null) => {
        internalRef.current = element;
        if (typeof ref === 'function') {
          ref(element);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current =
            element;
        }
      },
      [ref],
    );

    // Auto-resize function
    const adjustHeight = React.useCallback(() => {
      const textarea = internalRef.current;
      if (textarea) {
        // Reset height to auto to get the correct scrollHeight
        textarea.style.height = 'auto';
        // Set height to scrollHeight to fit content
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, []);

    // Adjust height on mount and when value changes
    React.useEffect(() => {
      adjustHeight();
    }, [adjustHeight, props.value]);

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      adjustHeight();
      onChange?.(e);
    };

    const textareaElement = (
      <textarea
        id={textareaId}
        placeholder={placeholder}
        className={cn(
          'border-input bg-background text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          'resize-none overflow-hidden',
          hasError && 'border-destructive',
          className,
        )}
        ref={setRefs}
        onChange={handleChange}
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
