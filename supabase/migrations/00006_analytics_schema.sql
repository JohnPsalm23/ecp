-- =====================================================
-- ANALYTICS & METRICS SCHEMA
-- KPIs, Dashboards, and Materialized Views
-- =====================================================

-- KPI definitions
CREATE TABLE kpi_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  
  -- Calculation
  calculation_type VARCHAR(50) NOT NULL, -- 'count', 'sum', 'average', 'percentage', 'ratio', 'custom'
  formula TEXT, -- SQL or expression
  
  -- Dimensions
  available_dimensions TEXT[], -- ['market', 'photographer', 'product', 'customer_type']
  
  -- Display
  unit VARCHAR(20), -- '%', '$', 'minutes', 'count'
  format VARCHAR(20), -- 'number', 'currency', 'percentage', 'duration'
  
  -- Targets
  target_type VARCHAR(20), -- 'higher_is_better', 'lower_is_better', 'range'
  
  category VARCHAR(50), -- 'operations', 'finance', 'quality', 'sales', 'customer'
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- KPI snapshots (historical metric values)
CREATE TABLE kpi_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  kpi_id UUID NOT NULL REFERENCES kpi_definitions(id) ON DELETE CASCADE,
  
  -- Time period
  period_type VARCHAR(20) NOT NULL, -- 'hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  
  -- Dimension (optional grouping)
  dimension_type VARCHAR(50),
  dimension_id UUID,
  dimension_name VARCHAR(255),
  
  -- Value
  value DECIMAL(18, 4) NOT NULL,
  
  -- Context
  sample_size INTEGER,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(company_id, kpi_id, period_type, period_start, dimension_type, dimension_id)
);

-- Dashboard configurations
CREATE TABLE dashboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Layout
  layout JSONB NOT NULL DEFAULT '{"columns": 12, "widgets": []}',
  
  -- Access
  is_public BOOLEAN DEFAULT false,
  roles user_role[], -- roles that can view
  
  -- Owner
  created_by UUID REFERENCES users(id),
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(company_id, slug)
);

-- Dashboard widgets
CREATE TABLE dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  widget_type VARCHAR(50) NOT NULL, -- 'number', 'chart', 'table', 'list', 'map', 'calendar'
  
  -- Data source
  kpi_id UUID REFERENCES kpi_definitions(id),
  query TEXT, -- custom SQL or query config
  
  -- Display config
  config JSONB NOT NULL DEFAULT '{}',
  
  -- Position in grid
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  width INTEGER DEFAULT 4,
  height INTEGER DEFAULT 2,
  
  -- Refresh
  refresh_interval_seconds INTEGER,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- MATERIALIZED VIEWS FOR ANALYTICS
-- =====================================================

-- Daily order metrics by market
CREATE MATERIALIZED VIEW mv_daily_order_metrics AS
SELECT
  o.company_id,
  o.market_id,
  DATE(o.created_at AT TIME ZONE m.timezone) AS date,
  m.timezone,
  COUNT(DISTINCT o.id) AS total_orders,
  COUNT(DISTINCT CASE WHEN o.status NOT IN ('cancelled', 'draft') THEN o.id END) AS confirmed_orders,
  COUNT(DISTINCT CASE WHEN o.status = 'delivered' THEN o.id END) AS delivered_orders,
  COUNT(DISTINCT CASE WHEN o.status = 'cancelled' THEN o.id END) AS cancelled_orders,
  COUNT(DISTINCT o.customer_id) AS unique_customers,
  SUM(CASE WHEN o.status NOT IN ('cancelled', 'draft') THEN o.total ELSE 0 END) AS total_revenue,
  AVG(CASE WHEN o.status NOT IN ('cancelled', 'draft') THEN o.total END) AS avg_order_value
FROM orders o
JOIN markets m ON o.market_id = m.id
GROUP BY o.company_id, o.market_id, DATE(o.created_at AT TIME ZONE m.timezone), m.timezone;

