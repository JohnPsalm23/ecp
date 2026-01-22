-- =====================================================
-- OPERATIONS SCHEMA
-- Scheduling, Calendars, Equipment, Messaging, Tasks
-- =====================================================

-- Calendar availability blocks
CREATE TABLE availability_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  photographer_id UUID REFERENCES photographers(id) ON DELETE CASCADE,
  
  -- Type
  availability_type availability_type NOT NULL,
  
  -- Time range
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  timezone VARCHAR(50) NOT NULL,
  
  -- Recurrence
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT, -- iCal RRULE format
  recurrence_end DATE,
  parent_block_id UUID REFERENCES availability_blocks(id), -- for recurring instances
  
  -- Scope
  market_id UUID REFERENCES markets(id), -- if market-specific availability
  
  -- Details
  title VARCHAR(255),
  notes TEXT,
  
  -- Source
  source VARCHAR(50) DEFAULT 'manual', -- 'manual', 'google_calendar', 'outlook', 'system'
  external_id VARCHAR(255), -- for synced calendars
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Holiday schedules
CREATE TABLE holidays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  market_id UUID REFERENCES markets(id), -- null = company-wide
  
  name VARCHAR(255) NOT NULL,
  holiday_date DATE NOT NULL,
  
  -- Operating status
  is_closed BOOLEAN DEFAULT true,
  modified_hours JSONB, -- if operating with modified hours
  
  -- Recurring
  is_annual BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipment
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Equipment info
  name VARCHAR(255) NOT NULL,
  equipment_type VARCHAR(50) NOT NULL, -- 'camera', 'drone', 'tripod', 'lighting', 'matterport', 'other'
  brand VARCHAR(100),
  model VARCHAR(100),
  serial_number VARCHAR(100),
  
  -- Purchase info
  purchase_date DATE,
  purchase_price DECIMAL(10, 2),
  vendor VARCHAR(255),
  
  -- Warranty
  warranty_expires DATE,
  warranty_notes TEXT,
  
  -- Assignment
  assigned_to UUID REFERENCES photographers(id),
  assigned_at TIMESTAMPTZ,
  
  -- Location
  current_location VARCHAR(255),
  market_id UUID REFERENCES markets(id),
  
  -- Status
  status equipment_status DEFAULT 'available',
  condition VARCHAR(20) DEFAULT 'good', -- 'new', 'good', 'fair', 'poor'
  
  -- Maintenance
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  maintenance_notes TEXT,
  
  -- Depreciation
  useful_life_months INTEGER,
  current_value DECIMAL(10, 2),
  
  -- Metadata
  specifications JSONB DEFAULT '{}',
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(company_id, serial_number)
);

-- Equipment assignments history
CREATE TABLE equipment_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  photographer_id UUID NOT NULL REFERENCES photographers(id) ON DELETE CASCADE,
  
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  returned_at TIMESTAMPTZ,
  
  assigned_by UUID REFERENCES users(id),
  
  condition_at_assignment VARCHAR(20),
  condition_at_return VARCHAR(20),
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipment maintenance logs
CREATE TABLE equipment_maintenance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  
  maintenance_type VARCHAR(50) NOT NULL, -- 'cleaning', 'repair', 'calibration', 'firmware', 'inspection'
  description TEXT,
  
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  performed_by UUID REFERENCES users(id),
  
  cost DECIMAL(10, 2),
  vendor VARCHAR(255),
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Participants
  sender_id UUID REFERENCES users(id),
  sender_type VARCHAR(20), -- 'user', 'customer', 'system', 'ai'
  
  recipient_id UUID REFERENCES users(id),
  recipient_customer_id UUID REFERENCES customers(id),
  recipient_type VARCHAR(20) NOT NULL, -- 'user', 'customer', 'photographer'
  
  -- Thread
  thread_id UUID,
  parent_message_id UUID REFERENCES messages(id),
  
  -- Context
  order_id UUID REFERENCES orders(id),
  appointment_id UUID REFERENCES appointments(id),
  
  -- Content
  channel message_channel NOT NULL,
  subject VARCHAR(255),
  body TEXT NOT NULL,
  body_html TEXT,
  
  -- Attachments
  attachments JSONB DEFAULT '[]',
  
  -- External references
  external_message_id VARCHAR(255), -- Twilio SID, SendGrid ID, etc.
  
  -- Status
  status VARCHAR(20) DEFAULT 'sent', -- 'pending', 'sent', 'delivered', 'failed', 'bounced'
  
  -- Read status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  -- Delivery tracking
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  
  -- AI
  is_ai_generated BOOLEAN DEFAULT false,
  ai_context JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message templates
CREATE TABLE message_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Template content
  channel message_channel NOT NULL,
  subject VARCHAR(255),
  body TEXT NOT NULL,
  body_html TEXT,
  
  -- Variables
  variables JSONB DEFAULT '[]', -- available merge tags
  
  -- Trigger
  trigger_event VARCHAR(100), -- for auto-send templates
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(company_id, slug)
);

