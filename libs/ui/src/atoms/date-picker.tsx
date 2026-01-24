import * as React from 'react';
import { format } from 'date-fns';
import { CalendarDays, X } from 'lucide-react';

import { cn } from './utils';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Label } from './label';

export type DatePickerProps = {
  label?: React.ReactNode;
  error?: string;
  value?: string; // 'yyyy-MM-dd' format
  onChange?: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  /** Minimum date that can be selected */
  fromYear?: number;
  /** Maximum date that can be selected */
  toYear?: number;
};

const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      className,
      label,
      error,
      id,
      value,
      onChange,
      onBlur,
      placeholder = 'Select date',
      disabled,
      fromYear = 1920,
      toYear = new Date().getFullYear() + 10,
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const datePickerId = id || generatedId;
    const hasError = !!error;
    const [open, setOpen] = React.useState(false);

    // Parse the value into a Date object
    const selectedDate = value ? new Date(value) : undefined;
    const hasValue = !!value && value !== '';

    const handleSelect = (date: Date | undefined) => {
      if (date) {
        const dateString = format(date, 'yyyy-MM-dd');
        onChange?.(dateString);
      } else {
        onChange?.('');
      }
      setOpen(false);
      onBlur?.();
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onChange?.('');
      onBlur?.();
    };

    const handleOpenChange = (isOpen: boolean) => {
      setOpen(isOpen);
      if (!isOpen) {
        onBlur?.();
      }
    };

    const datePickerElement = (
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            type="button"
            id={datePickerId}
            disabled={disabled}
            className={cn(
              'border-input bg-background text-foreground ring-offset-background',
              'flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm',
              'focus:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50',
              !hasValue && 'text-muted-foreground',
              hasError && 'border-destructive',
              className,
            )}
          >
            <span className="flex items-center">
              <CalendarDays className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {selectedDate ? format(selectedDate, 'PPP') : placeholder}
              </span>
            </span>
            {hasValue && (
              <button
                type="button"
                onClick={handleClear}
                className="ml-2 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground focus:outline-none"
                aria-label="Clear date"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            captionLayout="dropdown"
            selected={selectedDate}
            onSelect={handleSelect}
            fromYear={fromYear}
            toYear={toYear}
            defaultMonth={selectedDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    );

    // If label or error is provided, wrap in a container
    if (label || error) {
      return (
        <div className="space-y-2">
          {label && (
            <Label
              htmlFor={datePickerId}
              id={`${datePickerId}-label`}
              className="text-sm font-medium"
            >
              {label}
            </Label>
          )}
          {datePickerElement}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      );
    }

    // Otherwise, return just the date picker element
    return datePickerElement;
  },
);
DatePicker.displayName = 'DatePicker';

export { DatePicker };