CREATE UNIQUE INDEX ON mv_daily_order_metrics (company_id, market_id, date);

-- Photographer performance metrics
CREATE MATERIALIZED VIEW mv_photographer_performance AS
SELECT
  p.company_id,
  p.id AS photographer_id,
  p.user_id,
  COUNT(DISTINCT a.id) AS total_appointments,
  COUNT(DISTINCT CASE WHEN a.status = 'completed' THEN a.id END) AS completed_appointments,
  COUNT(DISTINCT CASE WHEN a.status IN ('no_show', 'cancelled') THEN a.id END) AS missed_appointments,
  ROUND(
    COUNT(DISTINCT CASE WHEN a.status = 'completed' THEN a.id END)::DECIMAL / 
    NULLIF(COUNT(DISTINCT a.id), 0) * 100, 2
  ) AS completion_rate,
  AVG(a.actual_duration_minutes) AS avg_job_duration,
  SUM(ml.distance_miles) AS total_mileage,
  AVG(r.overall_rating) AS avg_rating,
  COUNT(r.id) AS total_reviews,
  ROUND(
    COUNT(DISTINCT CASE WHEN qr.status = 'passed' THEN qr.id END)::DECIMAL / 
    NULLIF(COUNT(DISTINCT qr.id), 0) * 100, 2
  ) AS qc_pass_rate
FROM photographers p
LEFT JOIN appointments a ON p.id = a.photographer_id
LEFT JOIN mileage_logs ml ON p.id = ml.photographer_id
LEFT JOIN reviews r ON p.id = r.photographer_id AND r.is_approved = true
LEFT JOIN media_assets ma ON a.id = ma.appointment_id
LEFT JOIN qc_results qr ON ma.id = qr.media_asset_id
GROUP BY p.company_id, p.id, p.user_id;

CREATE UNIQUE INDEX ON mv_photographer_performance (company_id, photographer_id);

-- Customer lifetime value
CREATE MATERIALIZED VIEW mv_customer_ltv AS
SELECT
  c.company_id,
  c.id AS customer_id,
  COUNT(DISTINCT o.id) AS total_orders,
  SUM(o.total) AS lifetime_revenue,
  AVG(o.total) AS avg_order_value,
  MIN(o.created_at) AS first_order_at,
  MAX(o.created_at) AS last_order_at,
  EXTRACT(DAYS FROM MAX(o.created_at) - MIN(o.created_at)) AS customer_tenure_days,
  COUNT(DISTINCT DATE_TRUNC('month', o.created_at)) AS active_months,
  SUM(o.total) / NULLIF(
    EXTRACT(MONTHS FROM AGE(MAX(o.created_at), MIN(o.created_at))) + 1, 0
  ) AS monthly_revenue_avg
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id AND o.status NOT IN ('cancelled', 'draft')
GROUP BY c.company_id, c.id;

CREATE UNIQUE INDEX ON mv_customer_ltv (company_id, customer_id);

-- Product performance
CREATE MATERIALIZED VIEW mv_product_performance AS
SELECT
  p.company_id,
  p.id AS product_id,
  p.name AS product_name,
  p.category_id,
  COUNT(DISTINCT oi.id) AS times_ordered,
  SUM(oi.quantity) AS total_quantity,
  SUM(oi.total_price) AS total_revenue,
  AVG(oi.unit_price) AS avg_unit_price,
  COUNT(DISTINCT o.customer_id) AS unique_customers,
  ROUND(
    COUNT(DISTINCT oi.id)::DECIMAL / NULLIF(COUNT(DISTINCT o.id), 0) * 100, 2
  ) AS order_inclusion_rate
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id AND o.status NOT IN ('cancelled', 'draft')
GROUP BY p.company_id, p.id, p.name, p.category_id;

CREATE UNIQUE INDEX ON mv_product_performance (company_id, product_id);

