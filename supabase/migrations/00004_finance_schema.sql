-- =====================================================
-- FINANCE, INVOICING & PAYROLL SCHEMA
-- =====================================================

-- Customer invoices
CREATE TABLE customer_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  
  -- Invoice number
  invoice_number VARCHAR(50) NOT NULL,
  
  -- Associated orders
  order_ids UUID[] NOT NULL,
  
  -- Dates
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  
  -- Amounts
  subtotal DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  amount_due DECIMAL(10, 2) GENERATED ALWAYS AS (total - amount_paid) STORED,
  
  -- Status
  status invoice_status NOT NULL DEFAULT 'draft',
  
  -- Payment
  payment_terms INTEGER DEFAULT 0, -- Net days
  stripe_invoice_id VARCHAR(255),
  
  -- QuickBooks
  quickbooks_invoice_id VARCHAR(100),
  quickbooks_sync_status VARCHAR(20),
  quickbooks_synced_at TIMESTAMPTZ,
  
  -- Sending
  sent_at TIMESTAMPTZ,
  sent_to VARCHAR(255),
  viewed_at TIMESTAMPTZ,
  
  -- PDF
  pdf_url TEXT,
  
  -- Notes
  notes TEXT,
  internal_notes TEXT,
  
  -- Reminders
  reminder_count INTEGER DEFAULT 0,
  last_reminder_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(company_id, invoice_number)
);

-- Invoice line items
CREATE TABLE customer_invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES customer_invoices(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  order_item_id UUID REFERENCES order_items(id),
  
  description VARCHAR(500) NOT NULL,
  quantity DECIMAL(10, 2) DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice payments
CREATE TABLE invoice_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES customer_invoices(id) ON DELETE CASCADE,
  
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50), -- 'credit_card', 'ach', 'check', 'cash', 'other'
  
  -- Reference
  reference_number VARCHAR(100),
  stripe_payment_id VARCHAR(255),
  
  -- Status
  status payment_status NOT NULL DEFAULT 'pending',
  
  -- Dates
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  processed_at TIMESTAMPTZ,
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Photographer invoices (payroll)
CREATE TABLE photographer_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  photographer_id UUID NOT NULL REFERENCES photographers(id) ON DELETE RESTRICT,
  
  -- Invoice number
  invoice_number VARCHAR(50) NOT NULL,
  
  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Earnings breakdown
  job_earnings DECIMAL(10, 2) DEFAULT 0,
  mileage_earnings DECIMAL(10, 2) DEFAULT 0,
  bonus_earnings DECIMAL(10, 2) DEFAULT 0,
  incentive_earnings DECIMAL(10, 2) DEFAULT 0,
  adjustment_amount DECIMAL(10, 2) DEFAULT 0,
  
  -- Totals
  gross_total DECIMAL(10, 2) NOT NULL,
  deductions DECIMAL(10, 2) DEFAULT 0,
  net_total DECIMAL(10, 2) NOT NULL,
  
  -- Status
  status payroll_status NOT NULL DEFAULT 'pending',
  
  -- Approval
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  
  -- Payment
  paid_at TIMESTAMPTZ,
  payment_method VARCHAR(50),
  payment_reference VARCHAR(255),
  
  -- QuickBooks
  quickbooks_bill_id VARCHAR(100),
  quickbooks_payment_id VARCHAR(100),
  quickbooks_sync_status VARCHAR(20),
  quickbooks_synced_at TIMESTAMPTZ,
  
  -- PDF
  pdf_url TEXT,
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(company_id, invoice_number)
);

-- Photographer invoice line items
CREATE TABLE photographer_invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES photographer_invoices(id) ON DELETE CASCADE,
  
  -- Source
  order_id UUID REFERENCES orders(id),
  appointment_id UUID REFERENCES appointments(id),
  
  -- Item details
  item_type VARCHAR(50) NOT NULL, -- 'job', 'mileage', 'bonus', 'incentive', 'adjustment', 'deduction'
  description VARCHAR(500) NOT NULL,
  
  quantity DECIMAL(10, 2) DEFAULT 1,
  rate DECIMAL(10, 2),
  amount DECIMAL(10, 2) NOT NULL,
  
  -- Date
  service_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Commissions
CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Who earns it
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  
  -- Source
  order_id UUID REFERENCES orders(id),
  customer_id UUID REFERENCES customers(id),
  
  -- Commission details
  commission_type commission_type NOT NULL,
  commission_rate DECIMAL(5, 4),
  commission_amount DECIMAL(10, 2) NOT NULL,
  
  -- Basis
  order_total DECIMAL(10, 2),
  qualifying_amount DECIMAL(10, 2),
  
  -- Status
  status payroll_status DEFAULT 'pending',
  
  -- Period
  earned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  pay_period_start DATE,
  pay_period_end DATE,
  
  -- Payment
  paid_at TIMESTAMPTZ,
  payment_reference VARCHAR(255),
  
  -- Invoice
  photographer_invoice_id UUID REFERENCES photographer_invoices(id),
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bonuses
CREATE TABLE bonuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Recipient
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  photographer_id UUID REFERENCES photographers(id),
  
  -- Bonus details
  bonus_type VARCHAR(50) NOT NULL, -- 'performance', 'referral', 'retention', 'holiday', 'spot', 'other'
  name VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  
  -- Criteria (if rule-based)
  criteria JSONB,
  
  -- Status
  status payroll_status DEFAULT 'pending',
  
  -- Approval
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  
  -- Payment
  earned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  paid_at TIMESTAMPTZ,
  
  -- Invoice
  photographer_invoice_id UUID REFERENCES photographer_invoices(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incentive programs
CREATE TABLE incentive_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Type
  program_type VARCHAR(50) NOT NULL, -- 'volume', 'quality', 'availability', 'referral', 'custom'
  
  -- Eligibility
  eligible_roles user_role[],
  eligible_markets UUID[],
  
  -- Criteria
  criteria JSONB NOT NULL,
  /*
  Example:
  {
    "metric": "jobs_completed",
    "threshold": 50,
    "period": "monthly",
    "payout_amount": 500,
    "payout_type": "flat"
  }
  */
  
  -- Tiers (for tiered incentives)
  tiers JSONB,
  
  -- Duration
  start_date DATE NOT NULL,
  end_date DATE,
  
  -- Budget
  budget DECIMAL(10, 2),
  spent DECIMAL(10, 2) DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incentive payouts
CREATE TABLE incentive_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incentive_program_id UUID NOT NULL REFERENCES incentive_programs(id) ON DELETE CASCADE,
  
  -- Recipient
  user_id UUID NOT NULL REFERENCES users(id),
  photographer_id UUID REFERENCES photographers(id),
  
  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Achievement
  metric_value DECIMAL(12, 2),
  threshold_met BOOLEAN DEFAULT false,
  tier_achieved VARCHAR(50),
  
  -- Payout
  payout_amount DECIMAL(10, 2) NOT NULL,
  
  -- Status
  status payroll_status DEFAULT 'pending',
  
  -- Payment
  paid_at TIMESTAMPTZ,
  photographer_invoice_id UUID REFERENCES photographer_invoices(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mileage logs
CREATE TABLE mileage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  photographer_id UUID NOT NULL REFERENCES photographers(id) ON DELETE CASCADE,
  
  -- Associated entities
  appointment_id UUID REFERENCES appointments(id),
  order_id UUID REFERENCES orders(id),
  
  -- Date
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Route
  start_address TEXT NOT NULL,
  start_lat DECIMAL(10, 7),
  start_lng DECIMAL(10, 7),
  
  end_address TEXT NOT NULL,
  end_lat DECIMAL(10, 7),
  end_lng DECIMAL(10, 7),
  
  -- Distance
  distance_miles DECIMAL(8, 2) NOT NULL,
  
  -- Calculation
  rate_per_mile DECIMAL(5, 3) NOT NULL,
  reimbursement_amount DECIMAL(8, 2) GENERATED ALWAYS AS (distance_miles * rate_per_mile) STORED,
  
  -- Source
  source VARCHAR(20) DEFAULT 'manual', -- 'manual', 'gps', 'calculated'
  gps_track JSONB, -- array of lat/lng points
  
  -- Status
  status payroll_status DEFAULT 'pending',
  
  -- Approval
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  
  -- Invoice
  photographer_invoice_id UUID REFERENCES photographer_invoices(id),
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clock in/out records
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Time
  clock_in TIMESTAMPTZ NOT NULL,
  clock_out TIMESTAMPTZ,
  
  -- Location
  clock_in_lat DECIMAL(10, 7),
  clock_in_lng DECIMAL(10, 7),
  clock_out_lat DECIMAL(10, 7),
  clock_out_lng DECIMAL(10, 7),
  
  -- Duration
  duration_minutes INTEGER,
  
  -- Type
  entry_type VARCHAR(50) DEFAULT 'regular', -- 'regular', 'overtime', 'break', 'on_call'
  
  -- Associated work
  appointment_id UUID REFERENCES appointments(id),
  
  -- Status
  status payroll_status DEFAULT 'pending',
  
  -- Approval
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coupons
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Discount
  discount_type discount_type NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  max_discount_amount DECIMAL(10, 2),
  
  -- Eligibility
  minimum_order_value DECIMAL(10, 2),
  applicable_products UUID[],
  applicable_categories UUID[],
  applicable_markets UUID[],
  
  -- Customer restrictions
  customer_type VARCHAR(50), -- 'new', 'existing', 'vip', 'all'
  customer_ids UUID[], -- specific customers
  
  -- Usage limits
  max_uses INTEGER,
  max_uses_per_customer INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  
  -- Validity
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Source
  campaign VARCHAR(100),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(company_id, code)
);

-- Coupon usage
CREATE TABLE coupon_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id),
  
  discount_amount DECIMAL(10, 2) NOT NULL,
  
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referrals
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Referrer
  referrer_customer_id UUID REFERENCES customers(id),
  referrer_user_id UUID REFERENCES users(id),
  referrer_type VARCHAR(20) NOT NULL, -- 'customer', 'employee', 'photographer'
  
  -- Referred
  referred_customer_id UUID REFERENCES customers(id),
  referred_email VARCHAR(255),
  referred_name VARCHAR(255),
  referred_phone VARCHAR(20),
  
  -- Referral code
  referral_code VARCHAR(50) NOT NULL,
  
  -- Status
  status referral_status DEFAULT 'pending',
  
  -- Qualification
  qualified_at TIMESTAMPTZ,
  qualification_order_id UUID REFERENCES orders(id),
  
  -- Rewards
  referrer_reward_type VARCHAR(20), -- 'credit', 'cash', 'percentage'
  referrer_reward_amount DECIMAL(10, 2),
  referrer_reward_paid BOOLEAN DEFAULT false,
  referrer_reward_paid_at TIMESTAMPTZ,
  
  referred_reward_type VARCHAR(20),
  referred_reward_amount DECIMAL(10, 2),
  referred_reward_applied BOOLEAN DEFAULT false,
  
  -- Tracking
  source VARCHAR(100),
  
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(company_id, referral_code)
);

