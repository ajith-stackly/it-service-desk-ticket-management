import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

const Modal = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className={`relative bg-white dark:bg-ink-800 rounded-lg shadow-xl border border-ink-100 dark:border-ink-700 w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100 dark:border-ink-700 sticky top-0 bg-white dark:bg-ink-800 rounded-t-lg">
          <h3 className="text-[15px] font-semibold text-ink-800 dark:text-ink-100">{title}</h3>
          <button
            onClick={onClose}
            className="text-ink-400 dark:text-ink-500 hover:text-ink-700 dark:hover:text-ink-200 text-lg leading-none w-7 h-7 flex items-center justify-center rounded-md hover:bg-ink-50 dark:hover:bg-ink-700/50"
          >
            ×
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