-- QC trends
CREATE MATERIALIZED VIEW mv_qc_trends AS
WITH job_stats AS (
  SELECT
    qj.company_id,
    DATE_TRUNC('week', qj.created_at) AS week,
    COUNT(DISTINCT qj.id) AS total_jobs,
    COUNT(DISTINCT CASE WHEN qj.status = 'passed' THEN qj.id END) AS passed_jobs,
    COUNT(DISTINCT CASE WHEN qj.status = 'failed' THEN qj.id END) AS failed_jobs,
    AVG(qj.overall_score) AS avg_score
  FROM qc_jobs qj
  GROUP BY qj.company_id, DATE_TRUNC('week', qj.created_at)
),
issue_counts AS (
  SELECT
    qj.company_id,
    DATE_TRUNC('week', qj.created_at) AS week,
    qi.issue_type,
    COUNT(*) AS issue_count
  FROM qc_jobs qj
  JOIN qc_results qr ON qj.id = qr.qc_job_id
  JOIN qc_issues qi ON qr.id = qi.qc_result_id
  GROUP BY qj.company_id, DATE_TRUNC('week', qj.created_at), qi.issue_type
),
issue_stats AS (
  SELECT
    company_id,
    week,
    SUM(issue_count) AS total_issues,
    jsonb_object_agg(issue_type, issue_count) AS issue_breakdown
  FROM issue_counts
  GROUP BY company_id, week
)
SELECT
  js.company_id,
  js.week,
  js.total_jobs,
  js.passed_jobs,
  js.failed_jobs,
  ROUND(js.passed_jobs::DECIMAL / NULLIF(js.total_jobs, 0) * 100, 2) AS pass_rate,
  js.avg_score,
  COALESCE(iss.total_issues, 0) AS total_issues,
  COALESCE(iss.issue_breakdown, '{}'::jsonb) AS issue_breakdown
FROM job_stats js
LEFT JOIN issue_stats iss ON js.company_id = iss.company_id AND js.week = iss.week;

CREATE UNIQUE INDEX ON mv_qc_trends (company_id, week);

-- Sales rep performance
CREATE MATERIALIZED VIEW mv_sales_performance AS
SELECT
  o.company_id,
  o.sales_rep_id,
  u.display_name AS sales_rep_name,
  DATE_TRUNC('month', o.created_at) AS month,
  COUNT(DISTINCT o.id) AS total_orders,
  COUNT(DISTINCT o.customer_id) AS unique_customers,
  COUNT(DISTINCT c.id) FILTER (WHERE c.created_at >= DATE_TRUNC('month', o.created_at)) AS new_customers,
  SUM(o.total) AS total_revenue,
  AVG(o.total) AS avg_order_value,
  SUM(com.commission_amount) AS total_commissions
FROM orders o
LEFT JOIN users u ON o.sales_rep_id = u.id
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN commissions com ON o.id = com.order_id AND com.user_id = o.sales_rep_id
WHERE o.status NOT IN ('cancelled', 'draft')
  AND o.sales_rep_id IS NOT NULL
GROUP BY o.company_id, o.sales_rep_id, u.display_name, DATE_TRUNC('month', o.created_at);

CREATE UNIQUE INDEX ON mv_sales_performance (company_id, sales_rep_id, month);

-- =====================================================
-- REFRESH FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_order_metrics;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_photographer_performance;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_customer_ltv;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_product_performance;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_qc_trends;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_sales_performance;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_kpi_snapshots_company ON kpi_snapshots(company_id);
CREATE INDEX idx_kpi_snapshots_kpi ON kpi_snapshots(kpi_id);
CREATE INDEX idx_kpi_snapshots_period ON kpi_snapshots(period_type, period_start);
CREATE INDEX idx_kpi_snapshots_dimension ON kpi_snapshots(dimension_type, dimension_id);

CREATE INDEX idx_dashboards_company ON dashboards(company_id);
CREATE INDEX idx_dashboards_slug ON dashboards(company_id, slug);

CREATE INDEX idx_dashboard_widgets_dashboard ON dashboard_widgets(dashboard_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_dashboards_updated_at BEFORE UPDATE ON dashboards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
