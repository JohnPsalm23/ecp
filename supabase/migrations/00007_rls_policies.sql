-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Multi-tenant security at database level
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE photographers ENABLE ROW LEVEL SECURITY;
ALTER TABLE photographer_markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_status_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE edit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE qc_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE qc_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE qc_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE qc_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE qc_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE photographer_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE photographer_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE incentive_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE incentive_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mileage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get user's company_id from auth.users
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION has_role(required_role user_role)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = required_role
    AND (expires_at IS NULL OR expires_at > NOW())
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'super_admin'
    AND (expires_at IS NULL OR expires_at > NOW())
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Check if user is company admin
CREATE OR REPLACE FUNCTION is_company_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'company_admin')
    AND (expires_at IS NULL OR expires_at > NOW())
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Check if user has access to a specific company
CREATE OR REPLACE FUNCTION has_company_access(target_company_id UUID)
RETURNS BOOLEAN AS $$
  SELECT 
    is_super_admin() OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND company_id = target_company_id
    );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Check if user has access to a specific market
CREATE OR REPLACE FUNCTION has_market_access(target_market_id UUID)
RETURNS BOOLEAN AS $$
  SELECT 
    is_super_admin() OR
    is_company_admin() OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND (market_id = target_market_id OR market_id IS NULL)
      AND (expires_at IS NULL OR expires_at > NOW())
    );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Get customer_id for authenticated customer user
CREATE OR REPLACE FUNCTION get_customer_id()
RETURNS UUID AS $$
  SELECT id FROM customers WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Get photographer_id for authenticated photographer user
CREATE OR REPLACE FUNCTION get_photographer_id()
RETURNS UUID AS $$
  SELECT id FROM photographers WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- =====================================================
-- COMPANY POLICIES
-- =====================================================

-- Companies: Only super_admin can see all, others see their own
DROP POLICY IF EXISTS companies_select ON companies;
CREATE POLICY companies_select ON companies FOR SELECT
  USING (
    is_super_admin() OR 
    id = get_user_company_id()
  );

DROP POLICY IF EXISTS companies_insert ON companies;
CREATE POLICY companies_insert ON companies FOR INSERT
  WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS companies_update ON companies;
CREATE POLICY companies_update ON companies FOR UPDATE
  USING (is_super_admin() OR (is_company_admin() AND id = get_user_company_id()));

DROP POLICY IF EXISTS companies_delete ON companies;
CREATE POLICY companies_delete ON companies FOR DELETE
  USING (is_super_admin());

-- =====================================================
-- MARKET POLICIES
-- =====================================================

DROP POLICY IF EXISTS markets_select ON markets;
CREATE POLICY markets_select ON markets FOR SELECT
  USING (has_company_access(company_id));

DROP POLICY IF EXISTS markets_insert ON markets;
CREATE POLICY markets_insert ON markets FOR INSERT
  WITH CHECK (is_company_admin() AND has_company_access(company_id));

DROP POLICY IF EXISTS markets_update ON markets;
CREATE POLICY markets_update ON markets FOR UPDATE
  USING (is_company_admin() AND has_company_access(company_id));

DROP POLICY IF EXISTS markets_delete ON markets;
CREATE POLICY markets_delete ON markets FOR DELETE
  USING (is_super_admin());

-- =====================================================
-- USER POLICIES
-- =====================================================

DROP POLICY IF EXISTS users_select ON users;
CREATE POLICY users_select ON users FOR SELECT
  USING (
    id = auth.uid() OR
    is_super_admin() OR
    (company_id = get_user_company_id() AND (is_company_admin() OR has_role('market_manager')))
  );

DROP POLICY IF EXISTS users_insert ON users;
CREATE POLICY users_insert ON users FOR INSERT
  WITH CHECK (id = auth.uid() OR is_super_admin());

DROP POLICY IF EXISTS users_update ON users;
CREATE POLICY users_update ON users FOR UPDATE
  USING (
    id = auth.uid() OR 
    is_super_admin() OR
    (is_company_admin() AND company_id = get_user_company_id())
  );

DROP POLICY IF EXISTS users_delete ON users;
CREATE POLICY users_delete ON users FOR DELETE
  USING (is_super_admin());

-- =====================================================
-- USER ROLES POLICIES
-- =====================================================

DROP POLICY IF EXISTS user_roles_select ON user_roles;
CREATE POLICY user_roles_select ON user_roles FOR SELECT
  USING (
    user_id = auth.uid() OR
    is_super_admin() OR
    (is_company_admin() AND company_id = get_user_company_id())
  );

