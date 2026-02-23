import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    // Focus first focusable element inside modal
    const focusable = modalRef.current?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    focusable?.focus();

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-70 transition-opacity"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div
          ref={modalRef}
          className={`relative w-full ${maxWidth} transform overflow-hidden rounded-2xl bg-gray-900 border border-gray-700 text-left shadow-2xl transition-all`}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white" id="modal-title">
              {title}
            </h3>
            <button
              type="button"
              className="text-gray-400 hover:text-white transition focus:outline-none"
              onClick={onClose}
              aria-label="Close modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            {children}
          </div>

          {/* Footer (optional – you can pass buttons as children) */}
          {/* <div className="px-6 py-4 border-t border-gray-800 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
            >
              Cancel
            </button>
            <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
              Save Changes
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
}
