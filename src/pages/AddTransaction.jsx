import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useAppData, CATEGORIES } from '../store.jsx';

export default function AddTransaction({ onClose }) {
  const { addTransaction } = useAppData();
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('dining');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [submitting, setSubmitting] = useState(false);

  const filteredCategories = CATEGORIES.filter(c =>
    type === 'income' ? c.id === 'income' : c.id !== 'income'
  );

  const handleSubmit = async () => {
    if (!amount || !title) return;
    setSubmitting(true);
    try {
      await addTransaction({ title, amount, category, type, note, date, paymentMethod });
      onClose();
    } catch (err) {
      console.error('Add transaction error:', err);
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay animate-scale-in" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle" />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-on-surface)' }}>
            New Transaction
          </h2>
          <button onClick={onClose} style={{ background: 'var(--color-surface-container)', border: 'none', borderRadius: 'var(--radius-full)', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-icons-round" style={{ fontSize: '18px', color: 'var(--color-on-surface-variant)' }}>close</span>
          </button>
        </div>

        {/* Type Toggle */}
        <div className="type-toggle mb-5">
          <button className={`type-toggle-btn expense${type === 'expense' ? ' active' : ''}`} onClick={() => { setType('expense'); setCategory('dining'); }}>
            Expense
          </button>
          <button className={`type-toggle-btn income${type === 'income' ? ' active' : ''}`} onClick={() => { setType('income'); setCategory('income'); }}>
            Income
          </button>
        </div>

        {/* Amount */}
        <div className="input-group mb-4">
          <label className="input-label">Amount</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-on-surface-variant)' }}>₹</span>
            <input
              type="number"
              className="input-field"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              style={{ paddingLeft: '32px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.375rem' }}
            />
          </div>
        </div>

        {/* Title */}
        <div className="input-group mb-4">
          <label className="input-label">Description</label>
          <input type="text" className="input-field" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Swiggy order" />
        </div>

        {/* Date */}
        <div className="input-group mb-4">
          <label className="input-label">Date</label>
          <div style={{ position: 'relative' }}>
            <span className="material-icons-round" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-outline)', fontSize: 20, pointerEvents: 'none', zIndex: 1 }}>calendar_today</span>
            <input
              type="date"
              className="input-field"
              value={date}
              onChange={e => setDate(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              style={{ paddingLeft: 40, colorScheme: 'light dark' }}
            />
          </div>
        </div>

        {/* Category */}
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
        <div className="mb-5">
          <div className="input-label mb-2">Payment Method</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { id: 'cash',        icon: 'payments',        label: 'Cash' },
              { id: 'card',        icon: 'credit_card',     label: 'Card' },
              { id: 'upi',         icon: 'phone_android',   label: 'UPI' },
              { id: 'netbanking',  icon: 'account_balance', label: 'Net Banking' },
            ].map(pm => (
              <button
                key={pm.id}
                onClick={() => setPaymentMethod(pm.id)}
                style={{
                  flex: '1 1 calc(25% - 6px)',
                  minWidth: 68,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  padding: '10px 6px',
                  borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${paymentMethod === pm.id ? 'var(--color-primary-container)' : 'transparent'}`,
                  background: paymentMethod === pm.id ? 'var(--color-primary-fixed)' : 'var(--color-surface-container-low)',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: paymentMethod === pm.id ? 'var(--color-primary-container)' : 'var(--color-on-surface-variant)',
                }}
              >
                <span className="material-icons-round" style={{ fontSize: 20 }}>{pm.icon}</span>
                {pm.label}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="input-group mb-6">
          <label className="input-label">Note (optional)</label>
          <input type="text" className="input-field" value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note…" />
        </div>

        {/* Submit */}
        <button
          className="btn btn-primary btn-full"
          onClick={handleSubmit}
          disabled={!amount || !title || submitting}
          style={{ opacity: (!amount || !title) ? 0.5 : 1, marginTop: 8 }}
        >
          {submitting
            ? <span className="material-icons-round" style={{ animation: 'spin 0.8s linear infinite' }}>sync</span>
            : <><span className="material-icons-round">{type === 'expense' ? 'remove_circle' : 'add_circle'}</span>Add {type === 'expense' ? 'Expense' : 'Income'}</>
          }
        </button>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
