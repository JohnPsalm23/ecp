-- =====================================================
-- ECP REAL ESTATE MEDIA OPERATIONS PLATFORM
-- Core Database Schema - Multi-Tenant Architecture
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";

-- =====================================================
-- ENUMS (idempotent - only create if not exists)
-- =====================================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'super_admin', 'company_admin', 'market_manager', 'sales_rep',
    'photographer', 'editor', 'qc_reviewer', 'customer', 'support'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'draft', 'pending_payment', 'confirmed', 'scheduled', 'en_route',
    'started', 'completed', 'uploading', 'editing', 'qc_pending',
    'qc_failed', 'qc_passed', 'delivered', 'cancelled', 'on_hold'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM (
    'scheduled', 'confirmed', 'en_route', 'arrived', 'in_progress',
    'completed', 'cancelled', 'no_show', 'rescheduled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM (
    'pending', 'processing', 'succeeded', 'failed',
    'refunded', 'partially_refunded', 'disputed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE invoice_status AS ENUM (
    'draft', 'pending', 'sent', 'paid', 'overdue', 'cancelled', 'void'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE qc_status AS ENUM (
    'pending', 'in_progress', 'passed', 'warning', 'failed', 'override_approved'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE media_type AS ENUM (
    'photo', 'video', 'drone_photo', 'drone_video', 'matterport',
    'floor_plan', 'virtual_staging', 'twilight', 'document'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE equipment_status AS ENUM (
    'available', 'assigned', 'in_use', 'maintenance', 'retired'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE message_channel AS ENUM ('in_app', 'sms', 'email', 'push');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE availability_type AS ENUM (
    'available', 'unavailable', 'tentative', 'time_off', 'holiday'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE referral_status AS ENUM (
    'pending', 'qualified', 'converted', 'expired', 'rejected'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE discount_type AS ENUM ('percentage', 'fixed_amount', 'free_product');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payroll_status AS ENUM (
    'pending', 'approved', 'processing', 'paid', 'rejected'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE commission_type AS ENUM ('percentage', 'flat_rate', 'tiered');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- CORE TENANT TABLES
-- =====================================================

-- Companies (top-level tenant)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  legal_name VARCHAR(255),
  tax_id VARCHAR(50),
  logo_url TEXT,
  website VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  
  -- Address
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  postal_code VARCHAR(20),
  country VARCHAR(50) DEFAULT 'US',
  
  -- Settings
  settings JSONB DEFAULT '{}',
  features JSONB DEFAULT '{}',
  billing_email VARCHAR(255),
  
  -- Stripe
  stripe_customer_id VARCHAR(100),
  stripe_subscription_id VARCHAR(100),
  
  -- QuickBooks
  quickbooks_company_id VARCHAR(100),
  quickbooks_realm_id VARCHAR(100),
  
  -- HubSpot
  hubspot_portal_id VARCHAR(100),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  trial_ends_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Markets (city/region within a company)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS markets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  code VARCHAR(10), -- e.g., "ATL", "NYC", "LA"
  
  -- Location
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  country VARCHAR(50) DEFAULT 'US',
  timezone VARCHAR(50) NOT NULL, -- e.g., 'America/New_York'
  
  -- Geo bounds for service area
  service_area_geojson JSONB,
  center_lat DECIMAL(10, 7),
  center_lng DECIMAL(10, 7),
  radius_miles INTEGER DEFAULT 50,
  
  -- Settings
  settings JSONB DEFAULT '{}',
  pricing_multiplier DECIMAL(5, 4) DEFAULT 1.0,
  min_lead_time_hours INTEGER DEFAULT 24,
  max_booking_days_ahead INTEGER DEFAULT 60,
  
  -- Operating hours (stored as JSONB for flexibility)
  operating_hours JSONB DEFAULT '{
    "monday": {"open": "08:00", "close": "18:00"},
    "tuesday": {"open": "08:00", "close": "18:00"},
    "wednesday": {"open": "08:00", "close": "18:00"},
    "thursday": {"open": "08:00", "close": "18:00"},
    "friday": {"open": "08:00", "close": "18:00"},
    "saturday": {"open": "09:00", "close": "16:00"},
    "sunday": null
  }',
  
  -- Drone fly zones (restricted areas)
  fly_zones JSONB DEFAULT '[]',
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(company_id, slug)
);

-- =====================================================
-- USER & AUTHENTICATION TABLES
-- =====================================================

-- Users (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  display_name VARCHAR(200) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  
  avatar_url TEXT,
  
  -- Preferences
  timezone VARCHAR(50),
  locale VARCHAR(10) DEFAULT 'en-US',
  notification_preferences JSONB DEFAULT '{
    "email": true,
    "sms": true,
    "push": true,
    "in_app": true
  }',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roles (many-to-many for flexible role assignment)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  market_id UUID REFERENCES markets(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  
  -- Scope defines where this role applies
  is_primary BOOLEAN DEFAULT false,
  
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, company_id, market_id, role)
);

-- Permissions (granular access control)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role permissions mapping
CREATE TABLE IF NOT EXISTS IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role user_role NOT NULL,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role, permission_id)
);

-- User-specific permission overrides
CREATE TABLE IF NOT EXISTS IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted BOOLEAN NOT NULL DEFAULT true, -- true = grant, false = deny
  granted_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, permission_id)
);

