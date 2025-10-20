// backend/routes/payments.js
const express = require('express');
const Razorpay = require('razorpay');
const supabase = require('../utils/supabaseClient');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay order
router.post('/create-order', authenticateToken, async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);

    // Store order in database
    await supabase
      .from('payment_orders')
      .insert([
        {
          order_id: order.id,
          user_id: req.user.userId,
          amount: amount,
          currency: currency,
          status: 'created',
          created_at: new Date().toISOString()
        }
      ]);

    res.json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify payment and transfer money
router.post('/verify-payment', authenticateToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // In production, verify the payment signature
    // For demo, we'll assume payment is successful

    // Update order status
    await supabase
      .from('payment_orders')
      .update({ 
        status: 'captured',
        payment_id: razorpay_payment_id,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', razorpay_order_id);

    // Add funds to user's balance
    const { data: order } = await supabase
      .from('payment_orders')
      .select('amount, user_id')
      .eq('order_id', razorpay_order_id)
      .single();

    if (order) {
      await supabase.rpc('increment_balance', {
        user_id: order.user_id,
        amount: order.amount
      });
    }

    res.json({ 
      success: true, 
      message: 'Payment verified and funds added successfully' 
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Send money to another user
router.post('/send-money', authenticateToken, async (req, res) => {
  try {
    const { toEmail, amount, note } = req.body;
    
    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    // Get sender's current balance
    const { data: sender } = await supabase
      .from('users')
      .select('balance, id')
      .eq('id', req.user.userId)
      .single();

    if (sender.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Find recipient
    const { data: recipient } = await supabase
      .from('users')
      .select('id, email, name, balance')
      .eq('email', toEmail)
      .single();

    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    // Perform transaction
    await supabase.rpc('transfer_money', {
      from_user_id: req.user.userId,
      to_user_id: recipient.id,
      transfer_amount: amount
    });

    // Record transaction
    const { data: transaction } = await supabase
      .from('transactions')
      .insert([
        {
          from_user_id: req.user.userId,
          to_user_id: recipient.id,
          amount: amount,
          note: note,
          status: 'completed',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    res.json({
      success: true,
      message: 'Money sent successfully',
      transaction,
      newBalance: sender.balance - amount
    });

  } catch (error) {
    console.error('Send money error:', error);
    res.status(500).json({ error: 'Failed to send money' });
  }
});

module.exports = router;