-- Customer credits
CREATE TABLE customer_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Credit details
  amount DECIMAL(10, 2) NOT NULL,
  remaining_amount DECIMAL(10, 2) NOT NULL,
  
  -- Source
  source_type VARCHAR(50) NOT NULL, -- 'referral', 'refund', 'goodwill', 'promotion', 'manual'
  source_id UUID, -- referral_id, order_id, etc.
  
  description TEXT,
  
  -- Validity
  expires_at TIMESTAMPTZ,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit transactions
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  credit_id UUID NOT NULL REFERENCES customer_credits(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  
  -- Transaction
  transaction_type VARCHAR(20) NOT NULL, -- 'credit', 'debit'
  amount DECIMAL(10, 2) NOT NULL,
  
  description TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Customer invoices
CREATE INDEX idx_customer_invoices_company ON customer_invoices(company_id);
CREATE INDEX idx_customer_invoices_customer ON customer_invoices(customer_id);
CREATE INDEX idx_customer_invoices_status ON customer_invoices(company_id, status);
CREATE INDEX idx_customer_invoices_due_date ON customer_invoices(due_date);

-- Photographer invoices
CREATE INDEX idx_photographer_invoices_company ON photographer_invoices(company_id);
CREATE INDEX idx_photographer_invoices_photographer ON photographer_invoices(photographer_id);
CREATE INDEX idx_photographer_invoices_status ON photographer_invoices(status);
CREATE INDEX idx_photographer_invoices_period ON photographer_invoices(period_start, period_end);

-- Commissions
CREATE INDEX idx_commissions_company ON commissions(company_id);
CREATE INDEX idx_commissions_user ON commissions(user_id);
CREATE INDEX idx_commissions_order ON commissions(order_id);
CREATE INDEX idx_commissions_status ON commissions(status);

-- Mileage
CREATE INDEX idx_mileage_logs_photographer ON mileage_logs(photographer_id);
CREATE INDEX idx_mileage_logs_date ON mileage_logs(log_date);
CREATE INDEX idx_mileage_logs_status ON mileage_logs(status);

-- Coupons
CREATE INDEX idx_coupons_company ON coupons(company_id);
CREATE INDEX idx_coupons_code ON coupons(company_id, code);
CREATE INDEX idx_coupons_active ON coupons(company_id, is_active, start_date, end_date);

-- Referrals
CREATE INDEX idx_referrals_company ON referrals(company_id);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_customer_id);
CREATE INDEX idx_referrals_code ON referrals(company_id, referral_code);

-- Credits
CREATE INDEX idx_customer_credits_customer ON customer_credits(customer_id);
CREATE INDEX idx_customer_credits_active ON customer_credits(customer_id, is_active);

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_customer_invoices_updated_at BEFORE UPDATE ON customer_invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_photographer_invoices_updated_at BEFORE UPDATE ON photographer_invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incentive_programs_updated_at BEFORE UPDATE ON incentive_programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON time_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update coupon usage count
CREATE OR REPLACE FUNCTION update_coupon_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE coupons
  SET current_uses = current_uses + 1
  WHERE id = NEW.coupon_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER coupon_usage_increment AFTER INSERT ON coupon_usage
  FOR EACH ROW EXECUTE FUNCTION update_coupon_usage_count();

-- Update credit remaining amount
CREATE OR REPLACE FUNCTION update_credit_remaining()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE customer_credits
  SET remaining_amount = remaining_amount + CASE 
    WHEN NEW.transaction_type = 'credit' THEN NEW.amount
    ELSE -NEW.amount
  END
  WHERE id = NEW.credit_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER credit_transaction_update AFTER INSERT ON credit_transactions
  FOR EACH ROW EXECUTE FUNCTION update_credit_remaining();
