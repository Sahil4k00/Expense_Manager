# 💸 RupeeFlow — Personal Expense Manager

A modern, mobile-first personal expense tracking PWA built with **React + Vite** and powered by **Firebase**. Track your income and expenses, visualize spending trends, and manage your finances on the go.

🌐 **Live Demo:** [https://sahil-expense.web.app](https://sahil-expense.web.app)

---

## ✨ Features

- 🔐 **Authentication** — Secure sign-up & login via Firebase Auth
- ➕ **Add Transactions** — Log income or expense with category, amount, date & payment method
- 📊 **Dashboard** — Overview of balance, income, expenses + 7-day activity bar chart
- 📋 **Activity Log** — Full transaction history with date-based grouping
- 🗑️ **Delete Transactions** — Remove any entry instantly
- 📱 **PWA Support** — Installable on mobile like a native app
- ☁️ **Cloud Sync** — All data synced in real-time via Firestore

---

## 🛠️ Tech Stack

| Tech | Purpose |
|---|---|
| React 19 | UI Framework |
| Vite 8 | Build Tool |
| Firebase Auth | User Authentication |
| Cloud Firestore | Real-time Database |
| Firebase Hosting | Deployment |
| Recharts | Charts & Graphs |
| React Router v7 | Client-side Routing |
| Vite PWA Plugin | Progressive Web App |

---

## 🚀 Getting Started (Local Setup)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/MyExpenseManagerAnti.git
cd MyExpenseManagerAnti
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project.
2. Enable **Authentication** (Email/Password) and **Firestore Database**.
3. Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_PROJECT_ID=your_project_id
VITE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_MESSAGING_SENDER_ID=your_sender_id
VITE_APP_ID=your_app_id
```

4. Update `src/firebase.js` to use these environment variables:

```js
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
};
```

### 4. Run Locally

```bash
npm run dev
```

App will be available at `http://localhost:5173`

---

## 📦 Build & Deploy

```bash
npm run build
firebase deploy
```

---

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components (BottomNav, TransactionRow, etc.)
├── pages/            # App pages (Dashboard, Activity, ManageExpense, Auth)
├── store.jsx         # Global state management (Context API)
├── firebase.js       # Firebase initialization
└── main.jsx          # App entry point
```

---

## 🔒 Security Note

Firebase credentials are stored in a `.env` file and are **not committed to GitHub**.
Make sure your `.env` file is listed in `.gitignore`.

---

## 📄 License

MIT License — feel free to use and modify for personal projects.
