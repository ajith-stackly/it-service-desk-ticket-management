const Loader = ({ label = 'Loading...' }: { label?: string }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3 text-ink-400">
    <div className="w-8 h-8 border-[3px] border-ink-200 border-t-primary-600 rounded-full animate-spin" />
    <p className="text-[13px]">{label}</p>
  </div>
);

export default Loader;
