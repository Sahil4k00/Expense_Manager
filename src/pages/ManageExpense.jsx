import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppData, CATEGORIES } from '../store.jsx';

export default function ManageExpense() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { transactions, updateTransaction, deleteTransaction } = useAppData();

  const tx = transactions.find(t => t.id === id); // Firestore IDs are strings

  const [title, setTitle] = useState(tx?.title || '');
  const [amount, setAmount] = useState(tx ? Math.abs(tx.amount).toString() : '');
  const [category, setCategory] = useState(tx?.category || 'dining');
  // Extract date from createdAt timestamp for the date input (YYYY-MM-DD)
  const [txDate, setTxDate] = useState(() => {
    if (!tx?.createdAt) return new Date().toISOString().slice(0, 10);
    const d = tx.createdAt.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt);
    return d.toISOString().slice(0, 10);
  });
  const [paymentMethod, setPaymentMethod] = useState(
    tx?.paymentMethod || (tx?.type === 'income' ? 'upi' : 'card')
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!tx) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
        <span className="material-icons-round" style={{ fontSize: '48px', opacity: 0.3 }}>search_off</span>
        <p style={{ marginTop: '12px' }}>Transaction not found</p>
        <button className="btn btn-primary" style={{ marginTop: '24px' }} onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  const filteredCategories = CATEGORIES.filter(c => tx.type === 'income' ? c.id === 'income' : c.id !== 'income');

  const handleSave = async () => {
    setLoading(true);
    // Convert date string back to Firestore Timestamp
    const [y, m, d] = txDate.split('-').map(Number);
    const { Timestamp } = await import('firebase/firestore');
    const createdAt = Timestamp.fromDate(new Date(y, m - 1, d, 12, 0, 0));
    await updateTransaction(tx.id, {
      title,
      amount: tx.type === 'expense' ? -Math.abs(parseFloat(amount)) : Math.abs(parseFloat(amount)),
      category,
      createdAt,
      paymentMethod,
    });
    setSaved(true);
    setLoading(false);
    setTimeout(() => navigate(-1), 700);
  };

  const handleDelete = async () => {
    setLoading(true);
    await deleteTransaction(tx.id);
    navigate(-1);
  };

  const isIncome = tx.type === 'income';

  return (
    <>
      {/* Header */}
      <div style={{ background: 'linear-gradient(170deg, var(--color-primary-container) 0%, var(--color-primary-dark) 100%)', padding: 'var(--space-8) var(--space-5) var(--space-6)' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 'var(--radius-full)', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: 'var(--space-4)' }}
        >
          <span className="material-icons-round" style={{ color: 'white', fontSize: '20px' }}>arrow_back</span>
        </button>

        <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className={`transaction-icon ${isIncome ? 'income' : 'expense'}`} style={{ width: '52px', height: '52px', borderRadius: '14px' }}>
            <span className="material-icons-round" style={{ fontSize: '24px' }}>{tx.icon}</span>
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 800, color: 'white' }}>{tx.title}</h1>
            <p style={{ color: 'rgba(175,200,240,0.6)', fontSize: '0.8125rem', marginTop: '2px' }}>{tx.subtitle}</p>
          </div>
        </div>

        {/* Amount */}
        <div className="animate-fade-up delay-1" style={{ marginTop: 'var(--space-4)' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, color: isIncome ? 'var(--color-secondary-fixed-dim)' : 'var(--color-tertiary-fixed)' }}>
            {isIncome ? '+' : '−'}₹{Math.abs(tx.amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Smart Insight */}
        {!isIncome && (
          <div className="animate-fade-up delay-2" style={{ marginTop: 'var(--space-4)', background: 'rgba(255,218,216,0.1)', borderRadius: 'var(--radius-md)', padding: '10px 14px', border: '1px solid rgba(255,179,177,0.2)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <span className="material-icons-round" style={{ color: 'var(--color-tertiary-fixed)', fontSize: '16px', marginTop: '2px' }}>auto_awesome</span>
            <p style={{ color: 'rgba(255,218,216,0.8)', fontSize: '0.8125rem', lineHeight: 1.5 }}>
              Smart Insight: Review this transaction and ensure it fits within your budget.
            </p>
          </div>
        )}
      </div>

      {/* Edit Form */}
      <div className="px-5 pt-5 animate-fade-up delay-2">
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 700, marginBottom: 'var(--space-4)', color: 'var(--color-on-surface)' }}>
          Edit Details
        </h2>

        <div className="input-group mb-4">
          <label className="input-label">Description</label>
          <input type="text" className="input-field" value={title} onChange={e => setTitle(e.target.value)} />
        </div>

        <div className="input-group mb-5">
          <label className="input-label">Amount</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-on-surface-variant)' }}>₹</span>
            <input
              type="number"
              className="input-field"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              style={{ paddingLeft: '32px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem' }}
            />
          </div>
        </div>

        <div className="input-group mb-5">
          <label className="input-label">Date</label>
          <div style={{ position: 'relative' }}>
            <span className="material-icons-round" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-outline)', fontSize: 20, pointerEvents: 'none' }}>calendar_today</span>
            <input
              type="date"
              className="input-field"
              value={txDate}
              onChange={e => setTxDate(e.target.value)}
              style={{ paddingLeft: 40, colorScheme: 'light dark' }}
            />
          </div>
        </div>

        <div className="mb-5">
          <div className="input-label mb-2">Category</div>
          <div className="category-grid">
            {filteredCategories.map(cat => (
              <button key={cat.id} className={`category-pill${category === cat.id ? ' selected' : ''}`} onClick={() => setCategory(cat.id)}>
                <span className="material-icons-round">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-6">
          <div className="input-label mb-2">Payment Method</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { id: 'cash',       icon: 'payments',        label: 'Cash' },
              { id: 'card',       icon: 'credit_card',     label: 'Card' },
              { id: 'upi',        icon: 'phone_android',   label: 'UPI' },
              { id: 'netbanking', icon: 'account_balance', label: 'Net Banking' },
            ].map(pm => (
              <button
                key={pm.id}
                onClick={() => setPaymentMethod(pm.id)}
                style={{
                  flex: '1 1 0',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  padding: '10px 4px',
                  borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${paymentMethod === pm.id ? 'var(--color-primary-container)' : 'transparent'}`,
                  background: paymentMethod === pm.id ? 'var(--color-primary-fixed)' : 'var(--color-surface-container-low)',
                  cursor: 'pointer', transition: 'all 150ms ease',
                  fontFamily: 'var(--font-body)', fontSize: '0.68rem', fontWeight: 600,
                  color: paymentMethod === pm.id ? 'var(--color-primary-container)' : 'var(--color-on-surface-variant)',
                }}
              >
                <span className="material-icons-round" style={{ fontSize: 20 }}>{pm.icon}</span>
                {pm.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          <button className="btn btn-primary btn-full" onClick={handleSave} disabled={saved || loading} style={{ gap: '8px' }}>
            <span className="material-icons-round">{saved ? 'check_circle' : 'save'}</span>
            {saved ? 'Saved!' : loading ? 'Saving…' : 'Save Changes'}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{ background: 'var(--color-tertiary-fixed)', color: 'var(--color-on-tertiary-container)', border: 'none', borderRadius: 'var(--radius-full)', padding: '14px 24px', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.9375rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <span className="material-icons-round" style={{ fontSize: '18px' }}>delete_outline</span>
            Delete Transaction
          </button>
        </div>
      </div>

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="modal-overlay animate-scale-in" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-sheet" style={{ padding: '28px 24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <span className="material-icons-round" style={{ fontSize: '48px', color: 'var(--color-on-tertiary-container)' }}>warning_amber</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, margin: '12px 0 6px' }}>Delete Transaction?</h3>
              <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                This will permanently remove <strong>{tx.title}</strong> from your records.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-full)', border: 'none', background: 'var(--color-surface-container)', color: 'var(--color-on-surface)', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={loading} style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-full)', border: 'none', background: 'var(--color-on-tertiary-container)', color: 'white', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                {loading ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
