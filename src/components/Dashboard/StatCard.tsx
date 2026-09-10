interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  accent?: 'primary' | 'signal' | 'critical' | 'neutral';
}

const accentMap = {
  primary: 'text-primary-600 dark:text-primary-400',
  signal: 'text-signal-600 dark:text-signal-400',
  critical: 'text-[#9B3A32] dark:text-red-300',
  neutral: 'text-ink-600 dark:text-ink-300',
};

const StatCard = ({ label, value, icon, accent = 'neutral' }: StatCardProps) => (
  <div className="bg-white dark:bg-ink-800 rounded-lg border border-ink-100 dark:border-ink-700 p-4 shadow-card">
    <div className="flex items-center justify-between mb-2">
      <p className="text-[11.5px] font-medium text-ink-400 dark:text-ink-500 uppercase tracking-wide">{label}</p>
      <span className={`text-[13px] ${accentMap[accent]}`}>{icon}</span>
    </div>
    <p className="text-2xl font-semibold text-ink-800 dark:text-ink-100 font-data">{value}</p>
  </div>
);

export default StatCard;
