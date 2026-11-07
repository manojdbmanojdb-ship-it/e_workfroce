-- =========================================================================
-- E-WORKFORCE FREEMIUM + PAID SUBSCRIPTION SAAS MIGRATION
-- Multi-Tenant Organizations, Subscriptions, Licenses, and Payments
-- =========================================================================

-- 1. ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS public.organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    business_email TEXT NOT NULL,
    phone TEXT,
    industry TEXT,
    org_size TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    plan TEXT NOT NULL CHECK (plan IN ('free', 'professional', 'enterprise')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'expired')),
    employee_limit INTEGER NOT NULL DEFAULT 5,
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    license_key TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. LICENSES TABLE
CREATE TABLE IF NOT EXISTS public.licenses (
    id TEXT PRIMARY KEY,
    license_key TEXT UNIQUE NOT NULL,
    plan TEXT NOT NULL CHECK (plan IN ('professional', 'enterprise')),
    employee_limit INTEGER NOT NULL DEFAULT 100,
    duration_days INTEGER NOT NULL DEFAULT 365,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'active', 'revoked', 'expired')),
    assigned_to_org_id TEXT REFERENCES public.organizations(id),
    assigned_to_email TEXT,
    created_by TEXT DEFAULT 'superadmin',
    activated_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PAYMENTS TABLE (Online Gateway & Manual UPI Verification)
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY,
    transaction_ref TEXT UNIQUE NOT NULL,
    organization_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    plan TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    payment_method TEXT NOT NULL CHECK (payment_method IN ('upi_manual', 'card_online', 'netbanking', 'wallet')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'failed', 'refunded')),
    utr_number TEXT,
    verified_by TEXT,
    verified_at TIMESTAMPTZ,
    license_key_issued TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. LINK USERS TO ORGANIZATIONS
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS organization_id TEXT DEFAULT 'org-demo-default';
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS organization_id TEXT DEFAULT 'org-demo-default';

-- 6. DEFAULT SEED DATA
INSERT INTO public.organizations (id, name, business_email, phone, industry, org_size, status)
VALUES ('org-demo-default', 'Apex Field Services Pvt Ltd', 'manager@ework.com', '+91 98111-22334', 'HVAC & Electrical Maintenance', '11-50 employees (Growing Business)', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.subscriptions (id, organization_id, plan, status, employee_limit, starts_at, expires_at, license_key)
VALUES ('sub-apex-prod', 'org-demo-default', 'professional', 'active', 100, NOW(), NOW() + INTERVAL '1 year', 'EWF-PRO-2026-DEMO')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.licenses (id, license_key, plan, employee_limit, duration_days, status, assigned_to_org_id, assigned_to_email, activated_at, expires_at)
VALUES 
    ('lic-demo-pro', 'EWF-PRO-2026-DEMO', 'professional', 100, 365, 'active', 'org-demo-default', 'manager@ework.com', NOW(), NOW() + INTERVAL '1 year'),
    ('lic-seed-ent', 'EWF-ENT-2026-DEMO', 'enterprise', 1000, 365, 'available', NULL, NULL, NULL, NULL),
    ('lic-seed-test', 'EWF-PRO-TEST-9921', 'professional', 100, 365, 'available', NULL, NULL, NULL, NULL)
ON CONFLICT (license_key) DO NOTHING;

INSERT INTO public.payments (id, transaction_ref, organization_name, customer_email, plan, amount, currency, payment_method, payment_status, utr_number)
VALUES ('pay-seed-upi-1', 'UPI-TXN-984421', 'Reliable Security Corp', 'director@reliablesecurity.in', 'professional', 2358.82, 'INR', 'upi_manual', 'pending', '403928172645')
ON CONFLICT (transaction_ref) DO NOTHING;
