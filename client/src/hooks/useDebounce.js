import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce any value (e.g. search input)
 * @param {any} value - The input value to debounce
 * @param {number} delay - The delay in milliseconds
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
