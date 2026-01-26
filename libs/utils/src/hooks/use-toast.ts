import { toast as sonnerToast } from 'sonner';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

export function useToast() {
  const toast = ({ title, description, variant = 'default' }: ToastOptions) => {
    const message = title || description || '';
    const toastOptions = description ? { description } : undefined;

    switch (variant) {
      case 'success':
        sonnerToast.success(message, toastOptions);
        break;
      case 'error':
        sonnerToast.error(message, toastOptions);
        break;
      case 'warning':
        sonnerToast.warning(message, toastOptions);
        break;
      case 'info':
        sonnerToast.info(message, toastOptions);
        break;
      case 'default':
      default:
        sonnerToast(message, toastOptions);
        break;
    }
  };

  return { toast };
}
