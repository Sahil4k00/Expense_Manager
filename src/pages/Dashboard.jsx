import { useAppData } from '../store.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import TransactionRow from '../components/TransactionRow.jsx';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts';

/* ── Build last-7-days daily totals ── */
function buildWeeklyChart(transactions) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      dateStr: d.toISOString().slice(0, 10),
      expense: 0,
      income: 0,
    });
  }
  transactions.forEach(tx => {
    const raw = tx.createdAt?.toDate ? tx.createdAt.toDate() : (tx.createdAt ? new Date(tx.createdAt) : null);
    if (!raw) return;
    const ds = raw.toISOString().slice(0, 10);
    const day = days.find(d => d.dateStr === ds);
    if (!day) return;
    if (tx.type === 'expense') day.expense += Math.abs(tx.amount);
    else day.income += tx.amount;
  });
  return days;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: 'rgba(0,31,63,0.92)', backdropFilter: 'blur(10px)',
        borderRadius: '8px', padding: '7px 12px', fontSize: '0.75rem',
        fontWeight: 600, color: 'white', border: '1px solid rgba(255,255,255,0.12)',
        lineHeight: 1.7,
      }}>
        <div style={{ opacity: 0.6, marginBottom: 2 }}>{label}</div>
        {payload.map(p => (
          <div key={p.dataKey} style={{ color: p.dataKey === 'expense' ? '#ffb3b1' : '#66dd8b' }}>
            {p.dataKey === 'expense' ? '↓ ' : '↑ '}
            ₹{p.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { totalBalance, totalIncome, totalExpenses, transactions, dbLoading } = useAppData();
  const { user } = useAuth();
  const recent = transactions.slice(0, 5);
  const chartData = buildWeeklyChart(transactions);

  // ── Period totals ──
  const now = new Date();
  const startOfWeek = new Date(now); // last 7 rolling days
  startOfWeek.setDate(now.getDate() - 6);
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
  const endOfLastWeek = new Date(startOfWeek);
  endOfLastWeek.setMilliseconds(-1);

  let weeklyExpenses = 0, monthlyExpenses = 0, lastWeekExpenses = 0;
  transactions.forEach(tx => {
    if (tx.type !== 'expense') return;
    const raw = tx.createdAt?.toDate ? tx.createdAt.toDate() : (tx.createdAt ? new Date(tx.createdAt) : null);
    if (!raw) return;
    const amt = Math.abs(tx.amount);
    if (raw >= startOfWeek) weeklyExpenses += amt;
    if (raw >= startOfMonth) monthlyExpenses += amt;
    if (raw >= startOfLastWeek && raw <= endOfLastWeek) lastWeekExpenses += amt;
  });

  const weekChange = lastWeekExpenses > 0
    ? ((weeklyExpenses - lastWeekExpenses) / lastWeekExpenses * 100).toFixed(0)
    : null;
  const monthMax = Math.max(monthlyExpenses, 1);
  const weekMax  = Math.max(weeklyExpenses, monthlyExpenses, 1);

  const displayName = user?.displayName || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <>
      {/* Hero Header */}
      <header className="hero-header animate-fade-up">
        <div className="hero-greeting">
          <div>
            <div className="greeting-text">{greeting}</div>
            <div className="user-name">{displayName}</div>
          </div>
          <button className="avatar-btn" aria-label="Profile">
            <span className="material-icons-round">person</span>
          </button>
        </div>

        <div className="balance-display">
          <div className="balance-label">Total Balance</div>
          <div className="balance-amount">
            ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </div>
          <div className="balance-sub">{dbLoading ? 'Syncing…' : 'Updated just now'}</div>
        </div>

        <div className="income-expense-row">
          <div className="stat-pill income">
            <span className="material-icons-round stat-icon" style={{ fontSize: 16 }}>trending_up</span>
            <div>
              <div className="stat-label">Income</div>
              <div className="stat-value">₹{totalIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            </div>
          </div>
          <div className="stat-pill expense">
            <span className="material-icons-round stat-icon" style={{ fontSize: 16 }}>trending_down</span>
            <div>
              <div className="stat-label">Expenses</div>
              <div className="stat-value">₹{totalExpenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Weekly / Monthly Summary */}
      <div className="px-5 pt-5 animate-fade-up delay-1" style={{ paddingBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {/* This Week */}
          <div style={{
            background: 'var(--color-surface-container-lowest)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 16px',
            boxShadow: 'var(--shadow-ambient)',
            border: '1.5px solid rgba(207, 102, 103, 0.45)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)' }}>This Week</span>
              {weekChange !== null && (
                <span style={{
                  fontSize: '0.65rem', fontWeight: 700, borderRadius: 99,
                  padding: '2px 6px',
                  background: Number(weekChange) > 0 ? 'rgba(207,102,103,0.12)' : 'rgba(102,221,139,0.12)',
                  color: Number(weekChange) > 0 ? '#cf6667' : '#66dd8b',
                }}>
                  {Number(weekChange) > 0 ? '▲' : '▼'} {Math.abs(weekChange)}%
                </span>
              )}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-on-surface)', marginBottom: 8 }}>
              ₹{weeklyExpenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <div style={{ height: 4, background: 'var(--color-surface-variant)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min((weeklyExpenses / weekMax) * 100, 100)}%`, background: '#cf6667', borderRadius: 99, transition: 'width 0.7s ease' }} />
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-on-surface-variant)', marginTop: 5 }}>Last 7 days</div>
          </div>

          {/* This Month */}
          <div style={{
            background: 'var(--color-surface-container-lowest)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 16px',
            boxShadow: 'var(--shadow-ambient)',
            border: '1.5px solid rgba(0, 31, 63, 0.35)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)' }}>This Month</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--color-on-surface-variant)' }}>
                {now.toLocaleDateString('en-IN', { month: 'short' })}
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-on-surface)', marginBottom: 8 }}>
              ₹{monthlyExpenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <div style={{ height: 4, background: 'var(--color-surface-variant)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min((monthlyExpenses / monthMax) * 100, 100)}%`, background: 'var(--color-primary-container)', borderRadius: 99, transition: 'width 0.7s ease' }} />
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-on-surface-variant)', marginTop: 5 }}>
              {now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })} so far
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Bar Chart */}
      <div className="px-5 pt-4 animate-fade-up delay-2">
        <div className="card-elevated">
          <div className="flex justify-between items-center" style={{ marginBottom: 6 }}>
            <div className="title-md" style={{ color: 'var(--color-on-surface)' }}>7-Day Activity</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#66dd8b', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: '#66dd8b', display: 'inline-block' }} /> In
              </span>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#cf6667', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: '#cf6667', display: 'inline-block' }} /> Out
              </span>
            </div>
          </div>
          <div style={{ height: 110 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }} barCategoryGap="30%" barGap={2}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-body)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,31,63,0.05)', radius: 4 }} />
                <Bar dataKey="income"  radius={[4, 4, 0, 0]} maxBarSize={12} fill="#66dd8b" />
                <Bar dataKey="expense" radius={[4, 4, 0, 0]} maxBarSize={12} fill="#cf6667" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-5 mt-5 flex gap-3 animate-fade-up delay-2">
        <QuickActionCard icon="add_circle"  label="Add Expense" color="var(--color-tertiary-fixed)"      iconColor="var(--color-on-tertiary-container)" />
        <QuickActionCard icon="savings"     label="Add Income"  color="var(--color-secondary-container)" iconColor="var(--color-on-secondary-container)" />
        <QuickActionCard icon="pie_chart"   label="Reports"     color="var(--color-primary-fixed)"       iconColor="var(--color-primary-container)" />
      </div>

      {/* Recent Transactions */}
      <div className="px-5 mt-6 animate-fade-up delay-3">
        <div className="flex justify-between items-center mb-3">
          <div className="section-label">Recent Transactions</div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-primary-container)', fontWeight: 600 }}>
            {transactions.length} total
          </span>
        </div>
        {dbLoading ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-on-surface-variant)' }}>
            <span className="material-icons-round" style={{ fontSize: 32, opacity: 0.3, display: 'block', marginBottom: 8 }}>sync</span>
            Loading transactions…
          </div>
        ) : recent.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <span className="material-icons-round" style={{ fontSize: 48, color: 'var(--color-on-surface-variant)', opacity: 0.3 }}>receipt_long</span>
            <p style={{ marginTop: 12, color: 'var(--color-on-surface-variant)', fontSize: '0.9rem' }}>No transactions yet</p>
            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.8rem', marginTop: 4 }}>Tap + to add your first one</p>
          </div>
        ) : (
          <div className="card" style={{ padding: '4px 16px' }}>
            {recent.map((tx, i) => (
              <TransactionRow key={tx.id} transaction={tx} showDate delay={Math.min(i + 1, 6)} />
            ))}
          </div>
        )}
      </div>

      {/* Budget Burn Meter */}
      {transactions.length > 0 && totalExpenses > 0 && (
        <div className="px-5 mt-5 mb-6 animate-fade-up delay-4">
          <div className="card-elevated">
            <div className="flex justify-between items-center mb-3">
              <div className="title-md" style={{ color: 'var(--color-on-surface)' }}>Spending Overview</div>
            </div>
            <div className="burn-meter mb-3">
              <div
                className="burn-meter-fill"
                style={{ width: `${Math.min((totalExpenses / (totalExpenses + totalIncome || 1)) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between">
              <div>
                <div className="label-md">Spent</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--color-on-surface)', marginTop: '2px' }}>
                  ₹{totalExpenses.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="text-right">
                <div className="label-md">Total Earned</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--color-secondary)', marginTop: '2px' }}>
                  ₹{totalIncome.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ height: 24 }} />
    </>
  );
}

function QuickActionCard({ icon, label, color, iconColor }) {
  return (
    <div
      style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px 8px', background: color, borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'transform var(--transition-fast)' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <span className="material-icons-round" style={{ color: iconColor, fontSize: '22px' }}>{icon}</span>
      <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: iconColor, letterSpacing: '0.02em', textAlign: 'center' }}>{label}</span>
    </div>
  );
}
