-- Seed Data SQL Script for RecoverAI

INSERT INTO merchants (id, name, email, password_hash, business_name)
VALUES ('mch_demo_1001', 'Razorpay Demo Merchant', 'demo@recoverai.io', '$2a$10$YourDefaultHashedPasswordPlaceholder', 'Nova Retail India Pvt Ltd')
ON CONFLICT (id) DO NOTHING;

INSERT INTO customers (id, merchant_id, name, email, phone, lifetime_value)
VALUES 
('cust_101', 'mch_demo_1001', 'Ananya Sharma', 'ananya.sharma@example.com', '+91 9876543210', 45000.00),
('cust_102', 'mch_demo_1001', 'Rohan Verma', 'rohan.verma@example.com', '+91 9876543211', 12500.00),
('cust_103', 'mch_demo_1001', 'Aditya Patel', 'aditya.patel@example.com', '+91 9876543212', 28000.00)
ON CONFLICT (id) DO NOTHING;
