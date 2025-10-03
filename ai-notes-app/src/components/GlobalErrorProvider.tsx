'use client';

import { ReactNode } from 'react';
import { useGlobalErrorProvider } from '@/hooks/useGlobalError';
import ErrorToast from './ErrorToast';

interface GlobalErrorProviderProps {
  children: ReactNode;
}

export default function GlobalErrorProvider({ children }: GlobalErrorProviderProps) {
  const { error, showError, clearError, GlobalErrorContext } = useGlobalErrorProvider();

  return (
    <GlobalErrorContext.Provider value={{ error, showError, clearError }}>
      {children}
      <ErrorToast 
        error={error} 
        onDismiss={clearError}
        autoHide={true}
        duration={5000}
      />
    </GlobalErrorContext.Provider>
  );
}