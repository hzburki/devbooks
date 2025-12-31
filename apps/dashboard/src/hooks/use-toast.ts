import { useState, useCallback, useEffect } from "react";

export type ToastVariant = "default" | "destructive";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

let toastListeners: Array<(toasts: Toast[]) => void> = [];
let toasts: Toast[] = [];

function notify() {
  toastListeners.forEach((listener) => listener([...toasts]));
}

export function useToast() {
  const [state, setState] = useState<Toast[]>([]);

  useEffect(() => {
    toastListeners.push(setState);
    setState([...toasts]);
    return () => {
      toastListeners = toastListeners.filter((listener) => listener !== setState);
    };
  }, []);

  const toast = useCallback(
    ({ title, description, variant = "default" }: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substring(7);
      const newToast: Toast = { id, title, description, variant };
      toasts = [...toasts, newToast];
      notify();

      setTimeout(() => {
        toasts = toasts.filter((t) => t.id !== id);
        notify();
      }, 5000);
    },
    []
  );

  return { toast, toasts: state };
}

