# OneP - MFS App | সম্পূর্ণ Database Schema

## 📊 Database Relationships

```
User (1) ──── (1) Wallet
  ├── (1) ──── (N) Transaction (as from_user)
  ├── (1) ──── (N) Transaction (as to_user)
  ├── (1) ──── (N) OTP
  ├── (1) ──── (N) AuditLog
  └── (0,1) ──── (1) Agent

Wallet (1) ──── (N) Transaction

Agent (1) ──── (1) User
```

---

## 📋 Table: `users`

**Purpose**: সকল ব্যবহারকারীর তথ্য সংরক্ষণ (ব্যক্তিগত + এজেন্ট)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String (CUID) | PRIMARY KEY | অনন্য ব্যবহারকারী ID |
| `phone` | String(20) | UNIQUE, NOT NULL | বাংলাদেশ ফোন নম্বর (01XXXXXXXXX) |
| `name` | String(100) | NOT NULL | ব্যবহারকারীর নাম |
| `email` | String(100) | UNIQUE, NULLABLE | ইমেইল (Optional) |
| `nid` | String(20) | UNIQUE, NULLABLE | জাতীয় পরিচয়পত্র (17 ডিজিট) |
| `pin_hash` | String | NULLABLE | এনক্রিপ্টেড 5 ডিজিট PIN |
| `kyc_status` | Enum | DEFAULT: PENDING | PENDING / VERIFIED / REJECTED |
| `kyc_verified_at` | DateTime | NULLABLE | KYC যাচাই করা সময় |
| `biometric_enabled` | Boolean | DEFAULT: false | Biometric লগইন সক্ষম? |
| `profile_photo_url` | String(255) | NULLABLE | প্রোফাইল ছবির URL |
| `is_active` | Boolean | DEFAULT: true | একাউন্ট সক্রিয়? |
| `is_blocked` | Boolean | DEFAULT: false | একাউন্ট ব্লক করা? (জালিয়াতি) |
| `created_at` | DateTime | DEFAULT: now() | একাউন্ট তৈরির সময় |
| `updated_at` | DateTime | on update: now() | শেষ আপডেটের সময় |

**Indexes**:
```sql
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_kyc_status ON users(kyc_status);
CREATE INDEX idx_users_created_at ON users(created_at);
```

---

## 💰 Table: `wallets`

**Purpose**: প্রতিটি ব্যবহারকারীর অর্থ সংরক্ষণ করা

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String (CUID) | PRIMARY KEY | ওয়ালেট ID |
| `user_id` | String | UNIQUE FK, NOT NULL | ব্যবহারকারী রেফারেন্স |
| `balance` | BigInt | DEFAULT: 0 | ব্যালেন্স (পয়সায়, 1 টাকা = 100 পয়সা) |
| `is_locked` | Boolean | DEFAULT: false | ওয়ালেট লক করা? |
| `locked_reason` | String(255) | NULLABLE | লক করার কারণ |
| `total_sent` | BigInt | DEFAULT: 0 | মোট পাঠানো টাকা |
| `total_received` | BigInt | DEFAULT: 0 | মোট পাওয়া টাকা |
| `daily_limit` | BigInt | DEFAULT: 5000*100 | দৈনিক সীমা (500,000 পয়সা = 5000 টাকা) |
| `monthly_limit` | BigInt | DEFAULT: 50000*100 | মাসিক সীমা (5,000,000 পয়সা = 50,000 টাকা) |
| `daily_sent_today` | BigInt | DEFAULT: 0 | আজ পাঠানো টাকা |
| `created_at` | DateTime | DEFAULT: now() | ওয়ালেট তৈরির সময় |
| `updated_at` | DateTime | on update: now() | শেষ আপডেটের সময় |

**Indexes**:
```sql
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_balance ON wallets(balance);
```

**Important Note**: ⚠️ 
- Balance আপডেট করার সময় **ATOMIC INCREMENT/DECREMENT** ব্যবহার করতে হবে
- Race condition এড়াতে **Database Transaction + Row Lock** আবশ্যক
- কখনও `balance = balance - amount` এইভাবে করবেন না!

---

## 📝 Table: `transactions`