-- =====================================================
-- CUSTOMER TABLES
-- =====================================================

-- Customers (property managers, agents, brokers)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Contact info
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  display_name VARCHAR(200) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  
  -- Business info
  business_name VARCHAR(255),
  business_type VARCHAR(50), -- 'agent', 'broker', 'property_manager', 'builder', 'other'
  license_number VARCHAR(100),
  
  -- Address
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  postal_code VARCHAR(20),
  
  -- Primary market
  primary_market_id UUID REFERENCES markets(id),
  
  -- Billing
  billing_email VARCHAR(255),
  stripe_customer_id VARCHAR(100),
  payment_terms INTEGER DEFAULT 0, -- days net
  credit_limit DECIMAL(10, 2) DEFAULT 0,
  current_balance DECIMAL(10, 2) DEFAULT 0,
  
  -- HubSpot
  hubspot_contact_id VARCHAR(100),
  hubspot_company_id VARCHAR(100),
  
  -- Preferences
  preferred_photographers UUID[], -- array of photographer IDs
  preferences JSONB DEFAULT '{}',
  
  -- Ratings
  lifetime_orders INTEGER DEFAULT 0,
  lifetime_revenue DECIMAL(12, 2) DEFAULT 0,
  average_order_value DECIMAL(10, 2) DEFAULT 0,
  
  -- Sales
  assigned_sales_rep_id UUID REFERENCES users(id),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_vip BOOLEAN DEFAULT false,
  tags TEXT[],
  
  -- Source
  referral_source VARCHAR(100),
  referred_by_customer_id UUID REFERENCES customers(id),
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer contacts (additional contacts for a customer account)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS customer_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(100),
  is_primary BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PHOTOGRAPHER TABLES
-- =====================================================

-- Photographers (service providers)
CREATE TABLE IF NOT EXISTS IF NOT EXISTS photographers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Profile
  bio TEXT,
  profile_photo_url TEXT,
  portfolio_url TEXT,
  
  -- Location
  home_address_line1 VARCHAR(255),
  home_address_line2 VARCHAR(255),
  home_city VARCHAR(100),
  home_state VARCHAR(50),
  home_postal_code VARCHAR(20),
  home_lat DECIMAL(10, 7),
  home_lng DECIMAL(10, 7),
  
  -- Service areas
  primary_market_id UUID REFERENCES markets(id),
  service_radius_miles INTEGER DEFAULT 30,
  
  -- Skills & certifications
  skills TEXT[], -- ['photo', 'video', 'drone', 'matterport', 'floor_plan']
  certifications JSONB DEFAULT '[]', -- FAA Part 107, etc.
  
  -- Equipment
  equipment_notes TEXT,
  has_own_equipment BOOLEAN DEFAULT true,
  
  -- Rates
  hourly_rate DECIMAL(8, 2),
  per_job_base_rate DECIMAL(8, 2),
  mileage_rate DECIMAL(5, 3) DEFAULT 0.67,
  
  -- Payroll
  payment_method VARCHAR(50) DEFAULT 'direct_deposit', -- 'check', 'direct_deposit', 'paypal'
  bank_account_last4 VARCHAR(4),
  tax_id_type VARCHAR(10), -- 'SSN', 'EIN'
  tax_id_last4 VARCHAR(4),
  w9_on_file BOOLEAN DEFAULT false,
  
  -- QuickBooks
  quickbooks_vendor_id VARCHAR(100),
  
  -- Performance metrics
  total_jobs_completed INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  on_time_percentage DECIMAL(5, 2) DEFAULT 100,
  qc_pass_rate DECIMAL(5, 2) DEFAULT 100,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true,
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_completed_at TIMESTAMPTZ,
  
  -- Capacity
  max_daily_jobs INTEGER DEFAULT 8,
  preferred_job_types TEXT[],
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(company_id, user_id)
);

