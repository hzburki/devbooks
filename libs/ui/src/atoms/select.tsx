import * as React from 'react';
import { cn } from './utils';
import { Label } from './label';
import { ChevronDown, Check, X } from '../icons';

export type SelectOption = {
  value: string;
  label: string;
};

export type SelectProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onChange' | 'value'
> & {
  label?: React.ReactNode;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  placeholder?: string;
  options: SelectOption[];
  disabled?: boolean;
};

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      id,
      value,
      onChange,
      onBlur,
      name,
      placeholder = 'Select an option',
      options,
      disabled,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;
    const hasError = !!error;
    const [isOpen, setIsOpen] = React.useState(false);
    const selectRef = React.useRef<HTMLDivElement>(null);
    const buttonRef = React.useRef<HTMLButtonElement>(null);

    // Combine refs
    React.useImperativeHandle(ref, () => buttonRef.current!);

    const selectedOption = options.find((opt) => opt.value === value);
    const displayValue = selectedOption?.label || placeholder;
    const hasValue = !!value && value !== '';

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.('');
      setIsOpen(false);
      onBlur?.();
    };

    // Close dropdown when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          selectRef.current &&
          !selectRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          onBlur?.();
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }
      return undefined;
    }, [isOpen, onBlur]);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(!isOpen);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        onBlur?.();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
      }
    };

    const handleOptionClick = (optionValue: string) => {
      onChange?.(optionValue);
      setIsOpen(false);
      onBlur?.();
    };

    const handleOptionKeyDown = (
      e: React.KeyboardEvent<HTMLDivElement>,
      optionValue: string,
    ) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleOptionClick(optionValue);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
        onBlur?.();
      }
    };

    const selectElement = (
      <div ref={selectRef} className="relative">
        <button
          ref={buttonRef}
          type="button"
          id={selectId}
          name={name}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className={cn(
            'border-input bg-background text-foreground ring-offset-background flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 pr-10 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            hasError && 'border-destructive',
            !selectedOption && 'text-muted-foreground',
            className,
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={label ? `${selectId}-label` : undefined}
          {...props}
        >
          <span className="truncate">{displayValue}</span>
          {hasValue ? (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 flex h-4 w-4 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label="Clear selection"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <ChevronDown
              className={cn(
                'pointer-events-none absolute right-3 h-4 w-4 text-muted-foreground transition-transform',
                isOpen && 'rotate-180',
              )}
              aria-hidden="true"
            />
          )}
        </button>

        {isOpen && (
          <div
            role="listbox"
            className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-popover shadow-md"
          >
            {options.filter((opt) => opt.value !== '').length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No options available
              </div>
            ) : (
              options
                .filter((opt) => opt.value !== '')
                .map((option) => {
                const isSelected = option.value === value;
                return (
                  <div
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={0}
                    onClick={() => handleOptionClick(option.value)}
                    onKeyDown={(e) => handleOptionKeyDown(e, option.value)}
                    className={cn(
                      'relative flex cursor-pointer select-none items-center px-3 py-2 text-sm outline-none transition-colors',
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'text-popover-foreground hover:bg-muted focus:bg-muted',
                    )}
                  >
                    {isSelected && (
                      <Check className="mr-2 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    )}
                    <span>{option.label}</span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    );

    // If label or error is provided, wrap in a container
    if (label || error) {
      return (
        <div className="space-y-2">
          {label && (
            <Label htmlFor={selectId} id={`${selectId}-label`} className="text-sm font-medium">
              {label}
            </Label>
          )}
          {selectElement}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      );
    }

    // Otherwise, return just the select element
    return selectElement;
  },
);
Select.displayName = 'Select';

export { Select };