**Purpose**: সকল লেনদেনের রেকর্ড (10 বছরের জন্য সংরক্ষণ - ব্যাংক রেগুলেশন)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String (CUID) | PRIMARY KEY | Transaction ID |
| `trx_id` | String(50) | UNIQUE, NOT NULL | সিস্টেম জেনারেটেড TXN ID (TXN20260903...) |
| `type` | Enum | NOT NULL | SEND / RECEIVE / CASH_IN / CASH_OUT / BILL_PAY / RECHARGE / REFUND |
| `from_user_id` | String | NULLABLE FK | পাঠানোকারীর ID |
| `to_user_id` | String | NULLABLE FK | গ্রহণকারীর ID |
| `from_wallet_id` | String | NULLABLE FK | পাঠানোকারীর ওয়ালেট |
| `to_wallet_id` | String | NULLABLE FK | গ্রহণকারীর ওয়ালেট |
| `amount` | BigInt | NOT NULL | মূল টাকা (পয়সায়) |
| `commission_amount` | BigInt | DEFAULT: 0 | কমিশন/ফি (পয়সায়) |
| `total_amount` | BigInt | NOT NULL | মোট (Amount + Commission) |
| `description` | String(255) | NULLABLE | বর্ণনা (যেমন: "রহিমের দোকানে P2P") |
| `status` | Enum | DEFAULT: PENDING | PENDING / SUCCESS / FAILED / CANCELLED |
| `failure_reason` | String(255) | NULLABLE | ব্যর্থতার কারণ |
| `created_at` | DateTime | DEFAULT: now() | লেনদেনের সময় |
| `updated_at` | DateTime | on update: now() | শেষ আপডেটের সময় |
| `completed_at` | DateTime | NULLABLE | সম্পন্ন সময় |

**Indexes**:
```sql
CREATE INDEX idx_transactions_trx_id ON transactions(trx_id);
CREATE INDEX idx_transactions_from_user ON transactions(from_user_id);
CREATE INDEX idx_transactions_to_user ON transactions(to_user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_type ON transactions(type);
```

---

## 🏪 Table: `agents`

**Purpose**: এজেন্ট ম্যানেজমেন্ট (Cash Out এর জন্য)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String (CUID) | PRIMARY KEY | এজেন্ট ID |
| `user_id` | String | UNIQUE FK, NOT NULL | ব্যবহারকারী রেফারেন্স |
| `shop_name` | String(100) | NOT NULL | দোকানের নাম |
| `shop_phone` | String(20) | NOT NULL | দোকানের ফোন |
| `shop_address` | Text | NOT NULL | দোকানের ঠিকানা |
| `nid_verified` | Boolean | DEFAULT: false | NID যাচাই করা? |
| `commission_balance` | BigInt | DEFAULT: 0 | অর্জিত কমিশন (পয়সায়) |
| `total_commission` | BigInt | DEFAULT: 0 | মোট কমিশন |
| `commission_withdrawn` | BigInt | DEFAULT: 0 | উত্তোলিত কমিশন |
| `qr_code` | String(255) | NULLABLE | QR কোড ডাটা |
| `is_active` | Boolean | DEFAULT: true | এজেন্ট সক্রিয়? |
| `created_at` | DateTime | DEFAULT: now() | এজেন্ট নিয়োগের সময় |
| `updated_at` | DateTime | on update: now() | শেষ আপডেটের সময় |

**Commission Calculation**:
```
Agent Commission = Amount × 1% (কমিশন টাকা থেকে)
Example: 10,000 টাকা Cash Out = 100 টাকা কমিশন
```

---

## 📱 Table: `otps`

**Purpose**: OTP ম্যানেজমেন্ট (লগইন এর জন্য)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String (CUID) | PRIMARY KEY | OTP ID |
| `user_id` | String | NULLABLE FK | ব্যবহারকারী রেফারেন্স (নতুন ইউজার হলে NULL) |
| `phone` | String(20) | NOT NULL | ফোন নম্বর |
| `code` | String(6) | NOT NULL | 6 ডিজিট OTP |
| `is_used` | Boolean | DEFAULT: false | ব্যবহার করা? |
| `attempts` | Int | DEFAULT: 0 | ভুল প্রচেষ্টা |
| `expires_at` | DateTime | NOT NULL | OTP মেয়াদ শেষ সময় (5 মিনিট পর) |
| `created_at` | DateTime | DEFAULT: now() | OTP তৈরির সময় |

**Indexes**:
```sql
CREATE INDEX idx_otps_phone ON otps(phone);
CREATE INDEX idx_otps_expires_at ON otps(expires_at);
```

**OTP Expiry Policy**:
- সময়সীমা: 5 মিনিট
- সর্বোচ্চ প্রচেষ্টা: 3 বার ভুল = লক
- পুনরায় পাঠানোর বিলম্ব: 30 সেকেন্ড

