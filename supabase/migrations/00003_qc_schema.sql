-- =====================================================
-- QUALITY CONTROL (QC) SCHEMA
-- =====================================================

-- QC jobs (batch QC for an order/upload)
CREATE TABLE IF NOT EXISTS qc_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  upload_job_id UUID REFERENCES upload_jobs(id),
  
  -- Job info
  job_type VARCHAR(50) DEFAULT 'auto', -- 'auto', 'manual', 'recheck'
  
  -- Status
  status qc_status NOT NULL DEFAULT 'pending',
  
  -- Counts
  total_assets INTEGER DEFAULT 0,
  passed_assets INTEGER DEFAULT 0,
  warning_assets INTEGER DEFAULT 0,
  failed_assets INTEGER DEFAULT 0,
  
  -- Scoring
  overall_score INTEGER, -- 0-100
  
  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Assignment
  assigned_to UUID REFERENCES users(id),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  
  -- Override
  override_approved BOOLEAN DEFAULT false,
  override_by UUID REFERENCES users(id),
  override_at TIMESTAMPTZ,
  override_reason TEXT,
  
  -- AI processing
  ai_processed BOOLEAN DEFAULT false,
  ai_processed_at TIMESTAMPTZ,
  ai_model_version VARCHAR(50),
  
  -- Summary
  summary JSONB DEFAULT '{}',
  recommendations JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- QC results (per-asset QC analysis)
CREATE TABLE IF NOT EXISTS qc_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  qc_job_id UUID NOT NULL REFERENCES qc_jobs(id) ON DELETE CASCADE,
  media_asset_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
  
  -- Status
  status qc_status NOT NULL DEFAULT 'pending',
  
  -- Scoring
  overall_score INTEGER, -- 0-100
  
  -- Category scores
  exposure_score INTEGER,
  white_balance_score INTEGER,
  sharpness_score INTEGER,
  composition_score INTEGER,
  color_accuracy_score INTEGER,
  noise_score INTEGER,
  
  -- For video
  stability_score INTEGER,
  audio_score INTEGER,
  transition_score INTEGER,
  
  -- For drone
  framing_score INTEGER,
  compliance_score INTEGER,
  
  -- AI analysis
  ai_analysis JSONB DEFAULT '{}',
  ai_confidence DECIMAL(5, 4),
  
  -- Processing
  processed_at TIMESTAMPTZ,
  processing_time_ms INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- QC issues (specific problems found)
CREATE TABLE IF NOT EXISTS qc_issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  qc_result_id UUID NOT NULL REFERENCES qc_results(id) ON DELETE CASCADE,
  media_asset_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
  
  -- Issue details
  issue_type VARCHAR(50) NOT NULL, -- 'exposure', 'dust_spot', 'blur', 'crooked', 'reflection', etc.
  severity VARCHAR(20) NOT NULL, -- 'info', 'warning', 'error', 'critical'
  
  description TEXT NOT NULL,
  
  -- Location in image (if applicable)
  location_x INTEGER, -- pixel coordinate
  location_y INTEGER,
  region_data JSONB, -- bounding box or polygon
  
  -- AI detection
  ai_detected BOOLEAN DEFAULT true,
  ai_confidence DECIMAL(5, 4),
  
  -- Resolution
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id),
  resolution_method VARCHAR(50), -- 'edited', 'reshot', 'waived'
  resolution_notes TEXT,
  
  -- Annotated image
  annotated_image_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- QC scores (historical performance tracking)
CREATE TABLE IF NOT EXISTS qc_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Scope (photographer/editor/market level)
  photographer_id UUID REFERENCES photographers(id) ON DELETE CASCADE,
  editor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  market_id UUID REFERENCES markets(id) ON DELETE CASCADE,
  
  -- Time period
  period_type VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Aggregate scores
  total_assets INTEGER DEFAULT 0,
  passed_assets INTEGER DEFAULT 0,
  warning_assets INTEGER DEFAULT 0,
  failed_assets INTEGER DEFAULT 0,
  
  pass_rate DECIMAL(5, 2),
  average_score DECIMAL(5, 2),
  
  -- Category averages
  avg_exposure_score DECIMAL(5, 2),
  avg_sharpness_score DECIMAL(5, 2),
  avg_composition_score DECIMAL(5, 2),
  avg_color_score DECIMAL(5, 2),
  
  -- Issue breakdown
  issue_counts JSONB DEFAULT '{}',
  
  -- Trend
  score_trend DECIMAL(5, 2), -- change from previous period
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(company_id, photographer_id, period_type, period_start),
  UNIQUE(company_id, editor_id, period_type, period_start),
  UNIQUE(company_id, market_id, period_type, period_start)
);