DROP POLICY IF EXISTS user_roles_insert ON user_roles;
CREATE POLICY user_roles_insert ON user_roles FOR INSERT
  WITH CHECK (is_super_admin() OR (is_company_admin() AND company_id = get_user_company_id()));

DROP POLICY IF EXISTS user_roles_update ON user_roles;
CREATE POLICY user_roles_update ON user_roles FOR UPDATE
  USING (is_super_admin() OR (is_company_admin() AND company_id = get_user_company_id()));

DROP POLICY IF EXISTS user_roles_delete ON user_roles;
CREATE POLICY user_roles_delete ON user_roles FOR DELETE
  USING (is_super_admin() OR (is_company_admin() AND company_id = get_user_company_id()));

-- =====================================================
-- CUSTOMER POLICIES
-- =====================================================

DROP POLICY IF EXISTS customers_select ON customers;
CREATE POLICY customers_select ON customers FOR SELECT
  USING (
    user_id = auth.uid() OR
    has_company_access(company_id)
  );

DROP POLICY IF EXISTS customers_insert ON customers;
CREATE POLICY customers_insert ON customers FOR INSERT
  WITH CHECK (has_company_access(company_id));

DROP POLICY IF EXISTS customers_update ON customers;
CREATE POLICY customers_update ON customers FOR UPDATE
  USING (
    user_id = auth.uid() OR
    has_company_access(company_id)
  );

DROP POLICY IF EXISTS customers_delete ON customers;
CREATE POLICY customers_delete ON customers FOR DELETE
  USING (is_company_admin() AND has_company_access(company_id));

-- =====================================================
-- PHOTOGRAPHER POLICIES
-- =====================================================

DROP POLICY IF EXISTS photographers_select ON photographers;
CREATE POLICY photographers_select ON photographers FOR SELECT
  USING (
    user_id = auth.uid() OR
    has_company_access(company_id)
  );

DROP POLICY IF EXISTS photographers_insert ON photographers;
CREATE POLICY photographers_insert ON photographers FOR INSERT
  WITH CHECK (is_company_admin() AND has_company_access(company_id));

DROP POLICY IF EXISTS photographers_update ON photographers;
CREATE POLICY photographers_update ON photographers FOR UPDATE
  USING (
    user_id = auth.uid() OR
    (is_company_admin() AND has_company_access(company_id))
  );

DROP POLICY IF EXISTS photographers_delete ON photographers;
CREATE POLICY photographers_delete ON photographers FOR DELETE
  USING (is_super_admin());

-- =====================================================
-- PRODUCT POLICIES
-- =====================================================

DROP POLICY IF EXISTS products_select ON products;
CREATE POLICY products_select ON products FOR SELECT
  USING (has_company_access(company_id));

DROP POLICY IF EXISTS products_insert ON products;
CREATE POLICY products_insert ON products FOR INSERT
  WITH CHECK (is_company_admin() AND has_company_access(company_id));

DROP POLICY IF EXISTS products_update ON products;
CREATE POLICY products_update ON products FOR UPDATE
  USING (is_company_admin() AND has_company_access(company_id));

DROP POLICY IF EXISTS products_delete ON products;
CREATE POLICY products_delete ON products FOR DELETE
  USING (is_company_admin() AND has_company_access(company_id));

-- Apply same pattern to product_categories, product_bundles, bundle_items
DROP POLICY IF EXISTS product_categories_select ON product_categories;
CREATE POLICY product_categories_select ON product_categories FOR SELECT
  USING (has_company_access(company_id));

DROP POLICY IF EXISTS product_categories_modify ON product_categories;
CREATE POLICY product_categories_modify ON product_categories FOR ALL
  USING (is_company_admin() AND has_company_access(company_id));

DROP POLICY IF EXISTS product_bundles_select ON product_bundles;
CREATE POLICY product_bundles_select ON product_bundles FOR SELECT
  USING (has_company_access(company_id));

DROP POLICY IF EXISTS product_bundles_modify ON product_bundles;
CREATE POLICY product_bundles_modify ON product_bundles FOR ALL
  USING (is_company_admin() AND has_company_access(company_id));

-- =====================================================
-- ORDER POLICIES
-- =====================================================

DROP POLICY IF EXISTS orders_select ON orders;
CREATE POLICY orders_select ON orders FOR SELECT
  USING (
    -- Customer can see their own orders
    EXISTS (SELECT 1 FROM customers c WHERE c.id = customer_id AND c.user_id = auth.uid()) OR
    -- Photographer can see assigned orders
    EXISTS (
      SELECT 1 FROM appointments a 
      JOIN photographers p ON a.photographer_id = p.id 
      WHERE a.order_id = orders.id AND p.user_id = auth.uid()
    ) OR
    -- Company staff can see all company orders
    has_company_access(company_id)
  );

