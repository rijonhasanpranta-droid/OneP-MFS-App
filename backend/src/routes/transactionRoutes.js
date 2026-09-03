// ===================== OneP MFS - Send Money API (সবচেয়ে গুরুত্বপূর্ণ) =====================

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { rateLimiter } = require('../middleware/rateLimiter');
const { validatePhoneNumber, validateAmount, validatePin } = require('../utils/validators');
const transactionService = require('../services/transactionService');
const { verifyPin } = require('../services/encryptionService');
const { prisma } = require('../config/database');

/**
 * POST /api/v1/transactions/send-money
 * 
 * 💸 Send Money API (P2P Transfer)
 * 
 * Request Body:
 * {
 *   "to_phone": "01712345678",      // প্রাপকের ফোন নম্বর
 *   "amount": 50000,                 // টাকা (পয়সায় নয়)
 *   "pin": "12345",                  // 5 ডিজিট PIN
 *   "message": "উপহার"              // Optional: ট্রান্সফার মেসেজ
 * }
 * 
 * Response Success:
 * {
 *   "success": true,
 *   "status": "SUCCESS",
 *   "trx_id": "TXN202609031234567ABC",
 *   "message": "টাকা সফলভাবে পাঠানো হয়েছে",
 *   "data": {
 *     "amount": 500,
 *     "fee": 2.50,
 *     "total_debit": 502.50,
 *     "receiver": {
 *       "name": "আহমেদ",
 *       "phone": "017****5678"
 *     },
 *     "new_balance": 4500,
 *     "timestamp": "2026-09-03T12:34:56.000Z"
 *   }
 * }
 * 
 * Response Failure:
 * {
 *   "success": false,
 *   "status": "FAILED",
 *   "code": "WALLET_001",
 *   "message": "অপর্যাপ্ত ব্যালেন্স",
 *   "trx_id": "TXN202609031234567ABC"
 * }
 */
router.post(
  '/send-money',
  authMiddleware,
  rateLimiter,
  async (req, res) => {
    const { to_phone, amount, pin, message } = req.body;
    const userId = req.user.id;

    try {
      // ========== ১. ইনপুট ভ্যালিডেশন ==========
      
      // ফোন নম্বর ভ্যালিডেশন
      if (!validatePhoneNumber(to_phone)) {
        return res.status(400).json({
          success: false,
          code: 'AUTH_001',
          message: 'অবৈধ ফোন নম্বর'
        });
      }

      // একই ফোন নম্বরে পাঠানোর চেষ্টা
      const senderUser = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (senderUser.phone === to_phone) {
        return res.status(400).json({
          success: false,
          code: 'TXN_001',
          message: 'নিজের একাউন্টে টাকা পাঠাতে পারবেন না'
        });
      }

      // অ্যামাউন্ট ভ্যালিডেশন
      if (!validateAmount(amount * 100)) { // Taka থেকে Paisa তে
        return res.status(400).json({
          success: false,
          code: 'TXN_001',
          message: `সর্বনিম্ম ১০০ টাকা এবং সর্বোচ্চ ৫০,০০০ টাকা পাঠাতে পারবেন`
        });
      }

      // PIN ভ্যালিডেশন
      if (!validatePin(pin)) {
        return res.status(400).json({
          success: false,
          code: 'AUTH_005',
          message: 'ভুল PIN ফর্ম্যাট (5 ডিজিট)'
        });
      }

      // ========== २. PIN ভেরিফাই করা ==========
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { pin_hash: true }
      });

      if (!user || !user.pin_hash) {
        return res.status(403).json({
          success: false,
          code: 'AUTH_004',
          message: 'PIN সেট করা হয়নি - প্রথমে PIN সেট করুন'
        });
      }

      const isPinCorrect = await verifyPin(pin, user.pin_hash);
      if (!isPinCorrect) {
        // PIN wrong attempt track করা (fraud detection এর জন্য)
        // ... log this attempt ...
        return res.status(403).json({
          success: false,
          code: 'AUTH_005',
          message: 'ভুল PIN'
        });
      }

      // ========== ३. Transaction Service কল করা ==========
      const result = await transactionService.sendMoney(
        userId,
        to_phone,
        amount * 100, // Taka থেকে Paisa তে
        pin,
        null // encrypted pin - optional
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      // ========== ४. Success Response ==========
      return res.status(200).json({
        success: true,
        status: result.status,
        trx_id: result.trxId,
        message: 'টাকা সফলভাবে পাঠানো হয়েছে',
        data: {
          amount: amount,
          fee: result.senderTransaction.commission_amount / 100,
          total_debit: result.senderTransaction.total_amount / 100,
          receiver: {
            phone: to_phone.substring(0, 7) + '****'
          },
          new_balance: result.newBalance / 100,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('❌ Send Money API Error:', error);
      return res.status(500).json({
        success: false,
        code: 'ERR_999',
        message: 'সার্ভার তৃটি - দোয়া করুন পরে চেষ্টা করবেন',
        trx_id: req.body.trx_id
      });
    }
  }
);

/**
 * GET /api/v1/transactions/history
 * 
 * 📋 Transaction History API
 */
router.get(
  '/history',
  authMiddleware,
  async (req, res) => {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    try {
      const result = await transactionService.getTransactionHistory(
        userId,
        limit,
        offset
      );

      if (!result.success) {
        return res.status(500).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('❌ Transaction History API Error:', error);
      return res.status(500).json({
        success: false,
        code: 'ERR_999',
        message: 'ট্রানজেকশন হিস্টরি পেতে ব্যর্থ'
      });
    }
  }
);

/**
 * GET /api/v1/transactions/:trxId
 * 
 * 🔍 Transaction Detail API
 */
router.get(
  '/:trxId',
  authMiddleware,
  async (req, res) => {
    const { trxId } = req.params;

    try {
      const result = await transactionService.getTransactionDetail(trxId);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('❌ Transaction Detail API Error:', error);
      return res.status(500).json({
        success: false,
        code: 'ERR_999',
        message: 'ট্রানজেকশন ডিটেইল পেতে ব্যর্থ'
      });
    }
  }
);

module.exports = router;
