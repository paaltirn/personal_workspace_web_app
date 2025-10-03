'use client';

import { useState, useCallback, createContext, useContext } from 'react';

interface GlobalErrorContextType {
  error: string | null;
  showError: (message: string) => void;
  clearError: () => void;
}

const GlobalErrorContext = createContext<GlobalErrorContextType | undefined>(undefined);

export function useGlobalError() {
  const context = useContext(GlobalErrorContext);
  if (!context) {
    throw new Error('useGlobalError must be used within a GlobalErrorProvider');
  }
  return context;
}

export function useGlobalErrorProvider() {
  const [error, setError] = useState<string | null>(null);

  const showError = useCallback((message: string) => {
    console.error('Global Error:', message);
    setError(message);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    showError,
    clearError,
    GlobalErrorContext
  };
}