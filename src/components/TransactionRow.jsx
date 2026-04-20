import { useNavigate } from 'react-router-dom';

export default function TransactionRow({ transaction, showChip = false, showDate = false, delay = 0 }) {
  const navigate = useNavigate();
  const isIncome = transaction.type === 'income';

  // subtitle = payment method (e.g. "Card", "Upi", "Cash")
  // date     = "Today", "Yesterday", "3 Apr" etc.
  const secondLine = showDate ? transaction.date : transaction.subtitle;

  return (
    <div
      className={`transaction-row animate-fade-up delay-${delay}`}
      onClick={() => navigate(`/manage/${transaction.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/manage/${transaction.id}`)}
    >
      <div className={`transaction-icon ${isIncome ? 'income' : 'expense'}`}>
        <span className="material-icons-round">{transaction.icon || 'receipt'}</span>
      </div>
      <div className="transaction-info">
        <div className="transaction-title">{transaction.title}</div>
        {secondLine && (
          <div className="transaction-subtitle">{secondLine}</div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
        <span className={`transaction-amount ${isIncome ? 'positive' : 'negative'}`}>
          {isIncome ? '+' : '−'}₹{Math.abs(transaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        {showChip && (
          <span className={`chip ${isIncome ? 'chip-income' : 'chip-expense'}`}>
            {transaction.category}
          </span>
        )}
      </div>
    </div>
  );
}
