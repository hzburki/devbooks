import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        className: 'font-sans',
        classNames: {
          error: '!bg-red-600 !text-white !border-red-600',
          success: '!bg-green-600 !text-white !border-green-700',
          info: '!bg-blue-600 !text-white !border-blue-600',
        },
      }}
    />
  );
}
