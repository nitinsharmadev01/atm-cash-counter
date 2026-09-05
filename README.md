**Live Application & Test Credentials**
# Live Demo URL - https://atm-cash-counter.vercel.app/
Email - usera@gmail.com
Password - 123456

Email - userb@gmail.com
Password - 123456


# ATM Cash Counter System (MERN Stack)

A production-style, feature-rich ATM Cash Counter web application built using the **MERN stack** (MongoDB, Express.js, React.js, Node.js). This system handles dynamic cash distribution, secure cookie-based authentication, race-condition handling, and robust offline-first synchronization using IndexedDB.

---

## Features & Implementation

### 1. Dynamic Cash Distribution Algorithm
* The ATM calculates a balanced combination of notes across multiple denominations ($\rupee 2,000, \rupee 500, \rupee 200, \rupee 100, \rupee 50$) instead of exhausting a single denomination.
* Ensures exact amount matching, inventory bounds checking, and optimal note counting.

### 2. Secure Authentication & Session Expiration
* **Cookie-based Sessions**: Uses HTTP-only, secure, and properly configured  (no credentials stored in `localStorage` or `sessionStorage`).
* **Server-Side Inactivity Expiration**: Automatically expires sessions after 10 minutes of server-enforced inactivity, redirecting unauthorized requests back to login.
* Passwords are securely hashed using bcrypt before saving to MongoDB.

### 3. Concurrency & Race-Condition Handling
* Safe handling of simultaneous withdrawals using MongoDB transactions, atomic operations, and conditional updates to prevent negative balances or inconsistent state during heavy loads.

### 4. Offline-First Support & Auto-Sync
* **Offline Operations**: Local caching of ATM inventory allows valid withdrawals even when offline.
* **IndexedDB**: Queues offline transactions locally (persisting through page refreshes).
* **Automatic Synchronization**: Detects network restoration, validates pending transactions against the server, and updates the local sync queue badge count in real-time.
* **Idempotency**: Utilizes unique `syncId` identifiers to prevent duplicate withdrawals on server re-sync.

### 5. Detailed Transaction History & Withdrawal Result
* Comprehensive transaction logs with pagination support.
* Instant withdrawal receipt modal displaying breakdown of notes dispensed, previous balance, updated balance, transaction ID, and status.

---

## 🛠️ Tech Stack

* **Frontend**: React.js, React-Bootstrap, Zustand (State Management), IndexedDB (Offline Storage)
* **Backend**: Node.js, Express.js
* **Database**: MongoDB (Mongoose)
* **Deployment**: Vercel
* **Version Control**: GitHub

---

## ⚙️ Environment Variables

Create a `.env` file in both the backend and frontend directories with the necessary configuration:

### Backend (`.env`)
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

