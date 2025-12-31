import { useToast, Toast as ToastType } from '../../hooks/use-toast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function Toast({ toast }: { toast: ToastType }) {
  const isDestructive = toast.variant === 'destructive';

  return (
    <div
      className={`min-w-[300px] rounded-lg border p-4 shadow-card ${
        isDestructive
          ? 'border-destructive/20 bg-destructive/10 text-destructive-foreground'
          : 'border-border bg-card text-card-foreground'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {toast.title && (
            <div className="mb-1 font-semibold">{toast.title}</div>
          )}
          {toast.description && (
            <div className="text-sm opacity-90">{toast.description}</div>
          )}
        </div>
      </div>
    </div>
  );
}
