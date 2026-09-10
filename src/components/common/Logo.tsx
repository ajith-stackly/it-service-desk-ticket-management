interface LogoMarkProps {
  size?: number;
  className?: string;
}

/** Icon-only badge: a rounded square with a support-headset glyph. */
export const LogoMark = ({ size = 40, className = '' }: LogoMarkProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect width="40" height="40" rx="11" fill="url(#sd-logo-grad)" />
    <path
      d="M11.5 21.5v-2.2c0-4.7 3.8-8.5 8.5-8.5s8.5 3.8 8.5 8.5v2.2"
      stroke="white"
      strokeWidth="2.1"
      strokeLinecap="round"
    />
    <rect x="9.6" y="20.4" width="5" height="7.4" rx="2.3" fill="white" />
    <rect x="25.4" y="20.4" width="5" height="7.4" rx="2.3" fill="white" />
    <path
      d="M28.9 27.8v1.1c0 2.05-1.66 3.71-3.71 3.71h-2.3"
      stroke="white"
      strokeWidth="2.1"
      strokeLinecap="round"
    />
    <circle cx="20.65" cy="32.6" r="1.9" fill="white" />
    <defs>
      <linearGradient id="sd-logo-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3FA6A3" />
        <stop offset="1" stopColor="#095259" />
      </linearGradient>
    </defs>
  </svg>
);

interface LogoProps {
  size?: number;
  wordmarkClassName?: string;
  taglineClassName?: string;
  tagline?: string;
  className?: string;
}

/** Full lockup: mark + "Service Desk" wordmark, used in the sidebar and login screen. */
const Logo = ({
  size = 40,
  wordmarkClassName = 'text-white',
  taglineClassName = '',
  tagline,
  className = '',
}: LogoProps) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <LogoMark size={size} />
    <div className="leading-tight">
      <p className={`font-semibold text-[17px] tracking-tight ${wordmarkClassName}`}>Service Desk</p>
      {tagline && <p className={`text-[11px] tracking-wide ${taglineClassName}`}>{tagline}</p>}
    </div>
  </div>
);

export default Logo;
