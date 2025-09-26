import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ArrowRight, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CryptoAsset } from "@/types/crypto";

interface CryptoSearchBarProps {
  onSelect?: (asset: CryptoAsset) => void;
  placeholder?: string;
}

export function CryptoSearchBar({ onSelect, placeholder = "Search 7000+ cryptocurrencies..." }: CryptoSearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['/api/assets/search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      const response = await fetch(`/api/assets/search?q=${encodeURIComponent(searchTerm)}&limit=10`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    enabled: searchTerm.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || searchResults.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < searchResults.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && searchResults[selectedIndex]) {
            handleSelect(searchResults[selectedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, searchResults, selectedIndex]);

  const handleSelect = (asset: CryptoAsset) => {
    setSearchTerm("");
    setIsOpen(false);
    setSelectedIndex(-1);
    onSelect?.(asset);
    inputRef.current?.blur();
  };

  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    setIsOpen(value.length >= 2);
    setSelectedIndex(-1);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={searchTerm}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => searchTerm.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-4 bg-[var(--dark-panel)] border-[var(--dark-border)] text-[var(--text-primary)] placeholder:text-muted-foreground"
          data-testid="input-crypto-search"
        />
      </div>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 bg-[var(--dark-panel)] border-[var(--dark-border)] shadow-xl">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            ) : searchResults.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                {searchResults.map((asset: CryptoAsset, index) => (
                  <div
                    key={asset.id}
                    onClick={() => handleSelect(asset)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center justify-between p-3 cursor-pointer transition-colors border-b border-[var(--dark-border)] last:border-b-0 ${
                      index === selectedIndex 
                        ? 'bg-[var(--dark-hover)] text-[var(--text-primary)]' 
                        : 'hover:bg-[var(--dark-hover)] text-[var(--text-primary)]'
                    }`}
                    data-testid={`search-result-${asset.symbol.toLowerCase()}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-sm">{asset.symbol}</span>
                          <Badge variant="secondary" className="text-xs">
                            SSS {asset.sssScore.toFixed(1)}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-48">
                          {asset.name}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-right">
                      <div>
                        <div className="text-sm font-medium">
                          ${asset.price.toFixed(4)}
                        </div>
                        <div className={`text-xs flex items-center ${
                          asset.change24h >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            ) : searchTerm.length >= 2 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No cryptocurrencies found for "{searchTerm}"
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Type at least 2 characters to search
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}