DROP POLICY IF EXISTS orders_insert ON orders;
CREATE POLICY orders_insert ON orders FOR INSERT
  WITH CHECK (
    has_company_access(company_id) OR
    EXISTS (SELECT 1 FROM customers c WHERE c.id = customer_id AND c.user_id = auth.uid())
  );

DROP POLICY IF EXISTS orders_update ON orders;
CREATE POLICY orders_update ON orders FOR UPDATE
  USING (has_company_access(company_id));

DROP POLICY IF EXISTS orders_delete ON orders;
CREATE POLICY orders_delete ON orders FOR DELETE
  USING (is_company_admin() AND has_company_access(company_id));

-- =====================================================
-- APPOINTMENT POLICIES
-- =====================================================

DROP POLICY IF EXISTS appointments_select ON appointments;
CREATE POLICY appointments_select ON appointments FOR SELECT
  USING (
    -- Photographer can see their appointments
    EXISTS (SELECT 1 FROM photographers p WHERE p.id = photographer_id AND p.user_id = auth.uid()) OR
    -- Company staff can see all
    has_company_access(company_id)
  );

DROP POLICY IF EXISTS appointments_insert ON appointments;
CREATE POLICY appointments_insert ON appointments FOR INSERT
  WITH CHECK (has_company_access(company_id));

DROP POLICY IF EXISTS appointments_update ON appointments;
CREATE POLICY appointments_update ON appointments FOR UPDATE
  USING (
    -- Photographer can update their own (limited fields handled in app)
    EXISTS (SELECT 1 FROM photographers p WHERE p.id = photographer_id AND p.user_id = auth.uid()) OR
    has_company_access(company_id)
  );

DROP POLICY IF EXISTS appointments_delete ON appointments;
CREATE POLICY appointments_delete ON appointments FOR DELETE
  USING (is_company_admin() AND has_company_access(company_id));

-- =====================================================
-- MEDIA ASSET POLICIES
-- =====================================================

DROP POLICY IF EXISTS media_assets_select ON media_assets;
CREATE POLICY media_assets_select ON media_assets FOR SELECT
  USING (
    -- Customer can see their order's assets
    EXISTS (
      SELECT 1 FROM orders o 
      JOIN customers c ON o.customer_id = c.id 
      WHERE o.id = order_id AND c.user_id = auth.uid()
    ) OR
    -- Photographer can see their uploaded assets
    uploaded_by = auth.uid() OR
    -- Company staff can see all
    has_company_access(company_id)
  );

DROP POLICY IF EXISTS media_assets_insert ON media_assets;
CREATE POLICY media_assets_insert ON media_assets FOR INSERT
  WITH CHECK (
    -- Photographer can upload
    EXISTS (SELECT 1 FROM photographers p WHERE p.user_id = auth.uid()) OR
    has_company_access(company_id)
  );

DROP POLICY IF EXISTS media_assets_update ON media_assets;
CREATE POLICY media_assets_update ON media_assets FOR UPDATE
  USING (has_company_access(company_id));

DROP POLICY IF EXISTS media_assets_delete ON media_assets;
CREATE POLICY media_assets_delete ON media_assets FOR DELETE
  USING (has_company_access(company_id));

-- =====================================================
-- QC POLICIES
-- =====================================================

DROP POLICY IF EXISTS qc_jobs_select ON qc_jobs;
CREATE POLICY qc_jobs_select ON qc_jobs FOR SELECT
  USING (has_company_access(company_id));

DROP POLICY IF EXISTS qc_jobs_insert ON qc_jobs;
CREATE POLICY qc_jobs_insert ON qc_jobs FOR INSERT
  WITH CHECK (has_company_access(company_id));

DROP POLICY IF EXISTS qc_jobs_update ON qc_jobs;
CREATE POLICY qc_jobs_update ON qc_jobs FOR UPDATE
  USING (has_company_access(company_id));

DROP POLICY IF EXISTS qc_results_select ON qc_results;
CREATE POLICY qc_results_select ON qc_results FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM qc_jobs qj WHERE qj.id = qc_job_id AND has_company_access(qj.company_id))
  );

DROP POLICY IF EXISTS qc_issues_select ON qc_issues;
CREATE POLICY qc_issues_select ON qc_issues FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM qc_results qr 
      JOIN qc_jobs qj ON qr.qc_job_id = qj.id 
      WHERE qr.id = qc_result_id AND has_company_access(qj.company_id)
    )
  );

