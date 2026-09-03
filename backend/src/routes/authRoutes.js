// ===================== OneP MFS - Authentication API =====================
// Phone OTP + PIN Setup + Login

const express = require('express');
const router = express.Router();
const { prisma } = require('../config/database');
const { validatePhoneNumber, validatePin, validateOTP, generateTransactionId } = require('../utils/validators');
const { hashPin, verifyPin, hashPassword, generateRandomToken } = require('../services/encryptionService');
const { PIN_OTP } = require('../config/constants');
const jwt = require('jsonwebtoken');

/**
 * POST /api/v1/auth/send-otp
 * 📱 Send OTP to Phone Number
 * 
 * Request: { "phone": "01712345678" }
 * Response: { "success": true, "message": "OTP পাঠানো হয়েছে", "phone": "017123****" }
 */
router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;

  try {
    // ফোন নম্বর ভ্যালিডেশন
    if (!validatePhoneNumber(phone)) {
      return res.status(400).json({
        success: false,
        code: 'AUTH_001',
        message: 'অবৈধ ফোন নম্বর'
      });
    }

    // OTP জেনারেট করা (6 ডিজিট)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + PIN_OTP.OTP_EXPIRY * 1000);

    // ডেটাবেসে OTP সেভ করা
    await prisma.otp.create({
      data: {
        phone,
        code: otp,
        expires_at: expiresAt
      }
    });

    // TODO: Twilio বা SSL SMS দিয়ে OTP পাঠাবে
    // const sent = await twilioClient.messages.create({
    //   body: `আপনার OneP OTP: ${otp}`,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phone
    // });

    console.log(`✅ OTP sent to ${phone}: ${otp}`);

    return res.status(200).json({
      success: true,
      message: 'OTP পাঠানো হয়েছে আপনার ফোনে',
      phone: phone.substring(0, 7) + '****',
      expiresIn: PIN_OTP.OTP_EXPIRY
    });
  } catch (error) {
    console.error('❌ Send OTP Error:', error);
    return res.status(500).json({
      success: false,
      code: 'ERR_999',
      message: 'OTP পাঠাতে ব্যর্থ'
    });
  }
});

/**
 * POST /api/v1/auth/verify-otp
 * ✅ Verify OTP and Create/Login User
 * 
 * Request: { "phone": "01712345678", "otp": "123456" }
 * Response: { "success": true, "token": "JWT_TOKEN", "user": {...} }
 */
router.post('/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;

  try {
    // ফোন এবং OTP ভ্যালিডেশন
    if (!validatePhoneNumber(phone) || !validateOTP(otp)) {
      return res.status(400).json({
        success: false,
        code: 'AUTH_001',
        message: 'অবৈধ ফোন নম্বর বা OTP'
      });
    }

    // ডেটাবেসে OTP চেক করা
    const otpRecord = await prisma.otp.findFirst({
      where: {
        phone,
        code: otp,
        is_used: false
      },
      orderBy: { created_at: 'desc' }
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        code: 'AUTH_003',
        message: 'ভুল OTP'
      });
    }

    // OTP এক্সপায়ার চেক করা
    if (new Date() > otpRecord.expires_at) {
      return res.status(400).json({
        success: false,
        code: 'AUTH_002',
        message: 'OTP মেয়াদ শেষ হয়ে গেছে'
      });
    }

    // OTP ব্যবহৃত হিসাবে মার্ক করা
    await prisma.otp.update({
      where: { id: otpRecord.id },
      data: { is_used: true }
    });

    // ইউজার খুঁজা অথবা তৈরি করা
    let user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user) {
      // নতুন ইউজার তৈরি করা
      user = await prisma.user.create({
        data: {
          phone,
          name: '', // ইউজার নিজে পরে আপডেট করবে
          wallets: {
            create: {
              balance: 0,
              is_locked: false
            }
          }
        },
        include: { wallets: true }
      });

      // প্রথম লগইনের জন্য PIN সেট করতে হবে
      return res.status(200).json({
        success: true,
        message: 'নতুন অ্যাকাউন্ট তৈরি হয়েছে - এখন PIN সেট করুন',
        user: {
          id: user.id,
          phone: user.phone,
          pin_set: false
        },
        require_pin_setup: true
      });
    } else if (!user.pin_hash) {
      // ইউজার আছে কিন্তু PIN নেই
      return res.status(200).json({
        success: true,
        message: 'PIN সেট করুন',
        user: {
          id: user.id,
          phone: user.phone,
          pin_set: false
        },
        require_pin_setup: true
      });
    }

    // JWT টোকেন জেনারেট করা
    const token = jwt.sign(
      { id: user.id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'লগইন সফল',
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        kyc_status: user.kyc_status
      }
    });
  } catch (error) {
    console.error('❌ Verify OTP Error:', error);
    return res.status(500).json({
      success: false,
      code: 'ERR_999',
      message: 'OTP যাচাই করতে ব্যর্থ'
    });
  }
});

