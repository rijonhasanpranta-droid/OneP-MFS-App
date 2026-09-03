# OneP - MFS App সম্পূর্ণ ফোল্ডার স্ট্রাকচার

```
OneP-MFS-App/
│
├── backend/                          # Node.js + Express API
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # PostgreSQL Connection + Prisma
│   │   │   ├── redis.js             # Redis Connection
│   │   │   ├── env.js               # Environment Variables
│   │   │   └── constants.js         # সাধারণ সংখ্যা (ফি, সীমা)
│   │   │
│   │   ├── models/
│   │   │   ├── User.js              # ব্যবহারকারী ডাটা মডেল
│   │   │   ├── Wallet.js            # ওয়ালেট মডেল
│   │   │   ├── Transaction.js       # লেনদেন মডেল
│   │   │   ├── Agent.js             # এজেন্ট মডেল
│   │   │   ├── OTP.js               # OTP মডেল
│   │   │   └── AuditLog.js          # সকল লেনদেনের লগ (১০ বছর)
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js    # OTP + Login + PIN সেট করা
│   │   │   ├── walletController.js  # ব্যালেন্স, ট্রানজেকশন হিস্টরি
│   │   │   ├── p2pController.js     # Send Money (সবচেয়ে গুরুত্বপূর্ণ)
│   │   │   ├── cashInController.js  # Bank থেকে Add Money (SSLCOMMERZ)
│   │   │   ├── cashOutController.js # Agent এর কাছে Cash Out
│   │   │   ├── billPayController.js # বিল পরিশোধ
│   │   │   ├── rechargeController.js# মোবাইল রিচার্জ
│   │   │   ├── kycController.js     # KYC Verification
│   │   │   └── adminController.js   # Admin Dashboard
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── walletRoutes.js
│   │   │   ├── p2pRoutes.js
│   │   │   ├── cashInRoutes.js
│   │   │   ├── cashOutRoutes.js
│   │   │   ├── billPayRoutes.js
│   │   │   ├── rechargeRoutes.js
│   │   │   ├── kycRoutes.js
│   │   │   └── adminRoutes.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js    # JWT Token Verification
│   │   │   ├── rateLimiter.js       # Rate Limiting (প্রতি মিনিটে ৫টা Request)
│   │   │   ├── errorHandler.js      # Error Handling
│   │   │   ├── encryption.js        # AES-256 Encryption/Decryption
│   │   │   └── auditLogger.js       # সব লেনদেনের লগ
│   │   │
│   │   ├── services/
│   │   │   ├── otpService.js        # OTP Generate + Send (Twilio)
│   │   │   ├── authService.js       # Authentication Logic
│   │   │   ├── walletService.js     # Wallet Balance Management
│   │   │   ├── transactionService.js# Database Transaction (Race Condition সমাধান)
│   │   │   ├── encryptionService.js # PIN + সংবেদনশীল ডাটা এনক্রিপশন
│   │   │   ├── sslcommerzService.js # SSLCOMMERZ Integration
│   │   │   ├── billPayService.js    # বিল পরিশোধের API
│   │   │   ├── rechargeService.js   # মোবাইল রিচার্জের API
│   │   │   ├── fraudDetection.js    # জালিয়াতি শনাক্তকরণ
│   │   │   └── qrService.js         # QR Code Generate/Verify
│   │   │
│   │   ├── utils/
│   │   │   ├── validators.js        # ফোন নম্বর, PIN validation
│   │   │   ├── helpers.js           # Common Functions
│   │   │   ├── logger.js            # Logging System
│   │   │   └── errorCodes.js        # সকল Error Codes
│   │   │
│   │   ├── database/
│   │   │   ├── schema.prisma        # Prisma Schema (সব টেবিল)
│   │   │   └── migrations/          # Database Migrations
│   │   │
│   │   └── app.js                   # Main Express App
│   │
│   ├── .env.example                 # Environment Variables Template
│   ├── .env                          # আসল Environment Variables (Git Ignore)
│   ├── package.json                 
│   ├── prisma.json
│   └── server.js                    # Server Entry Point
│
├── flutter_user_app/                 # User Mobile App
│   ├── lib/
│   │   ├── main.dart                # App Entry Point
│   │   ├── screens/
│   │   │   ├── auth/
│   │   │   │   ├── phone_login_screen.dart
│   │   │   │   ├── otp_verification_screen.dart
│   │   │   │   ├── pin_setup_screen.dart
│   │   │   │   └── pin_verification_screen.dart
│   │   │   ├── home/
│   │   │   │   ├── home_screen.dart
│   │   │   │   ├── wallet_screen.dart
│   │   │   │   └── transaction_history_screen.dart
│   │   │   ├── p2p/
│   │   │   │   ├── send_money_screen.dart
│   │   │   │   ├── receiver_selection_screen.dart
│   │   │   │   └── confirmation_screen.dart
│   │   │   ├── cash_in/
│   │   │   │   ├── add_money_screen.dart
│   │   │   │   └── bank_selection_screen.dart
│   │   │   ├── cash_out/
│   │   │   │   ├── agent_selection_screen.dart
│   │   │   │   └── qr_scan_screen.dart
│   │   │   ├── bills/
│   │   │   │   ├── bill_payment_screen.dart
│   │   │   │   └── bill_history_screen.dart
│   │   │   ├── kyc/
│   │   │   │   ├── nid_capture_screen.dart
│   │   │   │   └── face_verification_screen.dart
│   │   │   └── settings/
│   │   │       └── settings_screen.dart
│   │   │
│   │   ├── services/
│   │   │   ├── api_service.dart     # HTTP Request Handler
│   │   │   ├── auth_service.dart
│   │   │   ├── wallet_service.dart
│   │   │   └── transaction_service.dart
│   │   │
│   │   ├── models/
│   │   │   ├── user_model.dart
│   │   │   ├── wallet_model.dart
│   │   │   ├── transaction_model.dart
│   │   │   └── agent_model.dart
│   │   │
│   │   ├── providers/              # State Management (Provider)
│   │   │   ├── auth_provider.dart
│   │   │   ├── wallet_provider.dart
│   │   │   └── transaction_provider.dart
│   │   │
│   │   ├── widgets/
│   │   │   ├── custom_text_field.dart
│   │   │   ├── custom_button.dart
│   │   │   ├── transaction_card.dart
│   │   │   └── loading_dialog.dart
│   │   │
│   │   └── utils/
│   │       ├── constants.dart
│   │       ├── app_colors.dart
│   │       └── validators.dart
│   │
│   ├── pubspec.yaml
│   └── android/, ios/              # Platform-specific কোড
│
├── flutter_agent_app/               # Agent App (আলাদা)
│   ├── lib/
│   │   ├── screens/
│   │   │   ├── agent_login_screen.dart
│   │   │   ├── agent_dashboard_screen.dart  # Commission দেখা
│   │   │   ├── cash_out_approval_screen.dart
│   │   │   └── qr_generation_screen.dart
│   │   └── services/
│   │
│   └── pubspec.yaml
│
├── admin_panel/                     # React Admin Dashboard
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── UsersManagement.jsx
│   │   │   ├── TransactionReports.jsx
│   │   │   ├── AgentManagement.jsx
│   │   │   ├── KYCReview.jsx
│   │   │   └── SecurityAudit.jsx
│   │   ├── components/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
│
├── docs/
│   ├── API_DOCUMENTATION.md         # সব API এর নিয়ম
│   ├── DATABASE_SCHEMA.md           # Database টেবিল
│   ├── SECURITY_GUIDELINES.md       # সিকিউরিটি গাইডলাইন
│   └── DEPLOYMENT.md                # ডিপ্লয়মেন্ট প্রক্রিয়া
│
├── tests/
│   ├── api.test.js                  # API টেস্টিং
│   └── integration.test.js
│
└── README.md
```

