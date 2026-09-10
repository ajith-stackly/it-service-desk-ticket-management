import Modal from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  danger = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => (
  <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
    <p className="text-ink-500 dark:text-ink-400 text-[13.5px] mb-6 leading-relaxed">{message}</p>
    <div className="flex justify-end gap-3">
      <button
        onClick={onCancel}
        className="px-4 py-2 rounded-md text-[13px] font-medium text-ink-500 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-700/50"
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        className={`px-4 py-2 rounded-md text-[13px] font-medium text-white ${
          danger ? 'bg-[#9B3A32] hover:bg-[#832E27]' : 'bg-primary-600 hover:bg-primary-700'
        }`}
      >
        {confirmLabel}
      </button>
    </div>
  </Modal>
);

export default ConfirmDialog;