/**
 * POST /api/v1/auth/set-pin
 * 🔐 Set or Update PIN (5 digits)
 * 
 * Request: { "phone": "01712345678", "pin": "12345", "confirm_pin": "12345" }
 * Response: { "success": true, "message": "PIN সেট হয়েছে" }
 */
router.post('/set-pin', async (req, res) => {
  const { phone, pin, confirm_pin } = req.body;

  try {
    // PIN ভ্যালিডেশন
    if (!validatePin(pin) || !validatePin(confirm_pin)) {
      return res.status(400).json({
        success: false,
        code: 'AUTH_005',
        message: 'PIN অবশ্যই 5 ডিজিট হতে হবে'
      });
    }

    if (pin !== confirm_pin) {
      return res.status(400).json({
        success: false,
        code: 'AUTH_005',
        message: 'PIN মিল খায় না'
      });
    }

    // ইউজার খুঁজা
    const user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        code: 'ERR_003',
        message: 'ইউজার খুঁজে পাওয়া যায়নি'
      });
    }

    // PIN হ্যাশ করা এবং সেভ করা
    const pinHash = await hashPin(pin);
    await prisma.user.update({
      where: { id: user.id },
      data: { pin_hash: pinHash }
    });

    return res.status(200).json({
      success: true,
      message: 'PIN সফলভাবে সেট হয়েছে'
    });
  } catch (error) {
    console.error('❌ Set PIN Error:', error);
    return res.status(500).json({
      success: false,
      code: 'ERR_999',
      message: 'PIN সেট করতে ব্যর্থ'
    });
  }
});

/**
 * POST /api/v1/auth/verify-pin
 * 🔑 Verify PIN for Sensitive Operations
 * 
 * Request: { "pin": "12345" }
 * Response: { "success": true, "temp_token": "TEMP_TOKEN" }
 */
router.post('/verify-pin', async (req, res) => {
  const { pin } = req.body;
  const userId = req.user?.id; // JWT থেকে আসবে

  try {
    if (!validatePin(pin)) {
      return res.status(400).json({
        success: false,
        code: 'AUTH_005',
        message: 'অবৈধ PIN'
      });
    }

    // ইউজার খুঁজা
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pin_hash: true }
    });

    if (!user || !user.pin_hash) {
      return res.status(403).json({
        success: false,
        code: 'AUTH_004',
        message: 'PIN সেট করা হয়নি'
      });
    }

    // PIN যাচাই করা
    const isPinCorrect = await verifyPin(pin, user.pin_hash);
    if (!isPinCorrect) {
      return res.status(403).json({
        success: false,
        code: 'AUTH_005',
        message: 'ভুল PIN'
      });
    }

    // সফল - টেম্পরারি টোকেন জেনারেট করা (সংবেদনশীল অপারেশনের জন্য)
    const tempToken = jwt.sign(
      { id: userId, action: 'sensitive_operation' },
      process.env.JWT_SECRET,
      { expiresIn: '5m' } // 5 মিনিটের জন্য বৈধ
    );

    return res.status(200).json({
      success: true,
      message: 'PIN যাচাই সফল',
      temp_token: tempToken
    });
  } catch (error) {
    console.error('❌ Verify PIN Error:', error);
    return res.status(500).json({
      success: false,
      code: 'ERR_999',
      message: 'PIN যাচাই ব্যর্থ'
    });
  }
});

/**
 * POST /api/v1/auth/logout
 * 🚪 Logout
 */
router.post('/logout', async (req, res) => {
  // Token বাতিল করার লজিক (Redis blacklist ব্যবহার করতে পারেন)
  return res.status(200).json({
    success: true,
    message: 'লগআউট সফল'
  });
});

module.exports = router;
