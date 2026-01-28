import { Input } from '@devbooks/ui';
import { Search, X } from '@devbooks/ui';

interface TableSearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function TableSearchBar({
  placeholder = 'Search...',
  value,
  onChange,
  className,
}: TableSearchBarProps) {
  const hasValue = value.length > 0;

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className={`relative max-w-md flex-1 ${className || ''}`}>
      <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          const target = e.target as HTMLInputElement;
          onChange(target.value);
        }}
        className={`bg-white pl-10 ${hasValue ? 'pr-10' : ''}`}
      />
      {hasValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
