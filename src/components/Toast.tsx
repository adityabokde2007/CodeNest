import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      role="status"
      className={`w-full sm:min-w-[300px] sm:max-w-[400px] flex items-start gap-3 p-3 sm:p-4 rounded-xl shadow-xl border backdrop-blur-xl animate-slide-in ${
        type === 'success'
          ? 'bg-[#fffaf3]/95 border-primary/30 text-text-main'
          : 'bg-[#fff4f0]/95 border-[#c96b54]/40 text-[#8f382d]'
      }`}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        {type === 'success' ? (
          <CheckCircle size={20} className="text-primary" />
        ) : (
          <XCircle size={20} className="text-[#b44b3c]" />
        )}
      </div>

      {/* Message */}
      <p className="flex-1 text-sm font-medium leading-snug">{message}</p>

      {/* Close button */}
      <button
        onClick={onClose}
        className={`flex-shrink-0 p-1 rounded-lg transition-colors ${
          type === 'success'
            ? 'hover:bg-primary/10 text-primary'
            : 'hover:bg-[#c96b54]/10 text-[#b44b3c]'
        }`}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
