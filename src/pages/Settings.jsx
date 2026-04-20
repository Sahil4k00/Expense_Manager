import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useAppData } from '../store.jsx';

/* ─── Mini Modal Helper ─── */
function SettingModal({ title, onClose, children }) {
  return (
    <div className="modal-overlay animate-scale-in" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-on-surface)' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'var(--color-surface-container)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-icons-round" style={{ fontSize: 18, color: 'var(--color-on-surface-variant)' }}>close</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const LANGUAGES = [
  { code: 'en-IN', label: 'English (India)', flag: '🇮🇳' },
  { code: 'hi-IN', label: 'हिन्दी (Hindi)', flag: '🇮🇳' },
  { code: 'en-US', label: 'English (US)', flag: '🇺🇸' },
  { code: 'mr-IN', label: 'मराठी (Marathi)', flag: '🇮🇳' },
  { code: 'ta-IN', label: 'தமிழ் (Tamil)', flag: '🇮🇳' },
  { code: 'te-IN', label: 'తెలుగు (Telugu)', flag: '🇮🇳' },
];

export default function Settings() {
  const { user, logout } = useAuth();
  const { userSettings, updateUserSettings, updateDisplayName, transactions, totalExpenses, totalIncome, lastSynced } = useAppData();

  // Active modal state
  const [activeModal, setActiveModal] = useState(null); // 'profile'|'budget'|'appearance'|'language'|'export'|'backup'|'logout'

  // Form state for each modal
  const [nameInput, setNameInput] = useState('');
  const [budgetInput, setBudgetInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const displayName = user?.displayName || 'User';
  const email = user?.email || '';
  const budget = userSettings.budget || 0;
  const language = LANGUAGES.find(l => l.code === userSettings.language) || LANGUAGES[0];

  function openModal(id) {
    setSaveMsg('');
    if (id === 'profile') setNameInput(displayName);
    if (id === 'budget') setBudgetInput(budget > 0 ? budget.toString() : '');
    setActiveModal(id);
  }

  async function saveName() {
    if (!nameInput.trim()) return;
    setSaving(true);
    await updateDisplayName(nameInput.trim());
    setSaving(false);
    setSaveMsg('Name updated!');
    setTimeout(() => setActiveModal(null), 900);
  }

  async function saveBudget() {
    const val = parseFloat(budgetInput);
    if (isNaN(val) || val < 0) return;
    setSaving(true);
    await updateUserSettings({ budget: val });
    setSaving(false);
    setSaveMsg('Budget saved!');
    setTimeout(() => setActiveModal(null), 900);
  }

  async function toggleDarkMode() {
    await updateUserSettings({ darkMode: !userSettings.darkMode });
  }

  async function setLanguage(code) {
    await updateUserSettings({ language: code });
    setActiveModal(null);
  }

  async function toggleNotifications() {
    await updateUserSettings({ notifications: !userSettings.notifications });
  }

  function exportCSV() {
    const header = ['Date', 'Description', 'Category', 'Type', 'Amount (₹)'];
    const rows = transactions.map(t => [
      t.date,
      `"${t.title.replace(/"/g, '""')}"`,
      t.category,
      t.type,
      Math.abs(t.amount).toFixed(2),
    ]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rupeeflow_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setActiveModal(null);
  }

  const budgetUsedPct = budget > 0 ? Math.min((totalExpenses / budget) * 100, 100) : 0;

  const SETTINGS_SECTIONS = [
    {
      group: 'Account',
      items: [
        { id: 'profile', icon: 'person', label: 'Profile & Name', desc: displayName, actionable: true },
        { id: 'currency', icon: 'currency_rupee', label: 'Currency', desc: 'INR — Indian Rupee', actionable: false },
        { id: 'notifications', icon: 'notifications', label: 'Notifications', desc: userSettings.notifications ? 'All alerts on' : 'Muted', toggle: true, on: userSettings.notifications, onToggle: toggleNotifications },
      ],
    },
    {
      group: 'Preferences',
      items: [
        { id: 'budget', icon: 'savings', label: 'Monthly Budget', desc: budget > 0 ? `₹${budget.toLocaleString('en-IN')}` : 'Not set', actionable: true },
        { id: 'appearance', icon: userSettings.darkMode ? 'dark_mode' : 'light_mode', label: 'Appearance', desc: userSettings.darkMode ? 'Dark mode' : 'Light mode', actionable: true },
        { id: 'language', icon: 'language', label: 'Language', desc: `${language.flag} ${language.label}`, actionable: true },
      ],
    },
    {
      group: 'Data & Sync',
      items: [
        { id: 'export', icon: 'file_download', label: 'Export Data', desc: `${transactions.length} transactions`, actionable: true },
        { id: 'backup', icon: 'cloud_done', label: 'Backup & Sync', desc: lastSynced ? `Last synced ${lastSynced.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : 'Initializing…', actionable: true },
      ],
    },
  ];

  return (
    <>
      {/* Header */}
      <div style={{ background: 'linear-gradient(170deg, var(--color-primary-container) 0%, var(--color-primary-dark) 100%)', padding: 'var(--space-8) var(--space-5) var(--space-6)' }}>
        <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg, var(--color-primary-fixed-dim) 0%, rgba(175,200,240,0.3) 100%)', border: '2px solid rgba(175,200,240,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-icons-round" style={{ fontSize: 32, color: 'rgba(255,255,255,0.9)' }}>person</span>
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>{displayName}</h1>
            <p style={{ color: 'rgba(175,200,240,0.6)', fontSize: '0.875rem', marginTop: 2 }}>{email}</p>
          </div>
          <button onClick={() => openModal('profile')} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 'var(--radius-md)', padding: '6px 12px', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-body)', fontSize: '0.8125rem', fontWeight: 500 }}>
            <span className="material-icons-round" style={{ fontSize: 16 }}>edit</span>
            Edit
          </button>
        </div>

        {/* Budget bar */}
        {budget > 0 && (
          <div className="animate-fade-up delay-1" style={{ marginTop: 20, background: 'rgba(255,255,255,0.08)', borderRadius: 'var(--radius-md)', padding: '12px 16px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(175,200,240,0.55)' }}>Monthly Budget</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: budgetUsedPct > 80 ? 'var(--color-tertiary-fixed)' : 'var(--color-secondary-fixed-dim)' }}>{budgetUsedPct.toFixed(0)}% used</span>
            </div>
            <div style={{ height: 5, background: 'rgba(255,255,255,0.15)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${budgetUsedPct}%`, background: budgetUsedPct > 80 ? 'linear-gradient(90deg, #ffb3b1, #ff8a87)' : 'linear-gradient(90deg, #66dd8b, #83fba5)', borderRadius: 'var(--radius-full)', transition: 'width 0.8s ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: '0.75rem', color: 'rgba(175,200,240,0.5)' }}>₹{totalExpenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })} spent</span>
              <span style={{ fontSize: '0.75rem', color: 'rgba(175,200,240,0.5)' }}>₹{budget.toLocaleString('en-IN')} limit</span>
            </div>
          </div>
        )}
      </div>

      {/* Settings list */}
      <div className="px-5 pt-5 pb-8">
        {SETTINGS_SECTIONS.map((section, si) => (
          <div key={section.group} className={`animate-fade-up delay-${si + 1}`} style={{ marginBottom: 20 }}>
            <div className="section-label">{section.group}</div>
            <div className="card" style={{ padding: '0 16px' }}>
              {section.items.map((item, i) => (
                <div key={item.id}>
                  <div
                    onClick={() => item.actionable && openModal(item.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 0', cursor: item.actionable || item.toggle ? 'pointer' : 'default', userSelect: 'none' }}
                  >
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--color-surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span className="material-icons-round" style={{ fontSize: 20, color: 'var(--color-on-surface-variant)' }}>{item.icon}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: '0.9375rem', color: 'var(--color-on-surface)' }}>{item.label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', marginTop: 2 }}>{item.desc}</div>
                    </div>
                    {item.toggle ? (
                      <div onClick={e => { e.stopPropagation(); item.onToggle(); }} style={{ width: 44, height: 24, borderRadius: 'var(--radius-full)', background: item.on ? 'var(--color-secondary)' : 'var(--color-surface-container-highest)', position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', position: 'absolute', top: 2, left: item.on ? 22 : 2, transition: 'left 200ms ease', boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }} />
                      </div>
                    ) : item.actionable ? (
                      <span className="material-icons-round" style={{ fontSize: 18, color: 'var(--color-on-surface-variant)' }}>chevron_right</span>
                    ) : null}
                  </div>
                  {i < section.items.length - 1 && <div style={{ height: 1, background: 'rgba(196,198,207,0.25)' }} />}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Sign Out */}
        <div className="animate-fade-up delay-4">
          <button
            onClick={() => openModal('logout')}
            style={{ width: '100%', padding: '14px 20px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--color-tertiary-fixed)', color: 'var(--color-on-tertiary-container)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.9375rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
          >
            <span className="material-icons-round">logout</span>
            Sign Out
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', background: 'linear-gradient(135deg, var(--color-primary-container), var(--color-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>RupeeFlow</span>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', marginTop: 4 }}>v1.0.0 · Firebase · Made for India 🇮🇳</div>
        </div>
      </div>

      {/* ── MODALS ── */}

      {/* Edit Profile */}
      {activeModal === 'profile' && (
        <SettingModal title="Edit Profile" onClose={() => setActiveModal(null)}>
          <div className="input-group mb-5">
            <label className="input-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <span className="material-icons-round" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-outline)', fontSize: 20 }}>person</span>
              <input type="text" className="input-field" value={nameInput} onChange={e => setNameInput(e.target.value)} placeholder="Your full name" style={{ paddingLeft: 40 }}
                onKeyDown={e => e.key === 'Enter' && saveName()} />
            </div>
          </div>
          <div className="input-group mb-6">
            <label className="input-label">Email</label>
            <input type="email" className="input-field" value={email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
            <span style={{ fontSize: '0.7rem', color: 'var(--color-on-surface-variant)', marginTop: 2 }}>Email cannot be changed</span>
          </div>
          {saveMsg && <div style={{ textAlign: 'center', color: 'var(--color-secondary)', fontWeight: 600, marginBottom: 12 }}>{saveMsg}</div>}
          <button className="btn btn-primary btn-full" onClick={saveName} disabled={saving || !nameInput.trim()} style={{ gap: 8 }}>
            <span className="material-icons-round">{saving ? 'sync' : 'check'}</span>
            {saving ? 'Saving…' : 'Save Name'}
          </button>
        </SettingModal>
      )}

      {/* Monthly Budget */}
      {activeModal === 'budget' && (
        <SettingModal title="Monthly Budget" onClose={() => setActiveModal(null)}>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem', marginBottom: 20, lineHeight: 1.5 }}>
            Set your monthly spending limit. You'll see your progress on the Settings screen.
          </p>
          <div className="input-group mb-6">
            <label className="input-label">Budget Amount</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-on-surface-variant)' }}>₹</span>
              <input type="number" className="input-field" value={budgetInput} onChange={e => setBudgetInput(e.target.value)} placeholder="e.g. 30000"
                style={{ paddingLeft: 32, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem' }}
                onKeyDown={e => e.key === 'Enter' && saveBudget()} />
            </div>
          </div>
          {budgetInput && !isNaN(parseFloat(budgetInput)) && (
            <div style={{ background: 'var(--color-secondary-container)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 16, fontSize: '0.875rem', color: 'var(--color-on-secondary-container)', fontWeight: 500 }}>
              Budget: ₹{parseFloat(budgetInput).toLocaleString('en-IN')} / month
            </div>
          )}
          {saveMsg && <div style={{ textAlign: 'center', color: 'var(--color-secondary)', fontWeight: 600, marginBottom: 12 }}>{saveMsg}</div>}
          <div style={{ display: 'flex', gap: 12 }}>
            {budget > 0 && (
              <button onClick={() => { updateUserSettings({ budget: 0 }); setActiveModal(null); }}
                style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-full)', border: 'none', background: 'var(--color-surface-container)', color: 'var(--color-on-surface-variant)', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                Clear
              </button>
            )}
            <button className="btn btn-primary" onClick={saveBudget} disabled={saving} style={{ flex: 2, gap: 8 }}>
              <span className="material-icons-round">{saving ? 'sync' : 'savings'}</span>
              {saving ? 'Saving…' : 'Set Budget'}
            </button>
          </div>
        </SettingModal>
      )}

      {/* Appearance */}
      {activeModal === 'appearance' && (
        <SettingModal title="Appearance" onClose={() => setActiveModal(null)}>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem', marginBottom: 20, lineHeight: 1.5 }}>
            Choose your preferred theme. Your preference is saved and synced to your account.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { key: false, icon: 'light_mode', label: 'Light Mode', desc: 'Bright & clean' },
              { key: true, icon: 'dark_mode', label: 'Dark Mode', desc: 'Easy on the eyes' },
            ].map(opt => (
              <div
                key={String(opt.key)}
                onClick={() => { updateUserSettings({ darkMode: opt.key }); setTimeout(() => setActiveModal(null), 300); }}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 'var(--radius-md)', border: `2px solid ${userSettings.darkMode === opt.key ? 'var(--color-primary-container)' : 'transparent'}`, background: userSettings.darkMode === opt.key ? 'var(--color-primary-fixed)' : 'var(--color-surface-container)', cursor: 'pointer', transition: 'all 200ms ease' }}
              >
                <span className="material-icons-round" style={{ fontSize: 24, color: userSettings.darkMode === opt.key ? 'var(--color-primary-container)' : 'var(--color-on-surface-variant)' }}>{opt.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-on-surface)' }}>{opt.label}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)', marginTop: 2 }}>{opt.desc}</div>
                </div>
                {userSettings.darkMode === opt.key && (
                  <span className="material-icons-round" style={{ marginLeft: 'auto', color: 'var(--color-primary-container)', fontSize: 20 }}>check_circle</span>
                )}
              </div>
            ))}
          </div>
        </SettingModal>
      )}

      {/* Language */}
      {activeModal === 'language' && (
        <SettingModal title="Language" onClose={() => setActiveModal(null)}>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem', marginBottom: 16, lineHeight: 1.5 }}>
            Select your preferred language for the app.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {LANGUAGES.map(lang => (
              <div
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 'var(--radius-md)', border: `2px solid ${userSettings.language === lang.code ? 'var(--color-primary-container)' : 'transparent'}`, background: userSettings.language === lang.code ? 'var(--color-primary-fixed)' : 'var(--color-surface-container)', cursor: 'pointer', transition: 'all 200ms ease' }}
              >
                <span style={{ fontSize: 24 }}>{lang.flag}</span>
                <span style={{ fontWeight: 500, color: 'var(--color-on-surface)', flex: 1 }}>{lang.label}</span>
                {userSettings.language === lang.code && (
                  <span className="material-icons-round" style={{ color: 'var(--color-primary-container)', fontSize: 20 }}>check_circle</span>
                )}
              </div>
            ))}
          </div>
        </SettingModal>
      )}

      {/* Export Data */}
      {activeModal === 'export' && (
        <SettingModal title="Export Data" onClose={() => setActiveModal(null)}>
          <div style={{ textAlign: 'center', padding: '16px 0 24px' }}>
            <span className="material-icons-round" style={{ fontSize: 56, color: 'var(--color-secondary)', opacity: 0.8 }}>file_download</span>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', marginTop: 12, marginBottom: 6, color: 'var(--color-on-surface)' }}>Export your transactions</p>
            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem', lineHeight: 1.5 }}>
              Downloads a CSV file with all <strong>{transactions.length}</strong> transactions. Opens in Excel, Google Sheets, or any spreadsheet app.
            </p>
          </div>
          <div style={{ background: 'var(--color-surface-container)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)' }}>Total transactions</span>
              <span style={{ fontWeight: 600, color: 'var(--color-on-surface)' }}>{transactions.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)' }}>Total income</span>
              <span style={{ fontWeight: 600, color: 'var(--color-on-secondary-container)' }}>₹{totalIncome.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)' }}>Total expenses</span>
              <span style={{ fontWeight: 600, color: 'var(--color-on-tertiary-container)' }}>₹{totalExpenses.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
          </div>
          <button className="btn btn-primary btn-full" onClick={exportCSV} disabled={transactions.length === 0} style={{ gap: 8, opacity: transactions.length === 0 ? 0.5 : 1 }}>
            <span className="material-icons-round">download</span>
            Download CSV
          </button>
        </SettingModal>
      )}

      {/* Backup & Sync */}
      {activeModal === 'backup' && (
        <SettingModal title="Backup & Sync" onClose={() => setActiveModal(null)}>
          <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
            <span className="material-icons-round" style={{ fontSize: 56, color: 'var(--color-secondary)', opacity: 0.8 }}>cloud_done</span>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', marginTop: 12, marginBottom: 6, color: 'var(--color-on-surface)' }}>All data backed up</p>
            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem', lineHeight: 1.5 }}>
              Your transactions are automatically synced to Firebase Firestore in real-time. No manual backup needed.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {[
              { icon: 'sync', label: 'Sync mode', value: 'Real-time' },
              { icon: 'storage', label: 'Storage', value: 'Firebase Firestore' },
              { icon: 'security', label: 'Security', value: 'AES-256 encrypted' },
              { icon: 'schedule', label: 'Last synced', value: lastSynced ? lastSynced.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Connecting…' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--color-surface-container)', borderRadius: 'var(--radius-md)' }}>
                <span className="material-icons-round" style={{ fontSize: 20, color: 'var(--color-secondary)' }}>{row.icon}</span>
                <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--color-on-surface-variant)' }}>{row.label}</span>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-on-surface)' }}>{row.value}</span>
              </div>
            ))}
          </div>
          <button className="btn btn-primary btn-full" onClick={() => setActiveModal(null)} style={{ gap: 8 }}>
            <span className="material-icons-round">check_circle</span>
            Got it
          </button>
        </SettingModal>
      )}

      {/* Logout Confirm */}
      {activeModal === 'logout' && (
        <SettingModal title="Sign Out?" onClose={() => setActiveModal(null)}>
          <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
            <span className="material-icons-round" style={{ fontSize: 48, color: 'var(--color-on-surface-variant)', opacity: 0.4 }}>logout</span>
            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.9rem', lineHeight: 1.6, marginTop: 12 }}>
              Your data is safely stored in the cloud. You can sign back in anytime.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setActiveModal(null)} style={{ flex: 1, padding: 12, borderRadius: 'var(--radius-full)', border: 'none', background: 'var(--color-surface-container)', color: 'var(--color-on-surface)', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              Cancel
            </button>
            <button onClick={logout} style={{ flex: 1, padding: 12, borderRadius: 'var(--radius-full)', border: 'none', background: 'var(--color-primary-dark)', color: 'white', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              Sign Out
            </button>
          </div>
        </SettingModal>
      )}
    </>
  );
}
