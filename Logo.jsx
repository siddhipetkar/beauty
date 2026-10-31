export const Logo = ({ size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" data-testid="brand-logo">
    <circle cx="32" cy="32" r="30" fill="#800A38" />
    <circle cx="32" cy="32" r="22" fill="none" stroke="#F6DDE0" strokeWidth="2" />
    <path d="M20 44 L32 18 L44 44" fill="none" stroke="#F6DDE0" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="32" cy="36" r="3" fill="#D94678" />
  </svg>
);
