-- =========================================================================
-- 10. EMPLOYEE SIGN-IN TABLE IN SUPABASE
-- Run this query in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ptxfxtxwytrzznswudlc/sql/new
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.employee_sign_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'Field Staff',
    department TEXT DEFAULT 'Field Operations',
    phone TEXT,
    avatar TEXT,
    badge TEXT,
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
    avatar TEXT,
    badge TEXT,
    sign_in TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sign_in_count INTEGER DEFAULT 1,
    ip_address TEXT,
    device TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.employee_sign_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sign_in ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Manage Employee Sign Ins" ON public.employee_sign_ins;
CREATE POLICY "Public Manage Employee Sign Ins" ON public.employee_sign_ins FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Manage Sign In" ON public.sign_in;
CREATE POLICY "Public Manage Sign In" ON public.sign_in FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.employee_sign_ins (user_id, name, email, role, department, avatar, badge, sign_in, sign_in_count, device, status)
VALUES
  ('usr-0001', 'Rajesh Kumar', 'manager@ework.com', 'Operations Manager', 'Fleet Operations', '👔', 'Admin Console', NOW(), 1, 'Web Console', 'Active'),
  ('usr-0002', 'Rahul Sharma', 'rahul@ework.com', 'Senior Technician', 'Field Services', '🔧', 'Field Tech', NOW() - INTERVAL '15 minutes', 1, 'Mobile App', 'Active'),
  ('usr-0003', 'Priya Patel', 'priya@ework.com', 'Sales Executive', 'Field Sales', '💼', 'Field Sales', NOW() - INTERVAL '45 minutes', 1, 'Mobile App', 'Active'),
  ('usr-0004', 'Sneha Rao', 'sneha@ework.com', 'Quality Inspector', 'Quality Audit', '📋', 'Auditor', NOW() - INTERVAL '2 hours', 1, 'Mobile App', 'Active')
ON CONFLICT DO NOTHING;

INSERT INTO public.sign_in (user_id, name, email, role, department, avatar, badge, sign_in, sign_in_count, device, status)
VALUES
  ('usr-0001', 'Rajesh Kumar', 'manager@ework.com', 'Operations Manager', 'Fleet Operations', '👔', 'Admin Console', NOW(), 1, 'Web Console', 'Active'),
  ('usr-0002', 'Rahul Sharma', 'rahul@ework.com', 'Senior Technician', 'Field Services', '🔧', 'Field Tech', NOW() - INTERVAL '15 minutes', 1, 'Mobile App', 'Active'),
  ('usr-0003', 'Priya Patel', 'priya@ework.com', 'Sales Executive', 'Field Sales', '💼', 'Field Sales', NOW() - INTERVAL '45 minutes', 1, 'Mobile App', 'Active'),
  ('usr-0004', 'Sneha Rao', 'sneha@ework.com', 'Quality Inspector', 'Quality Audit', '📋', 'Auditor', NOW() - INTERVAL '2 hours', 1, 'Mobile App', 'Active')
ON CONFLICT DO NOTHING;
