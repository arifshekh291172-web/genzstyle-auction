import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full ${maxWidth} max-w-[calc(100vw-1.5rem)] bg-luxury-surface border border-luxury-border/80 rounded-2xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]`}
      >
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-luxury-border flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-white tracking-wide truncate pr-2">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-luxury-card transition shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
