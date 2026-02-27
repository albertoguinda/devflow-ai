"use client";

import { createContext, useContext, useCallback, useState, useRef } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function useToastState() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timerMapRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const addToast = useCallback(
    (message: string, type: ToastType = "info", duration = 4000) => {
      const id = crypto.randomUUID();
      const newToast: Toast = { id, message, type, duration };

      setToasts((prev) => [...prev.slice(-4), newToast]);

      if (duration > 0) {
        const timer = setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
          timerMapRef.current.delete(id);
        }, duration);
        timerMapRef.current.set(id, timer);
      }
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    const timer = timerMapRef.current.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      timerMapRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}
