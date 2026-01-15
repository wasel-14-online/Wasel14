import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from './utils';
import { Button } from './button';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command';
import { Badge } from './badge';
import { LoadingSpinner } from './loading-spinner';

export interface AutocompleteOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface AutocompleteProps {
  options: AutocompleteOption[];
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  multiple?: boolean;
  disabled?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  maxItems?: number;
  filterFn?: (option: AutocompleteOption, query: string) => boolean;
  onSearch?: (query: string) => void;
  onCreateOption?: (value: string) => void;
  createOptionText?: (value: string) => string;
  className?: string;
  renderOption?: (option: AutocompleteOption, isSelected: boolean) => React.ReactNode;
}

export function Autocomplete({
  options,
  value,
  onChange,
  placeholder = 'Search...',
  multiple = false,
  disabled = false,
  loading = false,
  emptyMessage = 'No results found.',
  maxItems,
  filterFn,
  onSearch,
  onCreateOption,
  createOptionText,
  className,
  renderOption,
}: AutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const inputRef = useRef<HTMLInputElement>(null);

  // Default filter function
  const defaultFilter = useCallback((option: AutocompleteOption, query: string) => {
    const searchValue = query.toLowerCase();
    return option.label.toLowerCase().includes(searchValue) ||
           option.description?.toLowerCase().includes(searchValue) ||
           option.value.toLowerCase().includes(searchValue);
  }, []);

  // Filter options based on input
  useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredOptions(options);
    } else {
      const filter = filterFn || defaultFilter;
      const filtered = options.filter(option => filter(option, inputValue));
      setFilteredOptions(filtered);
    }
  }, [inputValue, options, filterFn, defaultFilter]);

  // Handle search callback
  useEffect(() => {
    if (onSearch && inputValue.trim()) {
      const timeoutId = setTimeout(() => {
        onSearch(inputValue);
      }, 300); // Debounce search

      return () => clearTimeout(timeoutId);
    }
  }, [inputValue, onSearch]);

  const handleSelect = (selectedValue: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(selectedValue)
        ? currentValues.filter(v => v !== selectedValue)
        : [...currentValues, selectedValue];
      onChange(newValues);
    } else {
      onChange(selectedValue);
      setOpen(false);
    }
    setInputValue('');
  };

  const handleRemove = (valueToRemove: string) => {
    if (multiple && Array.isArray(value)) {
      onChange(value.filter(v => v !== valueToRemove));
    }
  };

  const handleCreateOption = () => {
    if (onCreateOption && inputValue.trim()) {
      onCreateOption(inputValue.trim());
      setInputValue('');
      setOpen(false);
    }
  };

  const selectedValues = multiple ? (Array.isArray(value) ? value : []) : [];
  const singleValue = !multiple ? (typeof value === 'string' ? value : '') : '';

  const displayValue = multiple
    ? selectedValues.length > 0
      ? `${selectedValues.length} selected`
      : placeholder
    : options.find(opt => opt.value === singleValue)?.label || placeholder;

  const canCreateOption = onCreateOption && inputValue.trim() &&
    !options.some(opt => opt.label.toLowerCase() === inputValue.toLowerCase());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
          disabled={disabled}
        >
          <div className="flex flex-wrap gap-1 flex-1 min-w-0">
            {multiple && selectedValues.length > 0 ? (
              selectedValues.slice(0, maxItems || selectedValues.length).map(val => {
                const option = options.find(opt => opt.value === val);
                return option ? (
                  <Badge
                    key={val}
                    variant="secondary"
                    className="text-xs"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      handleRemove(val);
                    }}
                  >
                    {option.label}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ) : null;
              })
            ) : (
              <span className={cn(
                'truncate',
                !singleValue && 'text-muted-foreground'
              )}>
                {displayValue}
              </span>
            )}
          </div>
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            ref={inputRef}
            placeholder={placeholder}
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? (
                <div className="flex items-center justify-center p-4">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Searching...</span>
                </div>
              ) : canCreateOption ? (
                <div className="p-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={handleCreateOption}
                  >
                    {createOptionText ? createOptionText(inputValue) : `Create "${inputValue}"`}
                  </Button>
                </div>
              ) : (
                emptyMessage
              )}
            </CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => {
                const isSelected = multiple
                  ? selectedValues.includes(option.value)
                  : singleValue === option.value;

                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={handleSelect}
                    disabled={option.disabled}
                    className="cursor-pointer"
                  >
                    {renderOption ? (
                      renderOption(option, isSelected)
                    ) : (
                      <div className="flex items-center gap-2 w-full">
                        {option.icon}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{option.label}</div>
                          {option.description && (
                            <div className="text-sm text-muted-foreground truncate">
                              {option.description}
                            </div>
                          )}
                        </div>
                        {isSelected && <Check className="h-4 w-4" />}
                      </div>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Predictive search hook
export function usePredictiveSearch<T>(
  data: T[],
  searchFields: (keyof T)[],
  options?: {
    debounceMs?: number;
    minQueryLength?: number;
    maxResults?: number;
  }
) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const {
    debounceMs = 300,
    minQueryLength = 2,
    maxResults = 10,
  } = options || {};

  useEffect(() => {
    if (query.length < minQueryLength) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const timeoutId = setTimeout(() => {
      const filtered = data.filter(item => {
        const searchValue = query.toLowerCase();
        return searchFields.some(field => {
          const fieldValue = item[field];
          return String(fieldValue).toLowerCase().includes(searchValue);
        });
      }).slice(0, maxResults);

      setResults(filtered);
      setIsSearching(false);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, data, searchFields, debounceMs, minQueryLength, maxResults]);

  return {
    query,
    setQuery,
    results,
    isSearching,
  };
}
