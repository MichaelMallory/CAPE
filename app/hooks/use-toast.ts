"use client";

import { useState } from 'react';

export interface Toast {
  id?: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
  className?: string;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Toast) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { ...toast, id }]);

    if (toast.duration !== Infinity) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 3000);
    }
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return {
    toasts,
    toast: addToast,
    dismiss: removeToast,
  };
} 