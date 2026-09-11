interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-1 py-4 border-t border-ink-100">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-3 py-1.5 rounded-md text-[13px] font-medium border border-ink-200 disabled:opacity-30 hover:bg-ink-50 transition-colors"
      >
        Prev
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-8 h-8 rounded-md text-[13px] font-medium transition-colors ${
            p === currentPage ? 'bg-ink-800 text-white' : 'border border-ink-200 hover:bg-ink-50'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-3 py-1.5 rounded-md text-[13px] font-medium border border-ink-200 disabled:opacity-30 hover:bg-ink-50 transition-colors"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
