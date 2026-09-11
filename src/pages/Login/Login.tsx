import { useState, FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isValidEmail } from '../../utils/helpers';
import Logo from '../../components/common/Logo';

const demoAccounts = [
  { role: 'Admin', email: 'admin@itsm.com', password: 'admin123' },
  { role: 'Support Agent', email: 'agent1@itsm.com', password: 'agent123' },
  { role: 'Employee', email: 'employee1@itsm.com', password: 'employee123' },
];

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Email is required.';
    else if (!isValidEmail(email)) e.email = 'Enter a valid email address.';
    if (!password) e.password = 'Password is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setErrors({ form: res.message });
    }
  };

  const fillDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrors({});
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[44%] bg-ink-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-primary-500/10" />
        <div className="absolute -left-16 bottom-0 w-72 h-72 rounded-full bg-primary-500/5" />

        <div className="relative">
          <Logo size={42} />
        </div>

        <div className="relative">
          <p className="font-data text-primary-300 text-xs mb-3 tracking-wide">TKT-1004 · Critical · Assigned</p>
          <h1 className="text-3xl font-semibold leading-snug mb-4 max-w-sm">
            Every request tracked, routed, and closed out — with a record of exactly what happened.
          </h1>
          <p className="text-ink-300 text-sm max-w-xs leading-relaxed">
            One queue for hardware, access, network, and security requests across your organization.
          </p>
        </div>

        <div className="relative flex items-center gap-6 text-xs text-ink-400 font-data">
          <span>7 open categories</span>
          <span className="w-1 h-1 rounded-full bg-ink-600" />
          <span>3 roles</span>
          <span className="w-1 h-1 rounded-full bg-ink-600" />
          <span>Full lifecycle audit</span>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-10">
            <Logo size={38} wordmarkClassName="text-ink-800" />
          </div>

          <h2 className="text-xl font-semibold text-ink-800 mb-1">Sign in</h2>
          <p className="text-sm text-ink-400 mb-8">Access your service desk queue.</p>

          {errors.form && (
            <div className="bg-[#FBE7E5] border border-[#EFC0BB] text-[#9B3A32] text-sm rounded-md px-4 py-3 mb-5">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-ink-600 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-3.5 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition ${
                  errors.email ? 'border-[#D9847D]' : 'border-ink-200'
                }`}
                placeholder="you@company.com"
              />
              {errors.email && <p className="text-[#9B3A32] text-xs mt-1.5">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink-600 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-3.5 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition ${
                  errors.password ? 'border-[#D9847D]' : 'border-ink-200'
                }`}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-[#9B3A32] text-xs mt-1.5">{errors.password}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink-900 hover:bg-primary-700 text-white font-medium py-2.5 rounded-md transition-colors disabled:opacity-60 text-sm"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-ink-100">
            <p className="text-[11.5px] font-medium text-ink-400 mb-2.5 tracking-wide">Demo accounts</p>
            <div className="space-y-1.5">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.role}
                  onClick={() => fillDemo(acc.email, acc.password)}
                  className="w-full text-left text-xs bg-ink-50/60 hover:bg-primary-50 border border-ink-100 hover:border-primary-200 rounded-md px-3 py-2.5 flex justify-between items-center transition-colors"
                >
                  <span className="font-medium text-ink-700">{acc.role}</span>
                  <span className="text-ink-400 font-data">{acc.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