-- QC rules (configurable QC criteria)
CREATE TABLE IF NOT EXISTS qc_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Rule type
  rule_type VARCHAR(50) NOT NULL, -- 'threshold', 'required', 'coverage', 'custom'
  media_types media_type[],
  
  -- Conditions
  conditions JSONB NOT NULL,
  /*
  Example conditions:
  {
    "check": "exposure",
    "operator": "between",
    "min_value": -1.5,
    "max_value": 1.5
  }
  */
  
  -- Severity
  severity VARCHAR(20) DEFAULT 'warning',
  
  -- Actions
  fail_on_violation BOOLEAN DEFAULT false,
  auto_flag BOOLEAN DEFAULT true,
  notify_photographer BOOLEAN DEFAULT true,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Ordering
  priority INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI flags (system-generated recommendations)
CREATE TABLE IF NOT EXISTS ai_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Target entity
  entity_type VARCHAR(50) NOT NULL, -- 'order', 'appointment', 'photographer', 'customer', 'media_asset'
  entity_id UUID NOT NULL,
  
  -- Flag details
  flag_type VARCHAR(50) NOT NULL, -- 'qc_issue', 'schedule_conflict', 'performance', 'risk', 'opportunity'
  severity VARCHAR(20) DEFAULT 'info',
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- AI context
  ai_model VARCHAR(50),
  ai_confidence DECIMAL(5, 4),
  ai_reasoning TEXT,
  
  -- Recommendations
  recommendations JSONB DEFAULT '[]',
  suggested_actions JSONB DEFAULT '[]',
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'acknowledged', 'resolved', 'dismissed'
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id),
  
  -- Expiration
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI recommendations (proactive suggestions)
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Target
  target_type VARCHAR(50) NOT NULL, -- 'photographer', 'customer', 'market', 'product', 'schedule'
  target_id UUID,
  
  -- Recommendation
  recommendation_type VARCHAR(50) NOT NULL, -- 'upsell', 'schedule_optimization', 'training', 'pricing', 'capacity'
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Impact
  estimated_impact JSONB, -- {"revenue": 1000, "efficiency": 15}
  confidence_score DECIMAL(5, 4),
  
  -- Data
  supporting_data JSONB DEFAULT '{}',
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'implemented'
  implemented_at TIMESTAMPTZ,
  implemented_by UUID REFERENCES users(id),
  
  -- Outcome tracking
  actual_impact JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_qc_jobs_company ON qc_jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_qc_jobs_order ON qc_jobs(order_id);
CREATE INDEX IF NOT EXISTS idx_qc_jobs_status ON qc_jobs(company_id, status);

CREATE INDEX IF NOT EXISTS idx_qc_results_job ON qc_results(qc_job_id);
CREATE INDEX IF NOT EXISTS idx_qc_results_asset ON qc_results(media_asset_id);
CREATE INDEX IF NOT EXISTS idx_qc_results_status ON qc_results(status);

CREATE INDEX IF NOT EXISTS idx_qc_issues_result ON qc_issues(qc_result_id);
CREATE INDEX IF NOT EXISTS idx_qc_issues_asset ON qc_issues(media_asset_id);
CREATE INDEX IF NOT EXISTS idx_qc_issues_type ON qc_issues(issue_type);
CREATE INDEX IF NOT EXISTS idx_qc_issues_severity ON qc_issues(severity);

CREATE INDEX IF NOT EXISTS idx_qc_scores_company ON qc_scores(company_id);
CREATE INDEX IF NOT EXISTS idx_qc_scores_photographer ON qc_scores(photographer_id);
CREATE INDEX IF NOT EXISTS idx_qc_scores_period ON qc_scores(period_type, period_start);

CREATE INDEX IF NOT EXISTS idx_ai_flags_company ON ai_flags(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_flags_entity ON ai_flags(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_ai_flags_status ON ai_flags(company_id, status);

CREATE INDEX IF NOT EXISTS idx_ai_recommendations_company ON ai_recommendations(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_target ON ai_recommendations(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_status ON ai_recommendations(status);

-- =====================================================
-- TRIGGERS
-- =====================================================

DROP TRIGGER IF EXISTS update_qc_jobs_updated_at ON qc_jobs;
CREATE TRIGGER update_qc_jobs_updated_at BEFORE UPDATE ON qc_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_qc_rules_updated_at ON qc_rules;
CREATE TRIGGER update_qc_rules_updated_at BEFORE UPDATE ON qc_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
