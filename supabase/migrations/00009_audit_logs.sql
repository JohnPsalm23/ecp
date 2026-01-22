-- =====================================================
-- AUDIT LOGS ENHANCEMENTS
-- Additional columns and policies for the audit_logs table
-- Note: Base audit_logs table is created in 00005_operations_schema.sql
-- =====================================================

-- Add additional columns if they don't exist
DO $$ 
BEGIN
  -- Add actor_type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'audit_logs' AND column_name = 'actor_type'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN actor_type VARCHAR(20) DEFAULT 'user';
  END IF;

  -- Add changes column if it doesn't exist  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'audit_logs' AND column_name = 'changes'
  ) THEN
    ALTER TABLE audit_logs ADD COLUMN changes JSONB;
  END IF;
END $$;

-- Additional index for company + date filtering
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_audit_logs_company_date ON audit_logs(company_id, created_at DESC);

-- =====================================================
-- RETENTION POLICY
-- Automatically clean up old audit logs
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  -- Keep audit logs for 2 years by default
  DELETE FROM audit_logs 
  WHERE created_at < NOW() - INTERVAL '2 years';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- IDEMPOTENCY KEYS TABLE
-- Prevents duplicate operations for API requests
-- =====================================================

CREATE TABLE IF NOT EXISTS IF NOT EXISTS idempotency_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'processing', -- 'processing', 'completed', 'failed'
  result JSONB,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for cleanup and lookup
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_idempotency_keys_key ON idempotency_keys(key);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_idempotency_keys_expires ON idempotency_keys(expires_at);

-- Auto-cleanup expired keys
CREATE OR REPLACE FUNCTION cleanup_expired_idempotency_keys()
RETURNS void AS $$
BEGIN
  DELETE FROM idempotency_keys WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- RLS
ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and recreate
DROP POLICY IF EXISTS idempotency_keys_service_only ON idempotency_keys;
CREATE POLICY idempotency_keys_service_only ON idempotency_keys
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant access to service role
GRANT ALL ON idempotency_keys TO service_role;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_idempotency_keys_updated_at ON idempotency_keys;
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
