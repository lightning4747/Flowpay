// backend/routes/transactions.js
const express = require('express');
const supabase = require('../utils/supabaseClient');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Get user's transaction history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`
        *,
        from_user:users!transactions_from_user_id_fkey(id, name, email),
        to_user:users!transactions_to_user_id_fkey(id, name, email)
      `)
      .or(`from_user_id.eq.${req.user.userId},to_user_id.eq.${req.user.userId}`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({ transactions });
  } catch (error) {
    console.error('Transaction history error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get user balance
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('balance')
      .eq('id', req.user.userId)
      .single();

    if (error) throw error;

    res.json({ balance: user.balance });
  } catch (error) {
    console.error('Balance fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

module.exports = router;