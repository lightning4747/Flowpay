-- Users table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    balance DECIMAL(15,2) DEFAULT 1000.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    from_user_id UUID REFERENCES users(id) NOT NULL,
    to_user_id UUID REFERENCES users(id) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    note TEXT,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment orders table (for Razorpay)
CREATE TABLE payment_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'created',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_transactions_from_user ON transactions(from_user_id);
CREATE INDEX idx_transactions_to_user ON transactions(to_user_id);
CREATE INDEX idx_transactions_created ON transactions(created_at);
CREATE INDEX idx_payment_orders_user ON payment_orders(user_id);

-- Function to transfer money between users
CREATE OR REPLACE FUNCTION transfer_money(
    from_user_id UUID,
    to_user_id UUID,
    transfer_amount DECIMAL
) RETURNS VOID AS $$
BEGIN
    -- Deduct from sender
    UPDATE users 
    SET balance = balance - transfer_amount,
        updated_at = NOW()
    WHERE id = from_user_id;
    
    -- Add to recipient
    UPDATE users 
    SET balance = balance + transfer_amount,
        updated_at = NOW()
    WHERE id = to_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment balance
CREATE OR REPLACE FUNCTION increment_balance(
    user_id UUID,
    amount DECIMAL
) RETURNS VOID AS $$
BEGIN
    UPDATE users 
    SET balance = balance + amount,
        updated_at = NOW()
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;