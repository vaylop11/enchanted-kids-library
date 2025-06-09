import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface PDFSearchProps {
  onSearch: (searchTerm: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
  matchCount: number;
  currentMatch: number;
  className?: string;
}

const PDFSearch: React.FC<PDFSearchProps> = ({
  onSearch,
  onNext,
  onPrevious,
  onClose,
  matchCount,
  currentMatch,
  className
}) => {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    // Focus the input when the component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };
  
  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  return (
    <div className={cn("flex items-center gap-2 p-2 bg-background border rounded-md shadow-sm", className)}>
      <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'ar' ? 'البحث في المستند...' : 'Search in document...'}
            className="pl-8 h-8 text-sm"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 rounded-full hover:bg-muted flex items-center justify-center"
              aria-label={language === 'ar' ? 'مسح البحث' : 'Clear search'}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <Button type="submit" size="sm" variant="ghost" className="h-8 w-8 p-0">
          <Search className="h-4 w-4" />
        </Button>
      </form>
      
      {matchCount > 0 && (
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {currentMatch} / {matchCount}
          </span>
          <Button 
            type="button" 
            size="sm" 
            variant="ghost" 
            onClick={onPrevious}
            className="h-8 w-8 p-0"
            disabled={matchCount === 0}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button 
            type="button" 
            size="sm" 
            variant="ghost" 
            onClick={onNext}
            className="h-8 w-8 p-0"
            disabled={matchCount === 0}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <Button 
        type="button" 
        size="sm" 
        variant="ghost" 
        onClick={onClose}
        className="h-8 w-8 p-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default PDFSearch;