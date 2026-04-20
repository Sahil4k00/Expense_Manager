import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/', icon: 'dashboard', label: 'Summary' },
  { path: '/activity', icon: 'receipt_long', label: 'Activity' },
  { path: '/insights', icon: 'analytics', label: 'Insights' },
  { path: '/settings', icon: 'settings', label: 'Settings' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      {NAV_ITEMS.map(item => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            className={`nav-item${isActive ? ' active' : ''}`}
            onClick={() => navigate(item.path)}
            aria-current={isActive ? 'page' : undefined}
            aria-label={item.label}
          >
            <span className="material-icons-round">{item.icon}</span>
            <span className="label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