-- =====================================================
-- FINANCE POLICIES
-- =====================================================

-- Customer invoices
DROP POLICY IF EXISTS customer_invoices_select ON customer_invoices;
CREATE POLICY customer_invoices_select ON customer_invoices FOR SELECT
  USING (
    -- Customer can see their invoices
    EXISTS (SELECT 1 FROM customers c WHERE c.id = customer_id AND c.user_id = auth.uid()) OR
    has_company_access(company_id)
  );

DROP POLICY IF EXISTS customer_invoices_insert ON customer_invoices;
CREATE POLICY customer_invoices_insert ON customer_invoices FOR INSERT
  WITH CHECK (has_company_access(company_id));

DROP POLICY IF EXISTS customer_invoices_update ON customer_invoices;
CREATE POLICY customer_invoices_update ON customer_invoices FOR UPDATE
  USING (has_company_access(company_id));

-- Photographer invoices
DROP POLICY IF EXISTS photographer_invoices_select ON photographer_invoices;
CREATE POLICY photographer_invoices_select ON photographer_invoices FOR SELECT
  USING (
    -- Photographer can see their invoices
    EXISTS (SELECT 1 FROM photographers p WHERE p.id = photographer_id AND p.user_id = auth.uid()) OR
    has_company_access(company_id)
  );

DROP POLICY IF EXISTS photographer_invoices_insert ON photographer_invoices;
CREATE POLICY photographer_invoices_insert ON photographer_invoices FOR INSERT
  WITH CHECK (is_company_admin() AND has_company_access(company_id));

DROP POLICY IF EXISTS photographer_invoices_update ON photographer_invoices;
CREATE POLICY photographer_invoices_update ON photographer_invoices FOR UPDATE
  USING (is_company_admin() AND has_company_access(company_id));

-- Mileage logs
DROP POLICY IF EXISTS mileage_logs_select ON mileage_logs;
CREATE POLICY mileage_logs_select ON mileage_logs FOR SELECT
  USING (
    -- Photographer can see their logs
    EXISTS (SELECT 1 FROM photographers p WHERE p.id = photographer_id AND p.user_id = auth.uid()) OR
    has_company_access(company_id)
  );

DROP POLICY IF EXISTS mileage_logs_insert ON mileage_logs;
CREATE POLICY mileage_logs_insert ON mileage_logs FOR INSERT
  WITH CHECK (
    -- Photographer can create their own logs
    EXISTS (SELECT 1 FROM photographers p WHERE p.id = photographer_id AND p.user_id = auth.uid()) OR
    has_company_access(company_id)
  );

DROP POLICY IF EXISTS mileage_logs_update ON mileage_logs;
CREATE POLICY mileage_logs_update ON mileage_logs FOR UPDATE
  USING (has_company_access(company_id));

-- =====================================================
-- MESSAGING POLICIES
-- =====================================================

DROP POLICY IF EXISTS messages_select ON messages;
CREATE POLICY messages_select ON messages FOR SELECT
  USING (
    sender_id = auth.uid() OR
    recipient_id = auth.uid() OR
    EXISTS (SELECT 1 FROM customers c WHERE c.id = recipient_customer_id AND c.user_id = auth.uid()) OR
    has_company_access(company_id)
  );

DROP POLICY IF EXISTS messages_insert ON messages;
CREATE POLICY messages_insert ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() OR
    has_company_access(company_id)
  );

-- =====================================================
-- NOTES & TASKS POLICIES
-- =====================================================

DROP POLICY IF EXISTS notes_select ON notes;
CREATE POLICY notes_select ON notes FOR SELECT
  USING (
    (NOT is_private) OR
    created_by = auth.uid() OR
    has_company_access(company_id)
  );

DROP POLICY IF EXISTS notes_insert ON notes;
CREATE POLICY notes_insert ON notes FOR INSERT
  WITH CHECK (
    created_by = auth.uid() AND
    has_company_access(company_id)
  );

DROP POLICY IF EXISTS notes_update ON notes;
CREATE POLICY notes_update ON notes FOR UPDATE
  USING (created_by = auth.uid() OR is_company_admin());

DROP POLICY IF EXISTS notes_delete ON notes;
CREATE POLICY notes_delete ON notes FOR DELETE
  USING (created_by = auth.uid() OR is_company_admin());

DROP POLICY IF EXISTS tasks_select ON tasks;
CREATE POLICY tasks_select ON tasks FOR SELECT
  USING (
    assigned_to = auth.uid() OR
    assigned_by = auth.uid() OR
    has_company_access(company_id)
  );

