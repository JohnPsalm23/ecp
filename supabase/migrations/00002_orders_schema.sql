-- =====================================================
-- ORDERS & APPOINTMENTS SCHEMA
-- =====================================================

-- Properties (locations for shoots)
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  
  -- Address
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(50) DEFAULT 'US',
  
  -- Full formatted address for display
  formatted_address TEXT,
  
  -- Geocoding
  lat DECIMAL(10, 7),
  lng DECIMAL(10, 7),
  place_id VARCHAR(255), -- Google Places ID
  
  -- Property details
  property_type VARCHAR(50), -- 'residential', 'commercial', 'land', 'multi-family'
  square_feet INTEGER,
  bedrooms INTEGER,
  bathrooms DECIMAL(3, 1),
  lot_size_sqft INTEGER,
  year_built INTEGER,
  
  -- MLS
  mls_number VARCHAR(50),
  listing_price DECIMAL(14, 2),
  
  -- Access
  access_instructions TEXT,
  lockbox_code VARCHAR(50),
  gate_code VARCHAR(50),
  has_pets BOOLEAN DEFAULT false,
  pet_instructions TEXT,
  
  -- HOA/Community
  community_name VARCHAR(255),
  hoa_contact VARCHAR(255),
  requires_hoa_approval BOOLEAN DEFAULT false,
  
  -- Drone
  in_fly_zone BOOLEAN DEFAULT false,
  fly_zone_type VARCHAR(50), -- 'no-fly', 'laanc-required', 'restricted'
  
  -- Market assignment
  market_id UUID REFERENCES markets(id),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES markets(id) ON DELETE RESTRICT,
  
  -- Order number (human-readable)
  order_number VARCHAR(20) NOT NULL,
  
  -- Customer
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  customer_contact_id UUID REFERENCES customer_contacts(id),
  
  -- Property
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
  
  -- Status
  status order_status NOT NULL DEFAULT 'draft',
  status_changed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Scheduling preferences
  preferred_date DATE,
  preferred_time_start TIME,
  preferred_time_end TIME,
  is_flexible_time BOOLEAN DEFAULT false,
  is_rush BOOLEAN DEFAULT false,
  rush_fee DECIMAL(10, 2) DEFAULT 0,
  
  -- Pricing
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  discount_code VARCHAR(50),
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  tax_rate DECIMAL(5, 4) DEFAULT 0,
  rush_fee_amount DECIMAL(10, 2) DEFAULT 0,
  travel_fee DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  
  -- Payment
  payment_status payment_status DEFAULT 'pending',
  payment_method VARCHAR(50),
  stripe_payment_intent_id VARCHAR(255),
  paid_at TIMESTAMPTZ,
  
  -- Delivery
  expected_delivery_at TIMESTAMPTZ,
  actual_delivery_at TIMESTAMPTZ,
  delivery_url TEXT,
  delivery_password VARCHAR(100),
  
  -- Tracking
  source VARCHAR(50), -- 'web', 'app', 'phone', 'api', 'hubspot'
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  
  -- Sales
  sales_rep_id UUID REFERENCES users(id),
  commission_rate DECIMAL(5, 4),
  
  -- Referral/Coupon
  coupon_id UUID,
  referral_id UUID,
  
  -- Notes
  customer_notes TEXT,
  internal_notes TEXT,
  
  -- Cancellation
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES users(id),
  cancellation_reason TEXT,
  cancellation_fee DECIMAL(10, 2) DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  UNIQUE(company_id, order_number)
);

-- Order items (products in an order)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  bundle_id UUID REFERENCES product_bundles(id) ON DELETE SET NULL,
  
  -- Snapshot of product at time of order
  product_name VARCHAR(255) NOT NULL,
  product_description TEXT,
  
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total_price DECIMAL(10, 2) NOT NULL,
  
  -- Photographer cost
  photographer_payout DECIMAL(10, 2),
  
  -- Requirements
  estimated_duration_minutes INTEGER,
  required_skills TEXT[],
  
  -- Turnaround
  turnaround_hours INTEGER,
  
  -- Status
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments (scheduled shoots)
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Scheduling
  scheduled_date DATE NOT NULL,
  scheduled_start_time TIME NOT NULL,
  scheduled_end_time TIME NOT NULL,
  timezone VARCHAR(50) NOT NULL,
  
  -- Duration
  estimated_duration_minutes INTEGER NOT NULL,
  actual_duration_minutes INTEGER,
  
  -- Assignment
  photographer_id UUID REFERENCES photographers(id),
  assigned_at TIMESTAMPTZ,
  assigned_by UUID REFERENCES users(id),
  
  -- Status
  status appointment_status NOT NULL DEFAULT 'scheduled',
  status_changed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Check-in/out
  checked_in_at TIMESTAMPTZ,
  checked_in_lat DECIMAL(10, 7),
  checked_in_lng DECIMAL(10, 7),
  checked_out_at TIMESTAMPTZ,
  checked_out_lat DECIMAL(10, 7),
  checked_out_lng DECIMAL(10, 7),
  
  -- Travel
  travel_distance_miles DECIMAL(8, 2),
  travel_duration_minutes INTEGER,
  en_route_at TIMESTAMPTZ,
  arrived_at TIMESTAMPTZ,
  
  -- Confirmation
  customer_confirmed BOOLEAN DEFAULT false,
  customer_confirmed_at TIMESTAMPTZ,
  photographer_confirmed BOOLEAN DEFAULT false,
  photographer_confirmed_at TIMESTAMPTZ,
  
  -- Equipment checklist
  equipment_checklist JSONB DEFAULT '[]',
  equipment_verified BOOLEAN DEFAULT false,
  
  -- Reschedule history
  reschedule_count INTEGER DEFAULT 0,
  last_rescheduled_at TIMESTAMPTZ,
  rescheduled_by UUID REFERENCES users(id),
  reschedule_reason TEXT,
  original_date DATE,
  original_time TIME,
  
  -- Notes
  notes TEXT,
  photographer_notes TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order status events (audit trail)
