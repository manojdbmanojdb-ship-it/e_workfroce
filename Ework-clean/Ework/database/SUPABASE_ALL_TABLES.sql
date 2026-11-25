-- =========================================================================
-- E-WORKFORCE COMPLETE SUPABASE DATABASE SETUP
-- Project: https://agggzpdbqvjiulqtzyrn.supabase.co
--
-- Instructions:
-- 1. Open your Supabase Dashboard:
--    https://supabase.com/dashboard/project/agggzpdbqvjiulqtzyrn/sql/new
-- 2. Paste this entire script into the SQL editor and click "Run" (or Ctrl + Enter).
-- 3. All tables will instantly appear in your Table Editor:
--    https://supabase.com/dashboard/project/agggzpdbqvjiulqtzyrn/editor
-- =========================================================================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -------------------------------------------------------------
-- 1. USERS TABLE
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT DEFAULT 'Workforce@2026',
    role TEXT NOT NULL DEFAULT 'Field Staff',
    department TEXT NOT NULL DEFAULT 'Operations',
    designation TEXT DEFAULT 'Field Technician',
    reporting_manager TEXT DEFAULT 'Rajesh Kumar',
    phone TEXT,
    avatar TEXT DEFAULT '👤',
    badge TEXT DEFAULT 'Active Staff',
    address TEXT DEFAULT 'New Delhi, India',
    sign_in TIMESTAMPTZ,
    sign_in_count INTEGER DEFAULT 0,
    organization_id TEXT DEFAULT 'org-demo-default',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 2. PROFILES TABLE (Supabase Auth Link)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'employee',
    department TEXT DEFAULT 'Operations',
    avatar_url TEXT,
    battery_level SMALLINT DEFAULT 100,
    organization_id TEXT DEFAULT 'org-demo-default',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 3. WORK SITES & GEOFENCES
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.work_sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    radius_meters INTEGER DEFAULT 150,
    qr_code_token TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 4. TASKS & PROOF OF WORK
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to TEXT,
    assigned_to_id TEXT,
    assigned_by TEXT DEFAULT 'Dispatch Manager',
    destination_lat DOUBLE PRECISION DEFAULT 28.6315,
    destination_lng DOUBLE PRECISION DEFAULT 77.2167,
    address TEXT DEFAULT 'Connaught Place, New Delhi',
    due_date TIMESTAMPTZ,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'pending',
    proof_photo_urls TEXT[] DEFAULT '{}',
    signature_url TEXT,
    customer_name TEXT,
    customer_phone TEXT,
    customer_rating INTEGER DEFAULT 0,
    customer_feedback TEXT,
    completion_notes TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 5. ATTENDANCE & PUNCH RECORDS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    check_in_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    check_out_time TIMESTAMPTZ,
    check_in_lat DOUBLE PRECISION NOT NULL DEFAULT 28.6318,
    check_in_lng DOUBLE PRECISION NOT NULL DEFAULT 77.2170,
    check_out_lat DOUBLE PRECISION,
    check_out_lng DOUBLE PRECISION,
    is_within_geofence BOOLEAN DEFAULT TRUE,
    verification_method TEXT DEFAULT 'gps_geofence',
    status TEXT DEFAULT 'present',
    overtime_minutes INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 6. SHIFTS & SCHEDULES
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    work_site_id UUID REFERENCES public.work_sites(id) ON DELETE SET NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 7. ASSETS & EQUIPMENT
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    asset_code TEXT UNIQUE NOT NULL,
    category TEXT DEFAULT 'tool_kit',
    assigned_to TEXT,
    status TEXT DEFAULT 'available',
    condition_notes TEXT,
    last_inspected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 8. EXPENSES
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    task_id TEXT,
    category TEXT NOT NULL DEFAULT 'fuel',
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    receipt_url TEXT,
    description TEXT,
    status TEXT DEFAULT 'pending',
    approved_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 9. CHAT MESSAGES
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id TEXT,
    sender_id TEXT NOT NULL,
    recipient_id TEXT,
    content TEXT NOT NULL,
    attachment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 10. SOS EMERGENCY ALERTS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sos_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    status TEXT DEFAULT 'active',
    message TEXT DEFAULT 'EMERGENCY: SOS Alert triggered by employee',
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_by TEXT,
    resolved_at TIMESTAMPTZ
);

