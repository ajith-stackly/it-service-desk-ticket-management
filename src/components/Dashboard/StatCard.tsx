interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  accent?: 'primary' | 'signal' | 'critical' | 'neutral';
}

const accentMap = {
  primary: 'text-primary-600',
  signal: 'text-signal-600',
  critical: 'text-[#9B3A32]',
  neutral: 'text-ink-600',
};

const StatCard = ({ label, value, icon, accent = 'neutral' }: StatCardProps) => (
  <div className="bg-white rounded-lg border border-ink-100 p-4 shadow-card hover:shadow-md hover:border-ink-200 transition-all duration-150">
    <div className="flex items-center justify-between mb-2">
      <p className="text-[11.5px] font-medium text-ink-400 uppercase tracking-wide">{label}</p>
      <span className={`text-[13px] ${accentMap[accent]}`}>{icon}</span>
    </div>
    <p className="text-2xl font-semibold text-ink-800 font-data">{value}</p>
  </div>
);

export default StatCard;
