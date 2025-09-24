import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // 始终从 initialValue 开始，避免 hydration 错误
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  // 在客户端挂载后从 localStorage 读取实际值
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    } finally {
      setIsInitialized(true);
    }
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, isInitialized] as const;
}