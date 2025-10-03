'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ErrorToastProps {
  error: string | null;
  onDismiss?: () => void;
  autoHide?: boolean;
  duration?: number;
}

export default function ErrorToast({ 
  error, 
  onDismiss, 
  autoHide = true, 
  duration = 5000 
}: ErrorToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (error) {
      setIsVisible(true);
      
      if (autoHide) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => {
            onDismiss?.();
          }, 300); // 等待动画完成
        }, duration);
        
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [error, autoHide, duration, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss?.();
    }, 300);
  };

  if (!error) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-md">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30 
            }}
          >
            <Alert variant="destructive" className="shadow-lg border-red-200 bg-red-50 dark:bg-red-950/50">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <div className="flex items-start justify-between">
                <AlertDescription className="flex-1 pr-2">
                  {error}
                </AlertDescription>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/50"
                >
                  <XMarkIcon className="h-4 w-4" />
                </Button>
              </div>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}