// RupeeFlow — Firestore-backed data store with per-user transactions + settings
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from './firebase.js';
import { useAuth } from './hooks/useAuth.jsx';

const CATEGORIES = [
  { id: 'dining', label: 'Dining', icon: 'restaurant' },
  { id: 'transport', label: 'Transport', icon: 'directions_car' },
  { id: 'grocery', label: 'Grocery', icon: 'local_grocery_store' },
  { id: 'shopping', label: 'Shopping', icon: 'shopping_bag' },
  { id: 'utilities', label: 'Utilities', icon: 'bolt' },
  { id: 'subscriptions', label: 'Subscriptions', icon: 'play_circle' },
  { id: 'health', label: 'Health', icon: 'favorite' },
  { id: 'income', label: 'Income', icon: 'account_balance' },
  { id: 'entertainment', label: 'Entertainment', icon: 'movie' },
];

const DEFAULT_SETTINGS = {
  budget: 0,
  darkMode: false,
  language: 'en-IN',
  notifications: true,
};

const AppContext = createContext(null);

function formatDate(timestamp) {
  if (!timestamp) return 'Today';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const txDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (txDay.getTime() === today.getTime()) return 'Today';
  if (txDay.getTime() === yesterday.getTime()) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatSubtitle(type, paymentMethod) {
  const method = paymentMethod
    ? paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)
    : type === 'income' ? 'Transfer' : 'Card';
  return method;
}

export function AppProvider({ children }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [userSettings, setUserSettings] = useState(DEFAULT_SETTINGS);
  const [lastSynced, setLastSynced] = useState(null);

  // Real-time listener: transactions
  useEffect(() => {
    if (!user) { setTransactions([]); setDbLoading(false); return; }
    setDbLoading(true);
    const q = query(collection(db, 'users', user.uid, 'transactions'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setTransactions(snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        date: formatDate(d.data().createdAt),
        subtitle: formatSubtitle(d.data().type, d.data().paymentMethod),
      })));
      setDbLoading(false);
      setLastSynced(new Date());
    }, () => setDbLoading(false));
    return unsub;
  }, [user]);

  // Real-time listener: user settings
  useEffect(() => {
    if (!user) { setUserSettings(DEFAULT_SETTINGS); return; }
    const settingsRef = doc(db, 'users', user.uid, 'settings', 'preferences');
    const unsub = onSnapshot(settingsRef, (snap) => {
      if (snap.exists()) {
        setUserSettings(prev => ({ ...prev, ...snap.data() }));
      }
    });
    return unsub;
  }, [user]);

  // Apply dark mode to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', userSettings.darkMode ? 'dark' : 'light');
  }, [userSettings.darkMode]);

  const updateUserSettings = useCallback(async (updates) => {
    if (!user) return;
    const settingsRef = doc(db, 'users', user.uid, 'settings', 'preferences');
    await setDoc(settingsRef, updates, { merge: true });
  }, [user]);

  const updateDisplayName = useCallback(async (name) => {
    if (!user) return;
    await updateProfile(auth.currentUser, { displayName: name });
    await updateUserSettings({ displayName: name });
  }, [user, updateUserSettings]);

  const addTransaction = useCallback(async (tx) => {
    if (!user) return;
    const selectedCat = CATEGORIES.find(c => c.id === tx.category);
    // Use user-selected date if provided, otherwise server timestamp
    let createdAt;
    if (tx.date) {
      // Parse 'YYYY-MM-DD' and set to noon IST to avoid timezone shift
      const [y, m, d] = tx.date.split('-').map(Number);
      createdAt = Timestamp.fromDate(new Date(y, m - 1, d, 12, 0, 0));
    } else {
      createdAt = serverTimestamp();
    }
    await addDoc(collection(db, 'users', user.uid, 'transactions'), {
      title: tx.title,
      amount: tx.type === 'expense' ? -Math.abs(parseFloat(tx.amount)) : Math.abs(parseFloat(tx.amount)),
      category: tx.category,
      type: tx.type,
      icon: selectedCat?.icon || 'receipt',
      note: tx.note || '',
      paymentMethod: tx.paymentMethod || (tx.type === 'income' ? 'upi' : 'card'),
      createdAt,
    });
  }, [user]);

  const deleteTransaction = useCallback(async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'transactions', id));
  }, [user]);

  const updateTransaction = useCallback(async (id, updates) => {
    if (!user) return;
    const selectedCat = CATEGORIES.find(c => c.id === updates.category);
    await updateDoc(doc(db, 'users', user.uid, 'transactions', id), {
      ...(updates.title !== undefined && { title: updates.title }),
      ...(updates.amount !== undefined && { amount: updates.amount }),
      ...(updates.category !== undefined && { category: updates.category }),
      ...(updates.category !== undefined && { icon: selectedCat?.icon || 'receipt' }),
      ...(updates.createdAt !== undefined && { createdAt: updates.createdAt }),
      ...(updates.paymentMethod !== undefined && { paymentMethod: updates.paymentMethod }),
    });
  }, [user]);

  const totalBalance = transactions.reduce((s, t) => s + (t.amount || 0), 0);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = Math.abs(transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0));

  const categoryBreakdown = CATEGORIES
    .filter(c => c.id !== 'income')
    .map(cat => {
      const catTxs = transactions.filter(t => t.category === cat.id);
      const total = Math.abs(catTxs.reduce((s, t) => s + t.amount, 0));
      return { ...cat, total, count: catTxs.length };
    })
    .filter(c => c.total > 0)
    .sort((a, b) => b.total - a.total);

  return (
    <AppContext.Provider value={{
      transactions, dbLoading, lastSynced,
      addTransaction, deleteTransaction, updateTransaction,
      totalBalance, totalIncome, totalExpenses, categoryBreakdown,
      userSettings, updateUserSettings, updateDisplayName,
      CATEGORIES,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppData() { return useContext(AppContext); }
export { CATEGORIES };