---

## 📊 Table: `audit_logs`

**Purpose**: সকল লেনদেন ও কার্যকলাপের লগ (10 বছর সংরক্ষণ - ব্যাংক কমপ্লায়েন্স)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String (CUID) | PRIMARY KEY | লগ ID |
| `user_id` | String | NOT NULL FK | ব্যবহারকারীর ID |
| `action` | String(100) | NOT NULL | LOGIN / SEND_MONEY / CASH_IN / CASH_OUT / KYC_UPDATE / etc. |
| `transaction_id` | String(50) | NULLABLE | সম্পর্কিত Transaction ID |
| `old_balance` | BigInt | NULLABLE | আগের ব্যালেন্স |
| `new_balance` | BigInt | NULLABLE | নতুন ব্যালেন্স |
| `ip_address` | String(50) | NULLABLE | ব্যবহারকারীর IP |
| `user_agent` | String(255) | NULLABLE | ডিভাইস তথ্য |
| `status` | String(20) | NOT NULL | SUCCESS / FAILED |
| `details` | JSON | NULLABLE | অতিরিক্ত ডাটা (JSON) |
| `created_at` | DateTime | DEFAULT: now() | লগের সময় |

**Indexes**:
```sql
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

**Retention Policy**: ✅
- 10 বছর ধরে সংরক্ষণ করতে হবে (বাংলাদেশ ব্যাংক নিয়ম)
- আর্কাইভ করা ডাটা শীতল স্টোরেজে রাখা যায়

---

## 🚨 Table: `suspicious_activities`

**Purpose**: জালিয়াতি শনাক্তকরণ (Fraud Detection)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String (CUID) | PRIMARY KEY | অ্যাক্টিভিটি ID |
| `user_id` | String | NOT NULL FK | ব্যবহারকারীর ID |
| `activity_type` | String(100) | NOT NULL | MULTIPLE_OTP_FAILURES / LARGE_AMOUNT / RAPID_TRANSACTIONS / etc. |
| `description` | Text | NOT NULL | বিস্তারিত বর্ণনা |
| `risk_score` | Int | DEFAULT: 0 | ঝুঁকি স্কোর (0-100) |
| `is_resolved` | Boolean | DEFAULT: false | সমাধান করা? |
| `created_at` | DateTime | DEFAULT: now() | সময় |
| `updated_at` | DateTime | on update: now() | আপডেটের সময় |

**Risk Scoring**:
- 5 বার OTP ভুল: +30 পয়েন্ট
- মাসিক সীমার 80% ব্যবহার: +20 পয়েন্ট
- অস্বাভাবিক লোকেশন: +25 পয়েন্ট
- দ্রুত একাধিক লেনদেন: +15 পয়েন্ট
- **Risk > 70** = একাউন্ট লক করা (Admin নোটিফিকেশন)

---

## 🔐 Security Considerations

### 1. **PIN Hashing** (bcryptjs)
```
✓ কখনও plain text PIN রাখবেন না
✓ bcrypt salt: 10 rounds
✓ প্রতিবার লেনদেনে PIN ভেরিফাই করা
```

### 2. **Phone Number Masking**
```
✓ Display: 017****5678 (শেষ 4 ডিজিট দৃশ্যমান)
✓ SMS এ সম্পূর্ণ নম্বর পাঠান
```

### 3. **Transaction Atomicity**
```javascript
// ❌ WRONG - Race condition risk
await wallet.update({ balance: wallet.balance - amount });

// ✅ CORRECT - Atomic operation
await wallet.update({
  balance: { decrement: amount }
});
```

### 4. **Database Transaction Isolation**
```sql
-- Prisma তে Transaction:
const result = await prisma.$transaction(async (tx) => {
  // সব অপারেশন এক্সক্লুসিভ লকে
  const wallet = await tx.wallet.findFirst({
    where: { user_id: userId }
  });
  // Safe operations...
}, { isolationLevel: 'READ_COMMITTED' });
```

---

## 📈 Expected Data Volume

```
ActiveUsers: 1,000,000+
DailyTransactions: 10,000,000+
StorageNeeded: ~500 GB (with indices)
Bandwidth: ~10 Mbps peak
```

---

## ✅ Database Setup Instructions

```bash
# 1. Prisma schema generate
npm install
npm run generate

# 2. Database migration
npm run migrate

# 3. Seed test data (optional)
npm run seed

# 4. Create indexes
npm run index
```
