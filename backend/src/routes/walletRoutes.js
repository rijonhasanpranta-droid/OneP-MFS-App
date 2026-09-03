// ===================== OneP MFS - Wallet API =====================
// ব্যালেন্স চেক, ওয়ালেট অথ + লেনদেন হিস্ট্রি

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { prisma } = require('../config/database');

/**
 * GET /api/v1/wallet/balance
 * 💰 Get Wallet Balance
 * 
 * Response: { "success": true, "balance": 50000, "currency": "BDT" }
 */
router.get('/balance', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const wallet = await prisma.wallet.findUnique({
      where: { user_id: userId }
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        code: 'WALLET_001',
        message: 'ওয়ালেট খুঁজে পাওয়া যায়নি'
      });
    }

    return res.status(200).json({
      success: true,
      balance: wallet.balance / 100, // Paisa থেকে Taka তে
      currency: 'BDT',
      daily_limit: wallet.daily_limit / 100,
      monthly_limit: wallet.monthly_limit / 100,
      daily_sent_today: wallet.daily_sent_today / 100,
      is_locked: wallet.is_locked,
      locked_reason: wallet.locked_reason
    });
  } catch (error) {
    console.error('❌ Get Balance Error:', error);
    return res.status(500).json({
      success: false,
      code: 'ERR_999',
      message: 'ব্যালেন্স পেতে ব্যর্থ'
    });
  }
});

/**
 * GET /api/v1/wallet/details
 * 📊 Get Wallet Details
 */
router.get('/details', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallets: true
      }
    });

    if (!user || !user.wallets[0]) {
      return res.status(404).json({
        success: false,
        code: 'WALLET_001',
        message: 'ওয়ালেট খুঁজে পাওয়া যায়নি'
      });
    }

    const wallet = user.wallets[0];

    return res.status(200).json({
      success: true,
      wallet: {
        balance: wallet.balance / 100,
        total_sent: wallet.total_sent / 100,
        total_received: wallet.total_received / 100,
        daily_limit: wallet.daily_limit / 100,
        monthly_limit: wallet.monthly_limit / 100,
        daily_sent_today: wallet.daily_sent_today / 100,
        is_locked: wallet.is_locked,
        locked_reason: wallet.locked_reason,
        created_at: wallet.created_at,
        updated_at: wallet.updated_at
      },
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        kyc_status: user.kyc_status,
        is_active: user.is_active
      }
    });
  } catch (error) {
    console.error('❌ Get Wallet Details Error:', error);
    return res.status(500).json({
      success: false,
      code: 'ERR_999',
      message: 'ওয়ালেট ডিটেইল পেতে ব্যর্থ'
    });
  }
});

module.exports = router;
