import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cn } from './utils';
import { Label } from './label';

export type SwitchProps = React.ComponentPropsWithoutRef<
  typeof SwitchPrimitives.Root
> & {
  label?: React.ReactNode;
  error?: string;
};

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, label, error, id, ...props }, ref) => {
  const generatedId = React.useId();
  const switchId = id || generatedId;
  const hasError = !!error;

  const switchElement = (
    <SwitchPrimitives.Root
      className={cn(
        'focus-visible:ring-ring focus-visible:ring-offset-background peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
        hasError && 'border-destructive',
        className,
      )}
      {...props}
      ref={ref}
      id={switchId}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          'bg-background pointer-events-none block h-5 w-5 rounded-full shadow-lg ring-0 transition-transform',
          'data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
        )}
      />
    </SwitchPrimitives.Root>
  );

  // If label or error is provided, wrap in a container
  if (label || error) {
    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={switchId} className="text-sm font-medium">
            {label}
          </Label>
        )}
        <div className="flex items-center gap-3">{switchElement}</div>
        {error && <p className="text-destructive text-sm">{error}</p>}
      </div>
    );
  }

  // Otherwise, return just the switch element
  return switchElement;
});
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
