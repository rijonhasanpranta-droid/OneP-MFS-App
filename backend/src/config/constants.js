// ===================== OneP MFS - সব ধ্রুবক =====================

// 1. ফি এবং কমিশন (টাকায়)
const FEES = {
  SEND_MONEY: {
    PERCENTAGE: 0.5,      // ০.৫% ফি
    MIN_FEE: 50,          // কমপক্ষে ৫০ পয়সা
    MAX_FEE: 5000         // সর্বোচ্চ ৫০ টাকা
  },
  CASH_OUT: {
    AGENT_COMMISSION: 1.0, // এজেন্ট ১% পায়
    PLATFORM_FEE: 0.5     // প্ল্যাটফর্ম ০.৫% নেয়
  },
  CASH_IN: {
    BANK_FEE: 10,         // ব্যাংক থেকে ১০ টাকা খরচ
    PLATFORM_FEE: 0       // প্ল্যাটফর্ম কোনো ফি নেয় না
  }
};

// 2. লিমিট (পয়সায় - ১ টাকা = ১০০ পয়সা)
const LIMITS = {
  DAILY_SEND_LIMIT: 50000 * 100,      // ৫০০০ টাকা
  MONTHLY_SEND_LIMIT: 500000 * 100,   // ৫ লক্ষ টাকা
  MIN_SEND_AMOUNT: 100 * 100,          // সর্বনিম্ন ১০ টাকা
  MAX_SEND_AMOUNT: 50000 * 100,        // সর্বোচ্চ ৫০০০ টাকা
  MIN_CASH_IN: 500 * 100,              // সর্বনিম্ম ৫০০ টাকা
  MAX_CASH_IN: 50000 * 100,            // সর্বোচ্চ ৫০০০ টাকা
  MIN_CASH_OUT: 1000 * 100,            // সর্বনিম্ম ১০০০ টাকা
  MAX_CASH_OUT: 50000 * 100            // সর্বোচ্চ ৫০০০ টাকা
};

// 3. PIN এবং OTP
const PIN_OTP = {
  PIN_LENGTH: 5,                // ৫ ডিজিট PIN
  OTP_LENGTH: 6,                // ৬ ডিজিট OTP
  OTP_EXPIRY: 5 * 60,          // ৫ মিনিট (সেকেন্ডে)
  OTP_MAX_ATTEMPTS: 3,         // ৩ বার ভুল হলে লক
  OTP_RESEND_DELAY: 30        // ৩০ সেকেন্ড পর পুনরায় পাঠানো যাবে
};

// 4. KYC এবং যাচাইকরণ
const KYC = {
  NID_LENGTH: 17,              // বাংলাদেশে ১৭ ডিজিট NID
  FACE_MATCH_THRESHOLD: 0.95  // ৯৫% মিল হতে হবে
};

// 5. সিকিউরিটি
const SECURITY = {
  JWT_EXPIRY: '7d',            // JWT টোকেন ৭ দিন বৈধ
  REFRESH_TOKEN_EXPIRY: '30d',  // রিফ্রেশ টোকেন ৩০ দিন
  ENCRYPTION_ALGORITHM: 'aes-256-cbc', // AES-256 এনক্রিপশন
  RATE_LIMIT: {
    WINDOW: 60 * 1000,          // 1 মিনিট (মিলিসেকেন্ডে)
    MAX_REQUESTS: 5             // প্রতি মিনিটে ৫টা Request
  },
  MAX_LOGIN_ATTEMPTS: 5,        // ৫ বার ভুল লগইন = লক
  LOCKOUT_DURATION: 30 * 60    // ৩০ মিনিট লক (সেকেন্ডে)
};

// 6. ট্রানজেকশন স্ট্যাটাস
const TXN_STATUS = {
  PENDING: 'PENDING',           // অপেক্ষমাণ
  SUCCESS: 'SUCCESS',           // সফল
  FAILED: 'FAILED',             // ব্যর্থ
  CANCELLED: 'CANCELLED'        // বাতিল
};

