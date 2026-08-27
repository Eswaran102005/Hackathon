-- RecoverAI PostgreSQL Schema Definition

CREATE TABLE IF NOT EXISTS merchants (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(36) PRIMARY KEY,
    merchant_id VARCHAR(36) NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    lifetime_value NUMERIC(12, 2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(36) PRIMARY KEY,
    merchant_id VARCHAR(36) NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    customer_id VARCHAR(36) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    external_payment_id VARCHAR(100) UNIQUE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    failure_code VARCHAR(50),
    failure_reason VARCHAR(100),
    attempt_number INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recovery_predictions (
    id VARCHAR(36) PRIMARY KEY,
    payment_id VARCHAR(36) NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    recovery_probability NUMERIC(5, 4) NOT NULL,
    expected_recovery NUMERIC(12, 2) NOT NULL,
    recommended_action VARCHAR(50) NOT NULL,
    recommended_delay_minutes INTEGER DEFAULT 0,
    confidence NUMERIC(5, 4) NOT NULL,
    reason TEXT NOT NULL,
    model_version VARCHAR(50) DEFAULT '1.0.0-hybrid',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recovery_actions (
    id VARCHAR(36) PRIMARY KEY,
    payment_id VARCHAR(36) NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL,
    expected_value NUMERIC(12, 2) NOT NULL,
    actual_recovered_amount NUMERIC(12, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recovery_events (
    id VARCHAR(36) PRIMARY KEY,
    payment_id VARCHAR(36) NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    action_id VARCHAR(36) REFERENCES recovery_actions(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_messages (
    id VARCHAR(36) PRIMARY KEY,
    payment_id VARCHAR(36) NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    channel VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    generated_by VARCHAR(50) DEFAULT 'GEMINI',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_payments_merchant ON payments(merchant_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_predictions_payment ON recovery_predictions(payment_id);
CREATE INDEX IF NOT EXISTS idx_actions_payment ON recovery_actions(payment_id);
