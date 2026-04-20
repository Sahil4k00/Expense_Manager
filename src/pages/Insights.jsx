import { useAppData } from '../store.jsx';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const COLORS = ['#001F3F', '#006d36', '#460009', '#476083', '#43474e', '#74777f', '#c4c6cf'];

const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.06) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: '10px', fontWeight: 600 }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function Insights() {
  const { totalExpenses, totalIncome, categoryBreakdown, transactions, dbLoading } = useAppData();

  const pieData = categoryBreakdown.slice(0, 6).map(c => ({ name: c.label, value: c.total }));
  const burnRate = totalIncome > 0 ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1) : 0;

  // Monthly spending from existing transactions
  const monthlyMap = transactions.reduce((acc, tx) => {
    if (tx.type !== 'expense') return acc;
    const key = tx.date || 'Today';
    acc[key] = (acc[key] || 0) + Math.abs(tx.amount);
    return acc;
  }, {});

  const monthlyData = Object.entries(monthlyMap).slice(-4).map(([name, expense]) => ({ month: name.slice(0, 6), expense: parseFloat(expense.toFixed(2)) }));

  const isEmpty = transactions.length === 0;

  return (
    <>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(170deg, var(--color-primary-container) 0%, var(--color-primary-dark) 100%)',
        padding: 'var(--space-8) var(--space-5) var(--space-6)',
      }}>
        <h1 className="animate-fade-up" style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: '4px' }}>
          Insights
        </h1>
        <p className="animate-fade-up delay-1" style={{ color: 'rgba(175, 200, 240, 0.6)', fontSize: '0.875rem', marginBottom: 'var(--space-5)' }}>
          Your Spending Report
        </p>

        {/* Top stats */}
        <div className="animate-fade-up delay-2" style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: 'var(--radius-md)', padding: '12px 16px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <div style={{ fontSize: '0.6875rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(175,200,240,0.55)', marginBottom: '4px' }}>Total Outflow</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 800, color: 'white' }}>₹{totalExpenses.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
          </div>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: 'var(--radius-md)', padding: '12px 16px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <div style={{ fontSize: '0.6875rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(175,200,240,0.55)', marginBottom: '4px' }}>Savings Rate</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 800, color: parseFloat(burnRate) >= 0 ? 'var(--color-secondary-fixed-dim)' : 'var(--color-tertiary-fixed-dim)' }}>
              {burnRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {isEmpty && !dbLoading && (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--color-on-surface-variant)' }}>
          <span className="material-icons-round" style={{ fontSize: '56px', opacity: 0.25 }}>analytics</span>
          <p style={{ marginTop: '16px', fontWeight: 500 }}>No data yet</p>
          <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>Add transactions to see insights</p>
        </div>
      )}

      {!isEmpty && (
        <>
          {/* Smart Tip */}
          {categoryBreakdown.length > 0 && (
            <div className="px-5 mt-5 animate-fade-up delay-2">
              <div style={{ background: 'linear-gradient(135deg, var(--color-secondary-container) 0%, #b8fdd1 100%)', borderRadius: 'var(--radius-md)', padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span className="material-icons-round" style={{ color: 'var(--color-on-secondary-container)', fontSize: '20px', marginTop: '2px' }}>lightbulb</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-on-secondary-container)', marginBottom: '2px' }}>Smart Tip</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-secondary)', lineHeight: 1.5 }}>
                    Your top spending category is <strong>{categoryBreakdown[0]?.label}</strong> at ₹{categoryBreakdown[0]?.total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}.
                    {totalExpenses > totalIncome ? ' You are spending more than you earn — review your expenses.' : ' Great job keeping your expenses below income!'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pie Chart */}
          {pieData.length > 0 && (
            <div className="px-5 mt-5 animate-fade-up delay-3">
              <div className="card-elevated">
                <div className="title-md mb-3" style={{ color: 'var(--color-on-surface)' }}>Category Breakdown</div>
                <div style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={85} innerRadius={40} dataKey="value" labelLine={false} label={<CustomPieLabel />}>
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => [`₹${v.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`, 'Spent']} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '0.8125rem' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                  {pieData.map((entry, i) => (
                    <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--color-on-surface-variant)' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                      {entry.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Monthly Bar Chart */}
          {monthlyData.length > 1 && (
            <div className="px-5 mt-5 animate-fade-up delay-4">
              <div className="card-elevated">
                <div className="title-md mb-3" style={{ color: 'var(--color-on-surface)' }}>Spending by Day</div>
                <div style={{ height: 160 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                      <CartesianGrid vertical={false} stroke="rgba(196,198,207,0.3)" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-on-surface-variant)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: 'var(--color-on-surface-variant)' }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Expenses']} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '0.8125rem' }} />
                      <Bar dataKey="expense" fill="var(--color-primary-container)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Category list */}
          {categoryBreakdown.length > 0 && (
            <div className="px-5 mt-5 mb-6 animate-fade-up delay-5">
              <div className="section-label mb-3">Top Categories</div>
              <div className="card" style={{ padding: '8px 16px' }}>
                {categoryBreakdown.map((cat, i) => (
                  <div key={cat.id} className={`animate-fade-up delay-${Math.min(i + 1, 6)}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0' }}>
                    <div className="transaction-icon expense">
                      <span className="material-icons-round">{cat.icon}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{cat.label}</span>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-on-tertiary-container)' }}>
                          ₹{cat.total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="burn-meter" style={{ height: '4px' }}>
                        <div className="burn-meter-fill" style={{ width: `${Math.min((cat.total / totalExpenses) * 100, 100)}%` }} />
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', marginTop: '3px' }}>{cat.count} transaction{cat.count !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      <div style={{ height: 24 }} />
    </>
  );
}