-- -------------------------------------------------------------
-- 11. EMPLOYEE SIGN-IN AUDIT LOGS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.employee_sign_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'Field Staff',
    department TEXT DEFAULT 'Field Operations',
    phone TEXT,
    avatar TEXT DEFAULT '👤',
    badge TEXT DEFAULT 'Active',
    sign_in TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sign_in_count INTEGER DEFAULT 1,
    ip_address TEXT,
    device TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sign_in (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'Field Staff',
    department TEXT DEFAULT 'Field Operations',
    phone TEXT,
    avatar TEXT DEFAULT '👤',
    badge TEXT DEFAULT 'Active',
    sign_in TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sign_in_count INTEGER DEFAULT 1,
    ip_address TEXT,
    device TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 12. SAAS MULTI-TENANT ORGANIZATIONS & BILLING
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    business_email TEXT NOT NULL,
    phone TEXT,
    industry TEXT,
    org_size TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    plan TEXT NOT NULL DEFAULT 'free',
    status TEXT DEFAULT 'active',
    employee_limit INTEGER NOT NULL DEFAULT 5,
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    license_key TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.licenses (
    id TEXT PRIMARY KEY,
    license_key TEXT UNIQUE NOT NULL,
    plan TEXT NOT NULL DEFAULT 'professional',
    employee_limit INTEGER NOT NULL DEFAULT 100,
    duration_days INTEGER NOT NULL DEFAULT 365,
    status TEXT DEFAULT 'available',
    assigned_to_org_id TEXT REFERENCES public.organizations(id) ON DELETE SET NULL,
    assigned_to_email TEXT,
    created_by TEXT DEFAULT 'superadmin',
    activated_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY,
    transaction_ref TEXT UNIQUE NOT NULL,
    organization_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    plan TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    payment_method TEXT NOT NULL DEFAULT 'upi_manual',
    payment_status TEXT DEFAULT 'pending',
    utr_number TEXT,
    verified_by TEXT,
    verified_at TIMESTAMPTZ,
    license_key_issued TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 13. ENABLE ROW LEVEL SECURITY & OPEN ACCESS POLICIES
-- -------------------------------------------------------------
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT unnest(ARRAY[
        'users', 'profiles', 'work_sites', 'tasks', 'attendance',
        'shifts', 'assets', 'expenses', 'chat_messages', 'sos_alerts',
        'employee_sign_ins', 'sign_in', 'organizations', 'subscriptions',
        'licenses', 'payments'
    ])
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
        EXECUTE format('DROP POLICY IF EXISTS "Public Full Access" ON public.%I;', t);
        EXECUTE format('CREATE POLICY "Public Full Access" ON public.%I FOR ALL USING (true) WITH CHECK (true);', t);
    END LOOP;
END $$;

-- -------------------------------------------------------------
-- 14. SEED SAMPLE DATA
-- -------------------------------------------------------------
-- Work Sites
INSERT INTO public.work_sites (id, name, address, latitude, longitude, radius_meters)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Delhi Corporate HQ', 'Connaught Place, Inner Circle, New Delhi', 28.6315, 77.2167, 150),
  ('22222222-2222-2222-2222-222222222222', 'Mumbai Tech Hub', 'Bandra Kurla Complex, Bandra West, Mumbai', 19.0600, 72.8688, 200),
  ('33333333-3333-3333-3333-333333333333', 'Bengaluru Depot', 'Indiranagar 100ft Road, Bengaluru', 12.9784, 77.6408, 150)
ON CONFLICT (id) DO NOTHING;

-- Default Users
INSERT INTO public.users (user_id, name, email, role, department, designation, reporting_manager, phone, avatar, badge)
VALUES
  ('usr-101', 'Rajesh Kumar', 'manager@ework.com', 'Operations Manager', 'Headquarters Dispatch', 'Operations Director', 'Executive Board', '+91 98101-22334', '👔', 'Admin Console'),
  ('usr-102', 'Rahul Sharma', 'rahul@ework.com', 'Senior Technician', 'Delhi Central Hub', 'Senior Field Technician', 'Rajesh Kumar', '+91 98112-40912', '🔧', 'Field Tech'),
  ('usr-103', 'Priya Patel', 'priya@ework.com', 'Sales Executive', 'Mumbai Tech Hub', 'Senior Field Sales Lead', 'Rajesh Kumar', '+91 98220-55123', '💼', 'Field Sales'),
  ('usr-104', 'Sneha Rao', 'sneha@ework.com', 'Quality Inspector', 'Hyderabad Zone', 'Lead Safety & Quality Auditor', 'Rajesh Kumar', '+91 99001-33211', '📋', 'Auditor')
ON CONFLICT (user_id) DO NOTHING;

-- Default Organization & Subscription
INSERT INTO public.organizations (id, name, business_email, phone, industry, org_size, status)
VALUES ('org-demo-default', 'Apex Field Services Pvt Ltd', 'manager@ework.com', '+91 98111-22334', 'HVAC & Electrical Maintenance', '11-50 employees', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.subscriptions (id, organization_id, plan, status, employee_limit, license_key)
VALUES ('sub-apex-prod', 'org-demo-default', 'professional', 'active', 100, 'EWF-PRO-2026-DEMO')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.licenses (id, license_key, plan, employee_limit, duration_days, status, assigned_to_org_id, assigned_to_email, activated_at, expires_at)
VALUES 
    ('lic-demo-pro', 'EWF-PRO-2026-DEMO', 'professional', 100, 365, 'active', 'org-demo-default', 'manager@ework.com', NOW(), NOW() + INTERVAL '1 year'),
    ('lic-seed-ent', 'EWF-ENT-2026-DEMO', 'enterprise', 1000, 365, 'available', NULL, NULL, NULL, NULL),
    ('lic-seed-test', 'EWF-PRO-TEST-9921', 'professional', 100, 365, 'available', NULL, NULL, NULL, NULL)
ON CONFLICT (license_key) DO NOTHING;
