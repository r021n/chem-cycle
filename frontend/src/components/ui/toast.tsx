import React from 'react';
import { useUiStore } from '../../stores/ui-store';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUiStore();

  if (toasts.length === 0) return null;

  return (
    <div id="toastContainer" className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none font-sans">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-float border transition-all',
            toast.type === 'error' && 'bg-rose-950 text-rose-100 border-rose-800/80',
            toast.type === 'success' && 'bg-chem-dark text-chem-glow border-chem-forest/80',
            toast.type === 'info' && 'bg-chem-forest text-chem-glow border-chem-moss'
          )}
        >
          <div className="flex items-center space-x-2.5">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-chem-mint flex-shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-chem-sage flex-shrink-0" />}
            <span className="text-xs font-medium leading-tight">
              {toast.message}
            </span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-3 p-1 rounded-lg text-chem-glow/60 hover:text-chem-glow hover:bg-white/10 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
