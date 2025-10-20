// backend/tests/payment.test.js
const request = require('supertest');
const app = require('../server');

describe('Payment Flow', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    // Register test user
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@flowpay.com',
        password: 'password123',
        name: 'Test User'
      });
    
    authToken = res.body.token;
    testUser = res.body.user;
  });

  it('should create Razorpay order', async () => {
    const res = await request(app)
      .post('/api/payments/create-order')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ amount: 1000 });
    
    expect(res.status).toBe(200);
    expect(res.body.id).toBeDefined();
    expect(res.body.amount).toBe(100000); // in paise
  });

  it('should send money to another user', async () => {
    // Create recipient
    const recipientRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'recipient@flowpay.com',
        password: 'password123',
        name: 'Recipient User'
      });

    const res = await request(app)
      .post('/api/payments/send-money')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        toEmail: 'recipient@flowpay.com',
        amount: 100,
        note: 'Test payment'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});