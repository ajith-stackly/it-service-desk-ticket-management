export const EmptyState = ({
  title = 'No records found',
  subtitle = 'There is nothing to show here yet.',
}: {
  title?: string;
  subtitle?: string;
  icon?: string;
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-center gap-1.5">
    <p className="text-ink-600 font-medium text-[14px]">{title}</p>
    <p className="text-[13px] text-ink-400">{subtitle}</p>
  </div>
);

export const ErrorState = ({
  message = 'Something went wrong while loading data.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
    <p className="text-[#9B3A32] font-medium text-[13.5px] max-w-sm">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-ink-800 text-white rounded-md text-[13px] font-medium hover:bg-primary-700 transition-colors"
      >
        Retry
      </button>
    )}
  </div>
);
