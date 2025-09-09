// contexts/ToastContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  Toast, 
  ToastProvider, 
  ToastViewport, 
  SimpleToast 
} from '@/components/ui/toast';

interface ToastItem {
  id: string;
  variant: 'success' | 'destructive' | 'warning' | 'info' | 'default';
  message: string;
  title?: string;
  duration?: number;
}

interface ToastContextType {
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  toast: (message: string, options?: {
    variant?: ToastItem['variant'];
    title?: string;
    duration?: number;
  }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (
    message: string, 
    variant: ToastItem['variant'], 
    title?: string,
    duration = 4000
  ) => {
    const id = Date.now().toString() + Math.random().toString(36);
    const newToast: ToastItem = { id, variant, message, title, duration };
    
    setToasts(prev => [...prev, newToast]);

    // إزالة Toast تلقائياً
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  };

  const success = (message: string, title?: string) => 
    addToast(message, 'success', title);
  
  const error = (message: string, title?: string) => 
    addToast(message, 'destructive', title);
  
  const warning = (message: string, title?: string) => 
    addToast(message, 'warning', title);
  
  const info = (message: string, title?: string) => 
    addToast(message, 'info', title);

  const toast = (
    message: string, 
    options?: {
      variant?: ToastItem['variant'];
      title?: string;
      duration?: number;
    }
  ) => {
    const { variant = 'default', title, duration } = options || {};
    addToast(message, variant, title, duration);
  };

  return (
    <ToastContext.Provider value={{ success, error, warning, info, toast }}>
      <ToastProvider>
        {children}
        <ToastViewport />
        {toasts.map((toastItem) => (
          <Toast key={toastItem.id} variant={toastItem.variant} duration={toastItem.duration}>
            <SimpleToast 
              variant={toastItem.variant}
              title={toastItem.title}
              message={toastItem.message}
              showClose={true}
            />
          </Toast>
        ))}
      </ToastProvider>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastContextProvider');
  }
  return context;
};
