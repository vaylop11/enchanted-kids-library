
import { useState, useEffect } from 'react';

/**
 * A hook that delays updating a value until after a specified wait time.
 * Useful for reducing the number of API calls or expensive calculations.
 *
 * @param value The value to debounce
 * @param delay The delay in milliseconds (default: 300ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up the timeout to update the debounced value after the delay
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout when the value or delay changes, or when the component unmounts
    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
}