-- Notes (internal/private notes on entities)
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Target entity
  entity_type VARCHAR(50) NOT NULL, -- 'customer', 'order', 'photographer', 'property', 'appointment'
  entity_id UUID NOT NULL,
  
  -- Note content
  content TEXT NOT NULL,
  
  -- Visibility
  is_private BOOLEAN DEFAULT false, -- only visible to author
  is_ai_readable BOOLEAN DEFAULT true, -- can AI use this context
  
  -- Mentions
  mentioned_user_ids UUID[],
  
  -- Author
  created_by UUID NOT NULL REFERENCES users(id),
  
  -- Pinned
  is_pinned BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Task info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Priority
  priority task_priority DEFAULT 'medium',
  
  -- Status
  status task_status DEFAULT 'pending',
  
  -- Assignment
  assigned_to UUID REFERENCES users(id),
  assigned_by UUID REFERENCES users(id),
  
  -- Due date
  due_at TIMESTAMPTZ,
  
  -- Related entities
  order_id UUID REFERENCES orders(id),
  customer_id UUID REFERENCES customers(id),
  appointment_id UUID REFERENCES appointments(id),
  
  -- Completion
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES users(id),
  
  -- Reminders
  reminder_at TIMESTAMPTZ,
  reminder_sent BOOLEAN DEFAULT false,
  
  -- Tags
  tags TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews and ratings
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Subject
  review_type VARCHAR(50) NOT NULL, -- 'order', 'photographer', 'company'
  order_id UUID REFERENCES orders(id),
  photographer_id UUID REFERENCES photographers(id),
  
  -- Reviewer
  reviewer_customer_id UUID REFERENCES customers(id),
  reviewer_name VARCHAR(255),
  
  -- Rating
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  
  -- Category ratings
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
  professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  
  -- Review content
  title VARCHAR(255),
  content TEXT,
  
  -- Response
  response TEXT,
  response_by UUID REFERENCES users(id),
  response_at TIMESTAMPTZ,
  
  -- Visibility
  is_public BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT true, -- verified purchase
  
  -- Moderation
  is_approved BOOLEAN DEFAULT true,
  moderation_notes TEXT,
  
  -- Helpful votes
  helpful_count INTEGER DEFAULT 0,
  
  -- Source
  source VARCHAR(50) DEFAULT 'internal', -- 'internal', 'google', 'yelp', 'facebook'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log (comprehensive activity tracking)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  
  -- Actor
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_email VARCHAR(255),
  user_role user_role,
  
  -- Action
  action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'view', 'export', 'login', 'logout'
  
  -- Target
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  
  -- Changes
  old_values JSONB,
  new_values JSONB,
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  request_id VARCHAR(100),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhooks
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  
  -- Events
  events TEXT[] NOT NULL, -- ['order.created', 'order.completed', 'appointment.confirmed']
  
  -- Security
  secret VARCHAR(255), -- for signature verification
  
  -- Headers
  headers JSONB DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Stats
  last_triggered_at TIMESTAMPTZ,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook deliveries
CREATE TABLE webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  
  -- Event
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  
  -- Delivery
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'success', 'failed'
  status_code INTEGER,
  response_body TEXT,
  
  -- Timing
  attempted_at TIMESTAMPTZ,
  response_time_ms INTEGER,
  
  -- Retries
  attempt_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Availability
CREATE INDEX idx_availability_blocks_user ON availability_blocks(user_id);
CREATE INDEX idx_availability_blocks_photographer ON availability_blocks(photographer_id);
CREATE INDEX idx_availability_blocks_time ON availability_blocks(start_time, end_time);
CREATE INDEX idx_availability_blocks_type ON availability_blocks(availability_type);

-- Equipment
CREATE INDEX idx_equipment_company ON equipment(company_id);
CREATE INDEX idx_equipment_assigned ON equipment(assigned_to);
CREATE INDEX idx_equipment_status ON equipment(company_id, status);
CREATE INDEX idx_equipment_serial ON equipment(serial_number);

-- Messages
CREATE INDEX idx_messages_company ON messages(company_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_thread ON messages(thread_id);
CREATE INDEX idx_messages_order ON messages(order_id);
CREATE INDEX idx_messages_created ON messages(company_id, created_at DESC);

-- Notes
CREATE INDEX idx_notes_entity ON notes(entity_type, entity_id);
CREATE INDEX idx_notes_company ON notes(company_id);
CREATE INDEX idx_notes_created_by ON notes(created_by);

-- Tasks
CREATE INDEX idx_tasks_company ON tasks(company_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(company_id, status);
CREATE INDEX idx_tasks_due ON tasks(due_at);

-- Reviews
CREATE INDEX idx_reviews_company ON reviews(company_id);
CREATE INDEX idx_reviews_order ON reviews(order_id);
CREATE INDEX idx_reviews_photographer ON reviews(photographer_id);
CREATE INDEX idx_reviews_rating ON reviews(overall_rating);

-- Audit logs
CREATE INDEX idx_audit_logs_company ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- Webhooks
CREATE INDEX idx_webhooks_company ON webhooks(company_id);
CREATE INDEX idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status);

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_availability_blocks_updated_at BEFORE UPDATE ON availability_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_templates_updated_at BEFORE UPDATE ON message_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
