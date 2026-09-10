const Badge = ({ label, className }: { label: string; className: string }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded text-[11.5px] font-medium border ${className}`}
  >
    {label}
  </span>
);

export default Badge;