DROP POLICY IF EXISTS tasks_insert ON tasks;
CREATE POLICY tasks_insert ON tasks FOR INSERT
  WITH CHECK (has_company_access(company_id));

DROP POLICY IF EXISTS tasks_update ON tasks;
CREATE POLICY tasks_update ON tasks FOR UPDATE
  USING (
    assigned_to = auth.uid() OR
    has_company_access(company_id)
  );

-- =====================================================
-- EQUIPMENT POLICIES
-- =====================================================

DROP POLICY IF EXISTS equipment_select ON equipment;
CREATE POLICY equipment_select ON equipment FOR SELECT
  USING (has_company_access(company_id));

DROP POLICY IF EXISTS equipment_insert ON equipment;
CREATE POLICY equipment_insert ON equipment FOR INSERT
  WITH CHECK (is_company_admin() AND has_company_access(company_id));

DROP POLICY IF EXISTS equipment_update ON equipment;
CREATE POLICY equipment_update ON equipment FOR UPDATE
  USING (is_company_admin() AND has_company_access(company_id));

-- =====================================================
-- AVAILABILITY POLICIES
-- =====================================================

DROP POLICY IF EXISTS availability_blocks_select ON availability_blocks;
CREATE POLICY availability_blocks_select ON availability_blocks FOR SELECT
  USING (
    user_id = auth.uid() OR
    has_company_access(company_id)
  );

DROP POLICY IF EXISTS availability_blocks_insert ON availability_blocks;
CREATE POLICY availability_blocks_insert ON availability_blocks FOR INSERT
  WITH CHECK (
    user_id = auth.uid() OR
    has_company_access(company_id)
  );

DROP POLICY IF EXISTS availability_blocks_update ON availability_blocks;
CREATE POLICY availability_blocks_update ON availability_blocks FOR UPDATE
  USING (
    user_id = auth.uid() OR
    has_company_access(company_id)
  );

DROP POLICY IF EXISTS availability_blocks_delete ON availability_blocks;
CREATE POLICY availability_blocks_delete ON availability_blocks FOR DELETE
  USING (
    user_id = auth.uid() OR
    has_company_access(company_id)
  );

-- =====================================================
-- REVIEW POLICIES
-- =====================================================

DROP POLICY IF EXISTS reviews_select ON reviews;
CREATE POLICY reviews_select ON reviews FOR SELECT
  USING (
    is_public OR
    EXISTS (SELECT 1 FROM customers c WHERE c.id = reviewer_customer_id AND c.user_id = auth.uid()) OR
    has_company_access(company_id)
  );

DROP POLICY IF EXISTS reviews_insert ON reviews;
CREATE POLICY reviews_insert ON reviews FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM customers c WHERE c.id = reviewer_customer_id AND c.user_id = auth.uid()) OR
    has_company_access(company_id)
  );

DROP POLICY IF EXISTS reviews_update ON reviews;
CREATE POLICY reviews_update ON reviews FOR UPDATE
  USING (has_company_access(company_id));

-- =====================================================
-- AUDIT LOG POLICIES
-- =====================================================

DROP POLICY IF EXISTS audit_logs_select ON audit_logs;
CREATE POLICY audit_logs_select ON audit_logs FOR SELECT
  USING (is_company_admin() AND has_company_access(company_id));

DROP POLICY IF EXISTS audit_logs_insert ON audit_logs;
CREATE POLICY audit_logs_insert ON audit_logs FOR INSERT
  WITH CHECK (true); -- System can always insert

-- =====================================================
-- ANALYTICS POLICIES
-- =====================================================

DROP POLICY IF EXISTS kpi_snapshots_select ON kpi_snapshots;
CREATE POLICY kpi_snapshots_select ON kpi_snapshots FOR SELECT
  USING (has_company_access(company_id));

DROP POLICY IF EXISTS dashboards_select ON dashboards;
CREATE POLICY dashboards_select ON dashboards FOR SELECT
  USING (
    is_public OR
    has_company_access(company_id)
  );

DROP POLICY IF EXISTS dashboards_insert ON dashboards;
CREATE POLICY dashboards_insert ON dashboards FOR INSERT
  WITH CHECK (is_company_admin() AND has_company_access(company_id));

DROP POLICY IF EXISTS dashboards_update ON dashboards;
CREATE POLICY dashboards_update ON dashboards FOR UPDATE
  USING (
    created_by = auth.uid() OR
    (is_company_admin() AND has_company_access(company_id))
  );

-- =====================================================
-- SERVICE ROLE BYPASS
-- These allow the service role to bypass RLS
-- =====================================================

-- Grant service role access (used by Edge Functions)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
