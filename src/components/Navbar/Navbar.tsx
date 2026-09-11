import { useAuth } from '../../context/AuthContext';
import Badge from '../common/Badge';
import { LogoMark } from '../common/Logo';
import { roleColors } from '../../utils/permissions';
import { Link } from 'react-router-dom';

const Navbar = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-ink-100 px-4 md:px-7 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden text-ink-500 hover:text-ink-800 text-xl leading-none px-1 transition-colors"
          aria-label="Toggle menu"
        >
          ☰
        </button>
        <Link to="/dashboard" className="md:hidden flex items-center gap-2">
          <LogoMark size={30} />
        </Link>
        <div className="hidden md:block text-[13px] text-ink-400">
          Signed in as <span className="text-ink-700 font-medium">{user.fullName}</span>
        </div>
      </div>
      <div className="flex items-center gap-4 ml-auto">
        <Link
          to="/profile"
          className="flex items-center gap-3 group rounded-lg pl-2 pr-1 py-1 -mr-1 hover:bg-ink-50 transition-colors"
        >
          <div className="hidden sm:block text-right">
            <p className="text-[13.5px] font-semibold text-ink-800 leading-tight group-hover:text-primary-700 transition-colors">
              {user.fullName}
            </p>
            <Badge label={user.role} className={roleColors[user.role]} />
          </div>
          <div className="w-10 h-10 rounded-md bg-ink-800 text-white flex items-center justify-center font-semibold text-[15px] group-hover:bg-primary-600 transition-colors shrink-0">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
