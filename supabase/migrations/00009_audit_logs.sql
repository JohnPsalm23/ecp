-- =====================================================
-- AUDIT LOGS TABLE
-- Comprehensive audit trail for compliance and debugging
-- =====================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action VARCHAR(100) NOT NULL,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_type VARCHAR(20) NOT NULL DEFAULT 'user', -- 'user', 'system', 'api', 'webhook'
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  changes JSONB,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  request_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_audit_logs_company ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Composite index for filtering by company and date
CREATE INDEX idx_audit_logs_company_date ON audit_logs(company_id, created_at DESC);

-- RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs for their company
CREATE POLICY audit_logs_view ON audit_logs
  FOR SELECT
  USING (
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

-- Only service role can insert audit logs
CREATE POLICY audit_logs_insert ON audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Prevent updates and deletes
CREATE POLICY audit_logs_no_update ON audit_logs
  FOR UPDATE
  USING (false);

CREATE POLICY audit_logs_no_delete ON audit_logs
  FOR DELETE
  USING (false);

-- Grant access
GRANT SELECT ON audit_logs TO authenticated;
GRANT INSERT ON audit_logs TO service_role;

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

-- Schedule cleanup (run monthly)
-- Note: Actual scheduling done via Supabase Dashboard or cron job