CREATE TABLE IF NOT EXISTS order_status_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  previous_status order_status,
  new_status order_status NOT NULL,
  
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- For notifications
  notification_sent BOOLEAN DEFAULT false,
  notification_sent_at TIMESTAMPTZ
);

-- Appointment status events
CREATE TABLE IF NOT EXISTS appointment_status_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  
  previous_status appointment_status,
  new_status appointment_status NOT NULL,
  
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  
  reason TEXT,
  metadata JSONB DEFAULT '{}'
);

-- =====================================================
-- DELIVERABLES & MEDIA
-- =====================================================

-- Deliverables (what's expected for an order)
CREATE TABLE IF NOT EXISTS deliverables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  media_type media_type NOT NULL,
  
  -- Requirements
  expected_count INTEGER,
  minimum_count INTEGER,
  
  -- Status
  is_delivered BOOLEAN DEFAULT false,
  delivered_at TIMESTAMPTZ,
  delivered_count INTEGER DEFAULT 0,
  
  -- QC
  qc_required BOOLEAN DEFAULT true,
  qc_status qc_status DEFAULT 'pending',
  qc_passed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media assets (uploaded files)
CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  deliverable_id UUID REFERENCES deliverables(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  
  -- File info
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255),
  file_extension VARCHAR(20),
  mime_type VARCHAR(100),
  file_size_bytes BIGINT,
  
  -- Storage
  storage_bucket VARCHAR(100) NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  signed_url TEXT,
  signed_url_expires_at TIMESTAMPTZ,
  
  -- Media details
  media_type media_type NOT NULL,
  width INTEGER,
  height INTEGER,
  duration_seconds INTEGER, -- for video
  
  -- Processing
  is_processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  thumbnail_url TEXT,
  preview_url TEXT,
  
  -- Metadata (EXIF, etc.)
  exif_data JSONB DEFAULT '{}',
  
  -- Editing
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  edited_by UUID REFERENCES users(id),
  original_asset_id UUID REFERENCES media_assets(id), -- if this is an edited version
  edit_version INTEGER DEFAULT 1,
  
  -- QC
  qc_status qc_status DEFAULT 'pending',
  qc_score INTEGER,
  qc_notes TEXT,
  qc_issues JSONB DEFAULT '[]',
  qc_reviewed_at TIMESTAMPTZ,
  qc_reviewed_by UUID REFERENCES users(id),
  
  -- AI analysis
  ai_analysis JSONB DEFAULT '{}',
  ai_tags TEXT[],
  ai_description TEXT,
  
  -- Room/scene classification
  room_type VARCHAR(50),
  scene_type VARCHAR(50),
  
  -- Ordering
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_cover BOOLEAN DEFAULT false,
  
  -- Status
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  
  -- Uploaded by
  uploaded_by UUID REFERENCES users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Upload jobs (batch upload tracking)
CREATE TABLE IF NOT EXISTS upload_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id),
  
  -- Upload info
  uploaded_by UUID NOT NULL REFERENCES users(id),
  upload_source VARCHAR(50), -- 'web', 'app', 'api'
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  
  -- Counts
  total_files INTEGER DEFAULT 0,
  processed_files INTEGER DEFAULT 0,
  failed_files INTEGER DEFAULT 0,
  
  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Errors
  errors JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Edit requests