-- Photographer market assignments
CREATE TABLE IF NOT EXISTS IF NOT EXISTS photographer_markets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  photographer_id UUID NOT NULL REFERENCES photographers(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  
  is_primary BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 1, -- for scheduling preference
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(photographer_id, market_id)
);

-- =====================================================
-- PRODUCT & SERVICE TABLES
-- =====================================================

-- Product categories
CREATE TABLE IF NOT EXISTS IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  icon VARCHAR(50),
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(company_id, slug)
);

-- Products/Services
CREATE TABLE IF NOT EXISTS IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  
  -- Pricing
  base_price DECIMAL(10, 2) NOT NULL,
  cost DECIMAL(10, 2), -- internal cost for margin tracking
  
  -- Pricing modifiers
  pricing_type VARCHAR(20) DEFAULT 'fixed', -- 'fixed', 'sqft', 'hourly', 'tiered'
  pricing_tiers JSONB, -- for tiered pricing
  
  -- Time
  estimated_duration_minutes INTEGER DEFAULT 60,
  setup_time_minutes INTEGER DEFAULT 0,
  
  -- Media
  thumbnail_url TEXT,
  gallery_urls TEXT[],
  
  -- Requirements
  required_skills TEXT[],
  required_equipment TEXT[],
  
  -- Deliverables
  deliverable_count INTEGER, -- expected number of photos/assets
  deliverable_types media_type[],
  turnaround_hours INTEGER DEFAULT 24,
  
  -- Availability
  available_markets UUID[], -- null means all markets
  lead_time_hours INTEGER DEFAULT 24,
  
  -- Upsells
  upsell_product_ids UUID[],
  addon_product_ids UUID[],
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(company_id, slug)
);

-- Product bundles
CREATE TABLE IF NOT EXISTS IF NOT EXISTS product_bundles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Pricing
  bundle_price DECIMAL(10, 2) NOT NULL, -- discounted price
  original_price DECIMAL(10, 2) NOT NULL, -- sum of individual products
  savings_amount DECIMAL(10, 2) GENERATED ALWAYS AS (original_price - bundle_price) STORED,
  savings_percentage DECIMAL(5, 2),
  
  -- Media
  thumbnail_url TEXT,
  
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(company_id, slug)
);

-- Bundle items
CREATE TABLE IF NOT EXISTS IF NOT EXISTS bundle_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bundle_id UUID NOT NULL REFERENCES product_bundles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  quantity INTEGER DEFAULT 1,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(bundle_id, product_id)
);

-- Market-specific pricing overrides
CREATE TABLE IF NOT EXISTS IF NOT EXISTS market_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  price_override DECIMAL(10, 2),
  multiplier DECIMAL(5, 4), -- alternative to fixed override
  
  is_available BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(market_id, product_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Companies
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_stripe ON companies(stripe_customer_id);

-- Markets
CREATE INDEX IF NOT EXISTS idx_markets_company ON markets(company_id);
CREATE INDEX IF NOT EXISTS idx_markets_slug ON markets(company_id, slug);
CREATE INDEX IF NOT EXISTS idx_markets_timezone ON markets(timezone);

-- Users
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- User roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_company ON user_roles(company_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_market ON user_roles(market_id);

-- Customers
CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(company_id, email);
CREATE INDEX IF NOT EXISTS idx_customers_market ON customers(primary_market_id);
CREATE INDEX IF NOT EXISTS idx_customers_sales_rep ON customers(assigned_sales_rep_id);
CREATE INDEX IF NOT EXISTS idx_customers_stripe ON customers(stripe_customer_id);

-- Photographers
CREATE INDEX IF NOT EXISTS idx_photographers_company ON photographers(company_id);
CREATE INDEX IF NOT EXISTS idx_photographers_user ON photographers(user_id);
CREATE INDEX IF NOT EXISTS idx_photographers_market ON photographers(primary_market_id);
CREATE INDEX IF NOT EXISTS idx_photographers_active ON photographers(company_id, is_active, is_available);

-- Products
CREATE INDEX IF NOT EXISTS idx_products_company ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(company_id, slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(company_id, is_active);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_markets_updated_at BEFORE UPDATE ON markets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_photographers_updated_at BEFORE UPDATE ON photographers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_bundles_updated_at BEFORE UPDATE ON product_bundles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
