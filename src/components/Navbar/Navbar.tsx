import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Badge from '../common/Badge';
import { LogoMark } from '../common/Logo';
import { roleColors } from '../../utils/permissions';
import { Link } from 'react-router-dom';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative w-[56px] h-[30px] rounded-full border border-ink-200 dark:border-ink-600 bg-ink-100 dark:bg-ink-900 transition-colors shrink-0"
    >
      <span
        className={`absolute top-[2px] w-[24px] h-[24px] rounded-full bg-white dark:bg-ink-700 shadow-card flex items-center justify-center text-[12px] transition-all duration-200 ${
          isDark ? 'left-[30px]' : 'left-[2px]'
        }`}
      >
        {isDark ? '🌙' : '☀'}
      </span>
    </button>
  );
};

const Navbar = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <header className="sticky top-0 z-10 bg-white/90 dark:bg-ink-800/90 backdrop-blur border-b border-ink-100 dark:border-ink-700 px-4 md:px-7 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden text-ink-500 dark:text-ink-400 text-xl leading-none px-1"
          aria-label="Toggle menu"
        >
          ☰
        </button>
        <Link to="/dashboard" className="md:hidden flex items-center gap-2">
          <LogoMark size={30} />
        </Link>
        <div className="hidden md:block text-[13px] text-ink-400 dark:text-ink-500">
          Signed in as <span className="text-ink-700 dark:text-ink-200 font-medium">{user.fullName}</span>
        </div>
      </div>
      <div className="flex items-center gap-4 ml-auto">
        <ThemeToggle />
        <Link to="/profile" className="flex items-center gap-3 group">
          <div className="hidden sm:block text-right">
            <p className="text-[13.5px] font-semibold text-ink-800 dark:text-ink-100 leading-tight">{user.fullName}</p>
            <Badge label={user.role} className={roleColors[user.role]} />
          </div>
          <div className="w-10 h-10 rounded-md bg-ink-800 text-white flex items-center justify-center font-semibold text-[15px] group-hover:bg-primary-600 transition-colors">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
