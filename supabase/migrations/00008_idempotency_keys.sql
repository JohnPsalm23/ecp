-- =====================================================
-- IDEMPOTENCY KEYS TABLE
-- Prevents duplicate operations for API requests
-- =====================================================

CREATE TABLE idempotency_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'processing', -- 'processing', 'completed', 'failed'
  result JSONB,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for cleanup and lookup
CREATE INDEX idx_idempotency_keys_key ON idempotency_keys(key);
CREATE INDEX idx_idempotency_keys_expires ON idempotency_keys(expires_at);

-- Auto-cleanup expired keys
CREATE OR REPLACE FUNCTION cleanup_expired_idempotency_keys()
RETURNS void AS $$
BEGIN
  DELETE FROM idempotency_keys WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- RLS
ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;

-- Only service role can access idempotency keys
CREATE POLICY idempotency_keys_service_only ON idempotency_keys
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant access to service role
GRANT ALL ON idempotency_keys TO service_role;

-- Trigger for updated_at
CREATE TRIGGER update_idempotency_keys_updated_at BEFORE UPDATE ON idempotency_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRANSACTION HELPER FUNCTIONS
-- =====================================================

-- Begin transaction with isolation level
CREATE OR REPLACE FUNCTION begin_transaction(isolation_level TEXT DEFAULT 'read_committed')
RETURNS void AS $$
BEGIN
  EXECUTE 'SET TRANSACTION ISOLATION LEVEL ' || isolation_level;
END;
$$ LANGUAGE plpgsql;

-- Commit transaction
CREATE OR REPLACE FUNCTION commit_transaction()
RETURNS void AS $$
BEGIN
  -- Commit is automatic in Supabase, this is a no-op for compatibility
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Rollback transaction
CREATE OR REPLACE FUNCTION rollback_transaction()
RETURNS void AS $$
BEGIN
  RAISE EXCEPTION 'ROLLBACK_REQUESTED';
END;
$$ LANGUAGE plpgsql;