// 7. ট্রানজেকশন ধরন
const TXN_TYPE = {
  SEND: 'SEND',                 // P2P Transfer
  RECEIVE: 'RECEIVE',           // P2P Receive
  CASH_IN: 'CASH_IN',           // Bank থেকে Add
  CASH_OUT: 'CASH_OUT',         // Agent এর কাছে
  BILL_PAY: 'BILL_PAY',         // বিল পরিশোধ
  RECHARGE: 'RECHARGE',         // মোবাইল রিচার্জ
  REFUND: 'REFUND'              // রিফান্ড
};

// 8. Error কোড এবং বার্তা
const ERROR_CODES = {
  // Authentication
  AUTH_001: { code: 'AUTH_001', message: 'অবৈধ ফোন নম্বর', status: 400 },
  AUTH_002: { code: 'AUTH_002', message: 'OTP মেয়াদ শেষ হয়ে গেছে', status: 400 },
  AUTH_003: { code: 'AUTH_003', message: 'ভুল OTP', status: 400 },
  AUTH_004: { code: 'AUTH_004', message: 'অ্যাকাউন্ট লক আছে', status: 403 },
  AUTH_005: { code: 'AUTH_005', message: 'ভুল PIN', status: 400 },
  
  // Wallet
  WALLET_001: { code: 'WALLET_001', message: 'অপর্যাপ্ত ব্যালেন্স', status: 400 },
  WALLET_002: { code: 'WALLET_002', message: 'ওয়ালেট লক আছে', status: 403 },
  WALLET_003: { code: 'WALLET_003', message: 'দৈনিক লিমিট অতিক্রম করেছে', status: 400 },
  WALLET_004: { code: 'WALLET_004', message: 'মাসিক লিমিট অতিক্রম করেছে', status: 400 },
  
  // Transaction
  TXN_001: { code: 'TXN_001', message: 'সর্বনিম্ম পরিমাণের চেয়ে কম', status: 400 },
  TXN_002: { code: 'TXN_002', message: 'সর্বোচ্চ পরিমাণের চেয়ে বেশি', status: 400 },
  TXN_003: { code: 'TXN_003', message: 'ট্রানজেকশন ব্যর্থ', status: 500 },
  TXN_004: { code: 'TXN_004', message: 'প্রাপক খুঁজে পাওয়া যায়নি', status: 404 },
  
  // KYC
  KYC_001: { code: 'KYC_001', message: 'KYC যাচাই করা হয়নি', status: 403 },
  KYC_002: { code: 'KYC_002', message: 'NID যাচাই ব্যর্থ', status: 400 },
  KYC_003: { code: 'KYC_003', message: 'মুখ মিল ব্যর্থ', status: 400 },
  
  // General
  ERR_001: { code: 'ERR_001', message: 'অনুরোধ অবৈধ', status: 400 },
  ERR_002: { code: 'ERR_002', message: 'অনুমতি নেই', status: 403 },
  ERR_003: { code: 'ERR_003', message: 'রিসোর্স খুঁজে পাওয়া যায়নি', status: 404 },
  ERR_999: { code: 'ERR_999', message: 'সার্ভার ত্রুটি', status: 500 }
};

// 9. বাংলাদেশের মোবাইল অপারেটর (রিচার্জের জন্য)
const OPERATORS = {
  GRAMEENPHONE: { name: 'Grameenphone', code: 'GP', prefix: ['01111', '01711'] },
  BANGLALINK: { name: 'Banglalink', code: 'BL', prefix: ['01211', '01911'] },
  ROBI: { name: 'Robi', code: 'RB', prefix: ['01611', '01811'] },
  TELETALK: { name: 'Teletalk', code: 'TT', prefix: ['01711', '01811'] }
};

// 10. বিল পরিশোধের ক্যাটাগরি
const BILL_CATEGORIES = {
  ELECTRICITY: { code: 'EL', name: 'বিদ্যুৎ বিল' },
  GAS: { code: 'GS', name: 'গ্যাস বিল' },
  WATER: { code: 'WR', name: 'পানি বিল' },
  INTERNET: { code: 'IT', name: 'ইন্টারনেট বিল' },
  INSURANCE: { code: 'IN', name: 'বীমা' }
};

module.exports = {
  FEES,
  LIMITS,
  PIN_OTP,
  KYC,
  SECURITY,
  TXN_STATUS,
  TXN_TYPE,
  ERROR_CODES,
  OPERATORS,
  BILL_CATEGORIES
};
