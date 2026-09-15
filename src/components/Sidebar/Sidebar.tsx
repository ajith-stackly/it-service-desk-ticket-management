import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../common/Logo';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const navByRole: Record<string, NavItem[]> = {
  Admin: [
    { label: 'Dashboard', path: '/dashboard', icon: '◧' },
    { label: 'Tickets', path: '/tickets', icon: '◫' },
    { label: 'Users', path: '/users', icon: '◍' },
    { label: 'Categories', path: '/categories', icon: '◭' },
    { label: 'Reports', path: '/reports', icon: '◮' },
    { label: 'Profile', path: '/profile', icon: '◔' },
  ],
  'Support Agent': [
    { label: 'Dashboard', path: '/dashboard', icon: '◧' },
    { label: 'My Tickets', path: '/tickets', icon: '◫' },
    { label: 'Profile', path: '/profile', icon: '◔' },
  ],
  Employee: [
    { label: 'Dashboard', path: '/dashboard', icon: '◧' },
    { label: 'Create Ticket', path: '/tickets/new', icon: '+' },
    { label: 'My Tickets', path: '/tickets', icon: '◫' },
    { label: 'Profile', path: '/profile', icon: '◔' },
  ],
};

const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { user, logout } = useAuth();
  if (!user) return null;
  const items = navByRole[user.role] || [];

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-ink-900/50 z-20 md:hidden" onClick={onClose} />}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-ink-900 text-ink-200 flex flex-col z-30 shrink-0 transform transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="px-6 py-7 border-b border-ink-700/60">
          <Logo size={42} tagline="Ticket Management" taglineClassName="text-ink-300 mt-0.5" />
        </div>
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/tickets'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-[13.5px] font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-500/15 text-primary-300 border-l-2 border-primary-400 pl-[10px]'
                    : 'text-ink-300 hover:bg-ink-800 hover:text-white border-l-2 border-transparent pl-[10px]'
                }`
              }
            >
              <span className="w-4 text-center text-[15px]">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-ink-700/60">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[13.5px] font-medium text-ink-300 hover:bg-[#9B3A32]/20 hover:text-[#E8918A] transition-colors"
          >
            <span className="w-4 text-center">⏻</span>
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
