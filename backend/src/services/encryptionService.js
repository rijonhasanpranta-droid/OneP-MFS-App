// ===================== OneP MFS - এনক্রিপশন সেবা =====================
// PIN, Phone Number এবং সংবেদনশীল ডাটা সুরক্ষিত রাখা

const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-256bits-change-me-in-production';
const IV_LENGTH = 16; // 128 bits

// 1. PIN হ্যাশ করা (বিপরীত সম্ভব নয় - শুধু তুলনার জন্য)
async function hashPin(pin) {
  try {
    // bcrypt ব্যবহার করে সিকিউর হ্যাশিং
    const salt = await bcrypt.genSalt(10);
    const pinHash = await bcrypt.hash(pin, salt);
    return pinHash;
  } catch (error) {
    console.error('❌ PIN হ্যাশিং ব্যর্থ:', error);
    throw new Error('PIN হ্যাশিং ব্যর্থ');
  }
}

// 2. PIN যাচাই করা
async function verifyPin(pin, pinHash) {
  try {
    const isMatch = await bcrypt.compare(pin, pinHash);
    return isMatch;
  } catch (error) {
    console.error('❌ PIN যাচাই ব্যর্থ:', error);
    return false;
  }
}

// 3. পাসওয়ার্ড হ্যাশ করা (লগইন পাসওয়ার্ডের জন্য)
async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    console.error('❌ পাসওয়ার্ড হ্যাশিং ব্যর্থ:', error);
    throw new Error('পাসওয়ার্ড হ্যাশিং ব্যর্থ');
  }
}

// 4. পাসওয়ার্ড যাচাই করা
async function verifyPassword(password, passwordHash) {
  try {
    return await bcrypt.compare(password, passwordHash);
  } catch (error) {
    console.error('❌ পাসওয়ার্ড যাচাই ব্যর্থ:', error);
    return false;
  }
}

// 5. AES-256 এনক্রিপশন (ডাটা এনক্রিপ্ট করা)
function encryptAES256(text) {
  try {
    // Random IV তৈরি করা
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Key তৈরি করা (256 bits = 32 bytes)
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    
    // Cipher তৈরি করা
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    // এনক্রিপট করা
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // IV + Encrypted ডাটা একসাথে রিটার্ন করা
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('❌ এনক্রিপশন ব্যর্থ:', error);
    throw new Error('এনক্রিপশন ব্যর্থ');
  }
}

// 6. AES-256 ডিক্রিপশন (ডাটা ডিক্রিপ্ট করা)
function decryptAES256(encryptedText) {
  try {
    // IV এবং Encrypted ডাটা আলাদা করা
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    // Key তৈরি করা
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    
    // Decipher তৈরি করা
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    
    // ডিক্রিপ্ট করা
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('❌ ডিক্রিপশন ব্যর্থ:', error);
    throw new Error('ডিক্রিপশন ব্যর্থ');
  }
}

// 7. ফোন নম্বর এনক্রিপ্ট করা (শুধু শেষ ৪ ডিজিট দেখা যাবে)
function maskPhoneNumber(phone) {
  // ইনপুট: "01712345678" বা "+8801712345678"
  // আউটপুট: "017123****"
  const cleanPhone = phone.replace(/^\+88/, '0');
  return cleanPhone.substring(0, 7) + '****';
}

// 8. NID এনক্রিপ্ট করা (শুধু শেষ ৪ ডিজিট দেখা যাবে)
function maskNID(nid) {
  // ইনপুট: "12345678901234567"
  // আউটপুট: "123456789*******"
  if (!nid || nid.length < 4) return '***';
  return nid.substring(0, nid.length - 4) + '****';
}

// 9. শক্তিশালী Random Token তৈরি করা
function generateRandomToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// 10. HMAC সাক্ষর তৈরি করা (Webhook verification এর জন্য)
function generateHMAC(data, secret = ENCRYPTION_KEY) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(data));
  return hmac.digest('hex');
}

// 11. HMAC যাচাই করা
function verifyHMAC(data, signature, secret = ENCRYPTION_KEY) {
  const expectedSignature = generateHMAC(data, secret);
  // Timing attack প্রতিরোধ করতে timingSafeEqual ব্যবহার করা
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

module.exports = {
  hashPin,
  verifyPin,
  hashPassword,
  verifyPassword,
  encryptAES256,
  decryptAES256,
  maskPhoneNumber,
  maskNID,
  generateRandomToken,
  generateHMAC,
  verifyHMAC
};
