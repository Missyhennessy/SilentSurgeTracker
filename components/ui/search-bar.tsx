import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onClear?: () => void;
}

export function SearchBar({ 
  value, 
  onChange, 
  placeholder = "Search assets...", 
  className,
  onClear 
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChange('');
    onClear?.();
  };

  return (
    <div className={cn(
      "relative flex items-center transition-all duration-200",
      isFocused && "scale-105",
      className
    )}>
      <Search className="absolute left-3 h-4 w-4 text-gray-400 z-10" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "pl-10 pr-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400",
          "focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
          "transition-all duration-200"
        )}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 h-8 w-8 p-0 hover:bg-gray-700"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}