CREATE TABLE IF NOT EXISTS edit_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  media_asset_id UUID REFERENCES media_assets(id) ON DELETE CASCADE,
  
  -- Request details
  request_type VARCHAR(50) NOT NULL, -- 'reshoot', 'retouch', 'crop', 'color_correction', 'other'
  description TEXT NOT NULL,
  
  -- Requester
  requested_by UUID NOT NULL REFERENCES users(id),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Assignment
  assigned_to UUID REFERENCES users(id),
  assigned_at TIMESTAMPTZ,
  
  -- Status
  status task_status DEFAULT 'pending',
  
  -- Resolution
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id),
  resolution_notes TEXT,
  
  -- New asset if created
  new_asset_id UUID REFERENCES media_assets(id),
  
  -- Priority
  priority task_priority DEFAULT 'medium',
  due_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Properties
CREATE INDEX IF NOT EXISTS idx_properties_company ON properties(company_id);
CREATE INDEX IF NOT EXISTS idx_properties_customer ON properties(customer_id);
CREATE INDEX IF NOT EXISTS idx_properties_market ON properties(market_id);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(lat, lng);
CREATE INDEX IF NOT EXISTS idx_properties_address ON properties USING gin(to_tsvector('english', formatted_address));

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_company ON orders(company_id);
CREATE INDEX IF NOT EXISTS idx_orders_market ON orders(market_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_property ON orders(property_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(company_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(company_id, preferred_date);
CREATE INDEX IF NOT EXISTS idx_orders_sales_rep ON orders(sales_rep_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(company_id, created_at DESC);

-- Order items
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- Appointments
CREATE INDEX IF NOT EXISTS idx_appointments_company ON appointments(company_id);
CREATE INDEX IF NOT EXISTS idx_appointments_order ON appointments(order_id);
CREATE INDEX IF NOT EXISTS idx_appointments_photographer ON appointments(photographer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(company_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(company_id, status);
CREATE INDEX IF NOT EXISTS idx_appointments_photographer_date ON appointments(photographer_id, scheduled_date);

-- Order status events
CREATE INDEX IF NOT EXISTS idx_order_status_events_order ON order_status_events(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_events_date ON order_status_events(changed_at DESC);

-- Media assets
CREATE INDEX IF NOT EXISTS idx_media_assets_company ON media_assets(company_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_order ON media_assets(order_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_deliverable ON media_assets(deliverable_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_type ON media_assets(company_id, media_type);
CREATE INDEX IF NOT EXISTS idx_media_assets_qc ON media_assets(company_id, qc_status);

-- Upload jobs
CREATE INDEX IF NOT EXISTS idx_upload_jobs_company ON upload_jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_upload_jobs_order ON upload_jobs(order_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update order status timestamp
CREATE OR REPLACE FUNCTION update_order_status_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.status_changed_at = NOW();
    
    -- Insert status event
    INSERT INTO order_status_events (order_id, previous_status, new_status)
    VALUES (NEW.id, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS order_status_change ON orders;
CREATE TRIGGER order_status_change BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_order_status_timestamp();

-- Update appointment status timestamp
CREATE OR REPLACE FUNCTION update_appointment_status_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.status_changed_at = NOW();
    
    -- Insert status event
    INSERT INTO appointment_status_events (appointment_id, previous_status, new_status)
    VALUES (NEW.id, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS appointment_status_change ON appointments;
CREATE TRIGGER appointment_status_change BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_appointment_status_timestamp();

-- Recalculate order totals
CREATE OR REPLACE FUNCTION recalculate_order_totals()
RETURNS TRIGGER AS $$
DECLARE
  new_subtotal DECIMAL(10, 2);
BEGIN
  SELECT COALESCE(SUM(total_price), 0) INTO new_subtotal
  FROM order_items
  WHERE order_id = COALESCE(NEW.order_id, OLD.order_id);
  
  UPDATE orders
  SET 
    subtotal = new_subtotal,
    total = new_subtotal - discount_amount + tax_amount + rush_fee_amount + travel_fee
  WHERE id = COALESCE(NEW.order_id, OLD.order_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS recalc_order_totals_insert ON order_items;
CREATE TRIGGER recalc_order_totals_insert AFTER INSERT ON order_items
  FOR EACH ROW EXECUTE FUNCTION recalculate_order_totals();

DROP TRIGGER IF EXISTS recalc_order_totals_update ON order_items;
CREATE TRIGGER recalc_order_totals_update AFTER UPDATE ON order_items
  FOR EACH ROW EXECUTE FUNCTION recalculate_order_totals();

DROP TRIGGER IF EXISTS recalc_order_totals_delete ON order_items;
CREATE TRIGGER recalc_order_totals_delete AFTER DELETE ON order_items
  FOR EACH ROW EXECUTE FUNCTION recalculate_order_totals();

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_deliverables_updated_at ON deliverables;
CREATE TRIGGER update_deliverables_updated_at BEFORE UPDATE ON deliverables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_media_assets_updated_at ON media_assets;
CREATE TRIGGER update_media_assets_updated_at BEFORE UPDATE ON media_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_edit_requests_updated_at ON edit_requests;
CREATE TRIGGER update_edit_requests_updated_at BEFORE UPDATE ON edit_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
