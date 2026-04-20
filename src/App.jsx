import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import { AppProvider } from './store.jsx';
import BottomNav from './components/BottomNav.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Activity from './pages/Activity.jsx';
import Insights from './pages/Insights.jsx';
import Settings from './pages/Settings.jsx';
import AddTransaction from './pages/AddTransaction.jsx';
import ManageExpense from './pages/ManageExpense.jsx';
import Login from './pages/Login.jsx';
import { useState } from 'react';

function AppContent() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [showAdd, setShowAdd] = useState(false);

  // Show spinner while Firebase resolves auth state
  if (loading) {
    return (
      <div className="app-shell">
        <div className="mobile-frame" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(170deg, var(--color-primary-container), var(--color-primary-dark))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="material-icons-round" style={{ color: 'white', fontSize: 28 }}>account_balance_wallet</span>
          </div>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--color-primary-container)' }}>RupeeFlow</p>
          <span className="material-icons-round" style={{ color: 'var(--color-on-surface-variant)', animation: 'spin 1s linear infinite', fontSize: 24 }}>sync</span>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // Not logged in → show login screen
  if (!user) {
    return (
      <div className="app-shell">
        <div className="mobile-frame">
          <Login />
        </div>
      </div>
    );
  }

  const hideNav = location.pathname.startsWith('/manage');
  const hideFab = location.pathname.startsWith('/manage');

  return (
    <div className="app-shell">
      <div className="mobile-frame">
        <div className="screen-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/manage/:id" element={<ManageExpense />} />
          </Routes>
        </div>

        {!hideNav && <BottomNav />}
        {!hideFab && !showAdd && (
          <button className="fab" onClick={() => setShowAdd(true)} aria-label="Add transaction">
            <span className="material-icons-round">add</span>
          </button>
        )}
        {showAdd && <AddTransaction onClose={() => setShowAdd(false)} />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}
