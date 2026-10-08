-- TaxFeeder Initial Database Schema
-- Run this in your Supabase SQL Editor

-- Users table (extends Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  firm_name VARCHAR(255),
  plan VARCHAR(20) DEFAULT 'solo',
  subscription_status VARCHAR(20) DEFAULT 'inactive',
  stripe_customer_id VARCHAR(100),
  stripe_subscription_id VARCHAR(100),
  cancel_at_period_end BOOLEAN DEFAULT false,
  subscription_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Templates table
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50),
  is_default BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Template items (checklist items)
CREATE TABLE template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES templates(id) ON DELETE CASCADE NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT true
);

-- Document requests (the magic link)
CREATE TABLE document_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES templates(id),
  magic_link_token VARCHAR(64) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  due_date DATE,
  reminder_email BOOLEAN DEFAULT true,
  reminder_sms BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Documents (uploaded files)
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES document_requests(id) ON DELETE CASCADE NOT NULL,
  template_item_id UUID REFERENCES template_items(id),
  original_filename VARCHAR(500) NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  uploaded_by_client BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reminder logs
CREATE TABLE reminder_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES document_requests(id) ON DELETE CASCADE NOT NULL,
  reminder_type VARCHAR(20) NOT NULL,
  reminder_number INTEGER NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now(),
  opened_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'sent'
);

-- Waitlist
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  source VARCHAR(50) DEFAULT 'landing_page',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Stripe events (idempotency + audit)
CREATE TABLE stripe_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id VARCHAR(100) UNIQUE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Payments log
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  stripe_invoice_id VARCHAR(100),
  amount INTEGER NOT NULL,
  currency VARCHAR(10) DEFAULT 'usd',
  status VARCHAR(20) NOT NULL,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_requests_user ON document_requests(user_id);
CREATE INDEX idx_requests_client ON document_requests(client_id);
CREATE INDEX idx_requests_token ON document_requests(magic_link_token);
CREATE INDEX idx_requests_status ON document_requests(status);
CREATE INDEX idx_docs_request ON documents(request_id);
CREATE INDEX idx_clients_user ON clients(user_id);
CREATE INDEX idx_payments_user ON payments(user_id);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users see own data" ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users see own clients" ON clients FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own requests" ON document_requests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own documents" ON documents FOR ALL USING (
  EXISTS (
    SELECT 1 FROM document_requests dr
    WHERE dr.id = documents.request_id AND dr.user_id = auth.uid()
  )
);
CREATE POLICY "Users see own payments" ON payments FOR ALL USING (auth.uid() = user_id);

-- Public function for magic link access (bypasses RLS)
CREATE OR REPLACE FUNCTION get_request_by_token(token VARCHAR)
RETURNS SETOF document_requests AS $$
  SELECT * FROM document_requests WHERE magic_link_token = token;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Seed default tax templates
INSERT INTO templates (name, category, is_default) VALUES
  ('2026 Individual Tax Return', 'individual', true),
  ('2026 S-Corporation Return', 's-corp', true),
  ('2026 LLC / Partnership Return', 'partnership', true),
  ('2026 Sole Proprietorship', 'sole-prop', true),
  ('Monthly Bookkeeping', 'bookkeeping', true);

-- Seed template items for Individual Return
INSERT INTO template_items (template_id, document_name, description, sort_order, is_required)
SELECT 
  t.id,
  unnest(ARRAY['W-2 Forms', '1099-INT / 1099-DIV', '1099-NEC / 1099-MISC', '1098 Mortgage Interest', 'Property Tax Statements', 'Charitable Donation Receipts', 'Medical Expense Receipts', 'Student Loan Interest (1098-E)', 'Social Security Benefits (SSA-1099)']),
  unnest(ARRAY['From all employers', 'From banks/brokerages', 'From clients/contractors', 'From mortgage lender', 'From county assessor', 'From charities', 'Over $ threshold', 'From loan servicer', 'From Social Security Administration']),
  generate_series(1, 9),
  true
FROM templates t WHERE t.name = '2026 Individual Tax Return';
