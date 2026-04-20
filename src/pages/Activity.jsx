import { useState } from 'react';
import { useAppData } from '../store.jsx';
import TransactionRow from '../components/TransactionRow.jsx';

export default function Activity() {
  const { transactions, dbLoading } = useAppData();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = transactions.filter(tx => {
    const matchType = filter === 'all' || tx.type === filter;
    const matchSearch = tx.title.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  // Group by date
  const grouped = filtered.reduce((acc, tx) => {
    const key = tx.date || 'Today';
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {});

  const groups = Object.entries(grouped);

  return (
    <>
      {/* Page Header */}
      <div style={{
        background: 'linear-gradient(170deg, var(--color-primary-container) 0%, var(--color-primary-dark) 100%)',
        padding: 'var(--space-8) var(--space-5) var(--space-5)',
      }}>
        <h1 className="animate-fade-up" style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: '4px' }}>
          Activity
        </h1>
        <p className="animate-fade-up delay-1" style={{ color: 'rgba(175, 200, 240, 0.6)', fontSize: '0.875rem' }}>
          Your complete financial log
        </p>

        {/* Search */}
        <div className="animate-fade-up delay-2 mt-4" style={{ position: 'relative' }}>
          <span className="material-icons-round" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(175,200,240,0.5)', fontSize: '20px' }}>search</span>
          <input
            type="search"
            placeholder="Search transactions…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 'var(--radius-full)', padding: '10px 16px 10px 40px', fontFamily: 'var(--font-body)', fontSize: '0.9375rem', color: 'white', outline: 'none' }}
          />
        </div>
      </div>

      {/* Filter pills */}
      <div className="px-5 py-4 animate-fade-up delay-2" style={{ display: 'flex', gap: '8px' }}>
        {['all', 'expense', 'income'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 16px', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: '0.8125rem', fontWeight: 600,
              transition: 'all var(--transition-fast)',
              background: filter === f
                ? f === 'income' ? 'var(--color-secondary-container)'
                  : f === 'expense' ? 'var(--color-tertiary-fixed)'
                  : 'var(--color-primary-container)'
                : 'var(--color-surface-container)',
              color: filter === f
                ? f === 'income' ? 'var(--color-on-secondary-container)'
                  : f === 'expense' ? 'var(--color-on-tertiary-container)'
                  : 'white'
                : 'var(--color-on-surface-variant)',
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Transaction groups */}
      <div className="px-5">
        {dbLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-on-surface-variant)' }}>
            <span className="material-icons-round" style={{ fontSize: '32px', opacity: 0.3, display: 'block', marginBottom: 8 }}>sync</span>
            Loading…
          </div>
        ) : groups.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-on-surface-variant)' }}>
            <span className="material-icons-round" style={{ fontSize: '48px', opacity: 0.3 }}>receipt_long</span>
            <p style={{ marginTop: '12px' }}>
              {search ? 'No matching transactions' : 'No transactions yet'}
            </p>
          </div>
        ) : (
          groups.map(([date, txs], gi) => (
            <div key={date} className={`animate-fade-up delay-${Math.min(gi + 3, 6)}`} style={{ marginBottom: 'var(--space-4)' }}>
              <div className="section-label">{date}</div>
              <div className="card" style={{ padding: '4px 16px' }}>
                {txs.map((tx, i) => (
                  <TransactionRow key={tx.id} transaction={tx} showChip delay={Math.min(i + 1, 6)} />
                ))}
              </div>
            </div>
          ))
        )}
        <div style={{ height: 24 }} />
      </div>
    </>
  );
}
