-- =====================================================
-- WEBHOOKS TABLE
-- Stores webhook configurations for external integrations
-- =====================================================

CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  secret VARCHAR(255) NOT NULL,
  events TEXT[] NOT NULL,
  enabled BOOLEAN DEFAULT true,
  headers JSONB,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for lookup
CREATE INDEX idx_webhooks_company ON webhooks(company_id);
CREATE INDEX idx_webhooks_enabled ON webhooks(company_id, enabled) WHERE enabled = true;

-- Trigger for updated_at
CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- WEBHOOK DELIVERIES TABLE
-- Logs all webhook delivery attempts for debugging
-- =====================================================

CREATE TABLE webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event VARCHAR(100) NOT NULL,
  success BOOLEAN NOT NULL,
  status_code INTEGER,
  response_time_ms INTEGER,
  error_message TEXT,
  request_payload JSONB,
  response_body TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying delivery history
CREATE INDEX idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_created ON webhook_deliveries(created_at DESC);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(webhook_id, success);

-- RLS
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- Webhook policies
CREATE POLICY webhooks_company_access ON webhooks
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
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'owner', 'super_admin')
    )
  );

-- Webhook deliveries policies
CREATE POLICY webhook_deliveries_view ON webhook_deliveries
  FOR SELECT
  USING (
    webhook_id IN (
      SELECT id FROM webhooks WHERE company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Service role can insert deliveries
CREATE POLICY webhook_deliveries_insert ON webhook_deliveries
  FOR INSERT
  WITH CHECK (true);

-- Grants
GRANT ALL ON webhooks TO authenticated;
GRANT SELECT, INSERT ON webhook_deliveries TO authenticated;
GRANT ALL ON webhook_deliveries TO service_role;

-- =====================================================
-- API KEYS TABLE
-- For external API access
-- =====================================================

CREATE TABLE api_keys (
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
CREATE INDEX idx_api_keys_company ON api_keys(company_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);

-- Trigger for updated_at
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

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
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'owner', 'super_admin')
    )
  );

GRANT ALL ON api_keys TO authenticated;
