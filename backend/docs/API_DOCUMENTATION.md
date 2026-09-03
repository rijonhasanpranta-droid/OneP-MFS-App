# OneP - MFS App সম্পূর্ণ API ডকুমেন্টেশন

## 📱 BASE URL
```
https://api.onep.com/api/v1
```

---

## 🔐 Authentication Endpoints

### 1. OTP পাঠানো
```
POST /auth/send-otp
Content-Type: application/json

{
  "phone": "01712345678"
}

Response 200:
{
  "success": true,
  "message": "OTP পাঠানো হয়েছে আপনার ফোনে",
  "phone": "017123****",
  "expiresIn": 300
}
```

### 2. OTP যাচাই + লগইন
```
POST /auth/verify-otp
Content-Type: application/json

{
  "phone": "01712345678",
  "otp": "123456"
}

Response 200:
{
  "success": true,
  "message": "লগইন সফল",
  "token": "eyJhbGc...",
  "user": {
    "id": "user123",
    "phone": "01712345678",
    "name": "আহমেদ",
    "kyc_status": "VERIFIED"
  }
}
```

### 3. PIN সেট করা
```
POST /auth/set-pin
Content-Type: application/json

{
  "phone": "01712345678",
  "pin": "12345",
  "confirm_pin": "12345"
}

Response 200:
{
  "success": true,
  "message": "PIN সফলভাবে সেট হয়েছে"
}
```

---

## 💰 Wallet Endpoints

### 1. ব্যালেন্স চেক করা
```
GET /wallet/balance
Authorization: Bearer {TOKEN}

Response 200:
{
  "success": true,
  "balance": 50000,
  "currency": "BDT",
  "daily_limit": 50000,
  "monthly_limit": 500000,
  "daily_sent_today": 10000,
  "is_locked": false
}
```

### 2. ওয়ালেট বিস্তারিত
```
GET /wallet/details
Authorization: Bearer {TOKEN}

Response 200:
{
  "success": true,
  "wallet": {
    "balance": 50000,
    "total_sent": 100000,
    "total_received": 150000,
    "daily_limit": 50000,
    "monthly_limit": 500000,
    "daily_sent_today": 10000,
    "is_locked": false,
    "created_at": "2026-09-01T10:00:00Z"
  },
  "user": {
    "id": "user123",
    "name": "আহমেদ",
    "phone": "01712345678",
    "kyc_status": "VERIFIED",
    "is_active": true
  }
}
```

---

## 💸 Transaction Endpoints

### ⭐ 1. Send Money (P2P Transfer) - সবচেয়ে গুরুত্বপূর্ণ
```
POST /transactions/send-money
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "to_phone": "01812345678",
  "amount": 500,
  "pin": "12345",
  "message": "উপহার"
}

Response 200:
{
  "success": true,
  "status": "SUCCESS",
  "trx_id": "TXN202609031234567ABC",
  "message": "টাকা সফলভাবে পাঠানো হয়েছে",
  "data": {
    "amount": 500,
    "fee": 2.50,
    "total_debit": 502.50,
    "receiver": {
      "phone": "018****5678"
    },
    "new_balance": 4500,
    "timestamp": "2026-09-03T12:34:56Z"
  }
}

Response 400 (ব্যর্থতা):
{
  "success": false,
  "status": "FAILED",
  "code": "WALLET_001",
  "message": "অপর্যাপ্ত ব্যালেন্স",
  "trx_id": "TXN202609031234567ABC"
}
```

### 2. Transaction হিস ্টরি
```
GET /transactions/history?limit=20&offset=0
Authorization: Bearer {TOKEN}

Response 200:
{
  "success": true,
  "transactions": [
    {
      "trx_id": "TXN202609031234567ABC",
      "type": "SEND",
      "amount": 500,
      "fee": 2.50,
      "status": "SUCCESS",
      "from_phone": "017****5678",
      "to_phone": "018****5678",
      "created_at": "2026-09-03T12:34:56Z"
    }
  ],
  "total": 150,
  "hasMore": true
}
```

### 3. Transaction ডিটেইল
```
GET /transactions/TXN202609031234567ABC
Authorization: Bearer {TOKEN}

Response 200:
{
  "success": true,
  "transaction": {
    "trx_id": "TXN202609031234567ABC",
    "type": "SEND",
    "amount": 500,
    "fee": 2.50,
    "total": 502.50,
    "status": "SUCCESS",
    "from": {
      "phone": "017****5678",
      "name": "আহমেদ"
    },
    "to": {
      "phone": "018****5678",
      "name": "ফারহান"
    },
    "created_at": "2026-09-03T12:34:56Z",
    "completed_at": "2026-09-03T12:34:58Z"
  }
}
```

---

## 💳 Cash In (Bank থেকে Add Money)

### 1. SSLCOMMERZ এর মাধ্যমে Cash In
```
POST /cash-in/initiate
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "amount": 5000,
  "bank_card": "1234567890123456",
  "description": "Cash In from Bank"
}

Response 200:
{
  "success": true,
  "payment_url": "https://sandbox.sslcommerz.com/gw/v4/checkout/...",
  "session_id": "SSLCZ_TEST123456"
}
```

---

## 🏪 Cash Out (এজেন্টের কাছে)

### 1. এজেন্ট সিলেক্ট করা
```
GET /cash-out/agents?location=Dhaka
Authorization: Bearer {TOKEN}

Response 200:
{
  "success": true,
  "agents": [
    {
      "id": "agent123",
      "shop_name": "রহিমের দোকান",
      "shop_phone": "01700000000",
      "address": "ঢাকা, বাংলাদেশ",
      "qr_code": "ONEP|agent123|..."
    }
  ]
}
```

### 2. Cash Out Request
```
POST /cash-out/request
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "agent_id": "agent123",
  "amount": 1000,
  "pin": "12345"
}

Response 200:
{
  "success": true,
  "trx_id": "COUT202609031234567ABC",
  "qr_code": "ONEP|agent123|1000|1695307200000",
  "message": "QR কোড এজেন্টকে স্ক্যান করান"
}
```

---

## 📱 Mobile Recharge

```
POST /recharge/initiate
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "phone": "01712345678",
  "operator": "GP",
  "amount": 100,
  "pin": "12345"
}

Response 200:
{
  "success": true,
  "trx_id": "RCH202609031234567ABC",
  "message": "রিচার্জ সফল"
}
```

---

## ⚠️ Error Codes

| Code | Message | HTTP Status |
|------|---------|-------------|
| AUTH_001 | অবৈধ ফোন নম্বর | 400 |
| AUTH_002 | OTP মেয়াদ শেষ | 400 |
| AUTH_003 | ভুল OTP | 400 |
| AUTH_004 | অ্যাকাউন্ট লক আছে | 403 |
| AUTH_005 | ভুল PIN | 400 |
| WALLET_001 | অপর্যাপ্ত ব্যালেন্স | 400 |
| WALLET_002 | ওয়ালেট লক আছে | 403 |
| WALLET_003 | দৈনিক লিমিট অতিক্রম | 400 |
| WALLET_004 | মাসিক লিমিট অতিক্রম | 400 |
| TXN_001 | সর্বনিম্ন পরিমাণ চেয়ে কম | 400 |
| TXN_002 | সর্বোচ্চ পরিমাণ চেয়ে বেশি | 400 |
| TXN_003 | ট্রানজেকশন ব্যর্থ | 500 |
| TXN_004 | প্রাপক খুঁজে পাওয়া যায়নি | 404 |
| KYC_001 | KYC যাচাই করা হয়নি | 403 |
| ERR_999 | সার্ভার ত্রুটি | 500 |