## 📱 টেকনোলজি স্ট্যাক

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: PostgreSQL 15+
- **ORM**: Prisma
- **Cache**: Redis
- **Auth**: JWT
- **Encryption**: bcryptjs (Password), AES-256 (Sensitive Data)

### Frontend (User App)
- **Framework**: Flutter 3.22+
- **State Management**: Provider
- **HTTP**: Dio
- **Local Storage**: Hive
- **Biometric**: local_auth

### Frontend (Agent App)
- **Framework**: Flutter 3.22+
- **QR**: qr_flutter + mobile_scanner

### Admin Panel
- **Framework**: React 18+
- **State**: Redux
- **Charts**: Chart.js

## 🔐 নিরাপত্তা বৈশিষ্ট্য

1. ✅ JWT Token Based Auth
2. ✅ AES-256 Encryption for Sensitive Data
3. ✅ Rate Limiting (5 requests/minute)
4. ✅ SQL Injection Protection (Prisma ORM)
5. ✅ CORS শুধুমাত্র নির্ভরযোগ্য ডোমেইন
6. ✅ Database Transaction with Row Locking
7. ✅ Fraud Detection System
8. ✅ 10 Year Audit Logging

## 🎯 পরবর্তী ধাপ

1. Database Schema তৈরি করুন
2. Authentication API লিখুন
3. Send Money API (সবচেয়ে গুরুত্বপূর্ণ)
4. Flutter UI তৈরি করুন
