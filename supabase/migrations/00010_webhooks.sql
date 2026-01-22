-- =====================================================
-- WEBHOOKS ENHANCEMENTS
-- Additional columns and API keys table
-- Note: Base webhooks table is created in 00005_operations_schema.sql
-- =====================================================

-- Add additional columns to webhooks if they don't exist
DO $$ 
BEGIN
  -- Add secret column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'webhooks' AND column_name = 'secret'
  ) THEN
    ALTER TABLE webhooks ADD COLUMN secret VARCHAR(255);
  END IF;

  -- Add enabled column if it doesn't exist (might be named is_active)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'webhooks' AND column_name = 'enabled'
  ) THEN
    ALTER TABLE webhooks ADD COLUMN enabled BOOLEAN DEFAULT true;
  END IF;

  -- Add created_by column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'webhooks' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE webhooks ADD COLUMN created_by UUID REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add additional columns to webhook_deliveries if table exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'webhook_deliveries' AND column_name = 'success'
  ) THEN
    ALTER TABLE webhook_deliveries ADD COLUMN success BOOLEAN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'webhook_deliveries' AND column_name = 'error_message'
  ) THEN
    ALTER TABLE webhook_deliveries ADD COLUMN error_message TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'webhook_deliveries' AND column_name = 'request_payload'
  ) THEN
    ALTER TABLE webhook_deliveries ADD COLUMN request_payload JSONB;
  END IF;
END $$;

-- Create index for enabled webhooks
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_webhooks_enabled ON webhooks(company_id, is_active) WHERE is_active = true;

-- =====================================================
-- API KEYS TABLE
-- For external API access
-- =====================================================

CREATE TABLE IF NOT EXISTS IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(64) NOT NULL UNIQUE, -- SHA-256 hash of the key
  key_prefix VARCHAR(12) NOT NULL, -- First 12 chars for identification
  scopes TEXT[] NOT NULL DEFAULT ARRAY['read'],
  rate_limit INTEGER DEFAULT 1000, -- Requests per hour
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_api_keys_company ON api_keys(company_id);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_api_keys_updated_at ON api_keys;
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists and recreate
DROP POLICY IF EXISTS api_keys_company_access ON api_keys;
CREATE POLICY api_keys_company_access ON api_keys
  FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('super_admin', 'company_admin')
    )
  );

GRANT ALL ON api_keys TO authenticated;
