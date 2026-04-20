import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';

export default function Login() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password || (mode === 'register' && !name)) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'register') {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('An account with this email already exists.'); break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Invalid email or password.'); break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.'); break;
        case 'auth/weak-password':
          setError('Password must be at least 6 characters.'); break;
        default:
          setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login');
    setError('');
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-surface)' }}>
      {/* Top Hero */}
      <div style={{
        background: 'linear-gradient(170deg, var(--color-primary-container) 0%, var(--color-primary-dark) 100%)',
        padding: '56px 28px 48px',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%', background: 'rgba(175,200,240,0.07)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 130, height: 130, borderRadius: '50%', background: 'rgba(131,251,165,0.06)' }} />

        {/* Logo mark */}
        <div className="animate-fade-up" style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: 'rgba(175,200,240,0.15)',
          border: '1.5px solid rgba(175,200,240,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
          backdropFilter: 'blur(10px)',
        }}>
          <span className="material-icons-round" style={{ color: 'rgba(212,227,255,0.9)', fontSize: 28 }}>account_balance_wallet</span>
        </div>

        <h1 className="animate-fade-up delay-1" style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2rem',
          fontWeight: 800,
          color: 'white',
          letterSpacing: '-0.02em',
          lineHeight: 1.15,
          marginBottom: 8,
        }}>
          RupeeFlow
        </h1>
        <p className="animate-fade-up delay-2" style={{ color: 'rgba(175,200,240,0.6)', fontSize: '0.9375rem', lineHeight: 1.5 }}>
          {mode === 'login'
            ? 'Welcome back. Sign in to continue.'
            : 'Create your account to get started.'}
        </p>
      </div>

      {/* Form Card */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 24px 32px' }}>
        <div className="animate-fade-up delay-2">
          {/* Mode tabs */}
          <div className="type-toggle mb-6">
            <button
              className={`type-toggle-btn${mode === 'login' ? ' expense active' : ''}`}
              style={mode === 'login' ? { background: 'var(--color-primary-container)', color: 'white' } : {}}
              onClick={() => mode !== 'login' && switchMode()}
              type="button"
            >
              Sign In
            </button>
            <button
              className={`type-toggle-btn${mode === 'register' ? ' income active' : ''}`}
              onClick={() => mode !== 'register' && switchMode()}
              type="button"
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Name field (register only) */}
            {mode === 'register' && (
              <div className="input-group animate-fade-up">
                <label className="input-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <span className="material-icons-round" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-outline)', fontSize: 20 }}>person</span>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Your full name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={{ paddingLeft: 40 }}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="input-group">
              <label className="input-label">Email</label>
              <div style={{ position: 'relative' }}>
                <span className="material-icons-round" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-outline)', fontSize: 20 }}>mail</span>
                <input
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ paddingLeft: 40 }}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="input-group">
              <label className="input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <span className="material-icons-round" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-outline)', fontSize: 20 }}>lock</span>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field"
                  placeholder={mode === 'register' ? 'At least 6 characters' : 'Your password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingLeft: 40, paddingRight: 44 }}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-outline)', display: 'flex', alignItems: 'center' }}
                >
                  <span className="material-icons-round" style={{ fontSize: 20 }}>{showPass ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: 'var(--color-tertiary-fixed)',
                color: 'var(--color-on-tertiary-container)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                fontSize: '0.875rem',
                display: 'flex',
                gap: 8,
                alignItems: 'center',
              }}>
                <span className="material-icons-round" style={{ fontSize: 18 }}>error_outline</span>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
              style={{ marginTop: 4, opacity: loading ? 0.7 : 1, gap: 8, fontSize: '1rem' }}
            >
              {loading ? (
                <span className="material-icons-round" style={{ animation: 'spin 0.8s linear infinite' }}>sync</span>
              ) : (
                <>
                  <span className="material-icons-round">{mode === 'login' ? 'login' : 'person_add'}</span>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)', lineHeight: 1.6 }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={switchMode} style={{ background: 'none', border: 'none', color: 'var(--color-primary-container)', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.8125rem' }}>
              {mode === 'login' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>

      {/* Keyframes for spin */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
