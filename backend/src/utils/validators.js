// ===================== OneP MFS - ডাটা ভ্যালিডেশন =====================

const { LIMITS, PIN_OTP, KYC, OPERATORS } = require('../config/constants');

// 1. ফোন নম্বর ভ্যালিডেশন (বাংলাদেশ ফরম্যাট)
function validatePhoneNumber(phone) {
  // ফরম্যাট: 01XXXXXXXXX (11 ডিজিট) বা +8801XXXXXXXXX
  const phoneRegex = /^(\+88)?01[3-9]\d{8}$/;
  return phoneRegex.test(phone);
}

// 2. PIN ভ্যালিডেশন (৫ ডিজিট)
function validatePin(pin) {
  if (!pin || typeof pin !== 'string') return false;
  const pinRegex = /^\d{5}$/;
  return pinRegex.test(pin);
}

// 3. NID ভ্যালিডেশন (১৭ ডিজিট)
function validateNID(nid) {
  if (!nid || typeof nid !== 'string') return false;
  // বাংলাদেশ NID: ১৭ ডিজিট
  const nidRegex = /^\d{17}$/;
  return nidRegex.test(nid);
}

// 4. OTP ভ্যালিডেশন (৬ ডিজিট)
function validateOTP(otp) {
  if (!otp || typeof otp !== 'string') return false;
  const otpRegex = /^\d{6}$/;
  return otpRegex.test(otp);
}

// 5. টাকার পরিমাণ ভ্যালিডেশন
function validateAmount(amount, minAmount = LIMITS.MIN_SEND_AMOUNT, maxAmount = LIMITS.MAX_SEND_AMOUNT) {
  if (typeof amount !== 'number' || amount <= 0) return false;
  if (amount < minAmount || amount > maxAmount) return false;
  return true;
}

// 6. Email ভ্যালিডেশন
function validateEmail(email) {
  if (!email) return true; // Optional field
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 7. অপারেটর নির্ধারণ (ফোন নম্বর থেকে)
function detectOperator(phone) {
  const cleanPhone = phone.replace(/^\+88/, '0');
  
  for (const [key, operator] of Object.entries(OPERATORS)) {
    for (const prefix of operator.prefix) {
      if (cleanPhone.startsWith(prefix)) {
        return operator;
      }
    }
  }
  return null;
}

// 8. ঠিকানা ভ্যালিডেশন
function validateAddress(address) {
  if (!address || typeof address !== 'string') return false;
  return address.length >= 10 && address.length <= 255;
}

// 9. নাম ভ্যালিডেশন
function validateName(name) {
  if (!name || typeof name !== 'string') return false;
  const nameRegex = /^[a-zA-Z\u0980-\u09FF\s]{3,100}$/; // ইংরেজি, বাংলা, স্পেস
  return nameRegex.test(name);
}

// 10. Transaction ID ফরম্যাট তৈরি
function generateTransactionId() {
  // ফরম্যাট: TXN20260903123456789ABC (TXN + YYYYMMDD + Random)
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 15).toUpperCase();
  return `TXN${dateStr}${randomStr}`;
}

// 11. Reference নম্বর তৈরি (Bill Pay, Recharge এর জন্য)
function generateReferenceNumber() {
  return `REF${Date.now()}${Math.random().toString(36).substring(2, 8)}`;
}

// 12. QR Code ডাটা তৈরি (এজেন্ট Cash Out এর জন্য)
function generateQRData(agentId, amount) {
  // ফরম্যাট: ONEP|{agentId}|{amount}|{timestamp}
  const timestamp = Date.now();
  return `ONEP|${agentId}|${amount}|${timestamp}`;
}

// 13. QR Code ডাটা পার্স করা
function parseQRData(qrString) {
  try {
    const parts = qrString.split('|');
    if (parts[0] !== 'ONEP' || parts.length !== 4) {
      return null;
    }
    return {
      agentId: parts[1],
      amount: parseInt(parts[2]),
      timestamp: parseInt(parts[3])
    };
  } catch (error) {
    return null;
  }
}

// 14. সেফ সংখ্যা পার্সিং
function parseSafeInteger(value) {
  const num = parseInt(value);
  if (isNaN(num)) return null;
  // JavaScript এ safe max: 2^53 - 1
  if (num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER) {
    return null;
  }
  return num;
}

// 15. পাইসা থেকে টাকায় রূপান্তর
function paisaToTaka(paisa) {
  return paisa / 100;
}

// 16. টাকা থেকে পাইসায় রূপান্তর
function takaToPaisa(taka) {
  return Math.round(taka * 100);
}

module.exports = {
  validatePhoneNumber,
  validatePin,
  validateNID,
  validateOTP,
  validateAmount,
  validateEmail,
  validateAddress,
  validateName,
  detectOperator,
  generateTransactionId,
  generateReferenceNumber,
  generateQRData,
  parseQRData,
  parseSafeInteger,
  paisaToTaka,
  takaToPaisa
};
