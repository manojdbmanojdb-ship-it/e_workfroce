-- =========================================================================
-- EWORK / TASKROOM COMPLETE SUPABASE DATABASE SCHEMA
-- Geofenced Attendance, Live GPS, Proof of Work, Route Planning, SOS, etc.
-- =========================================================================

-- Enable PostGIS if available (optional for advanced geo queries)
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. PROFILES & USERS
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT CHECK (role IN ('superadmin', 'admin', 'manager', 'employee', 'field_staff')) DEFAULT 'employee',
    department TEXT,
    avatar_url TEXT,
    language_pref TEXT DEFAULT 'en',
    battery_level SMALLINT DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. WORK SITES & GEOFENCES
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

-- 3. SHIFTS & SCHEDULES
CREATE TABLE IF NOT EXISTS public.shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    work_site_id UUID REFERENCES public.work_sites(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT CHECK (status IN ('scheduled', 'completed', 'missed', 'cancelled')) DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ATTENDANCE (GEOFENCED & QR)
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    work_site_id UUID REFERENCES public.work_sites(id),
    check_in_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    check_out_time TIMESTAMPTZ,
    check_in_lat DOUBLE PRECISION NOT NULL,
    check_in_lng DOUBLE PRECISION NOT NULL,
    check_out_lat DOUBLE PRECISION,
    check_out_lng DOUBLE PRECISION,
    is_within_geofence BOOLEAN DEFAULT TRUE,
    verification_method TEXT CHECK (verification_method IN ('gps_geofence', 'qr_code', 'manual')) DEFAULT 'gps_geofence',
    status TEXT CHECK (status IN ('present', 'late', 'half_day', 'absent')) DEFAULT 'present',
    overtime_minutes INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TASKS, PROOF OF WORK & CUSTOMER FEEDBACK
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    destination_lat DOUBLE PRECISION,
    destination_lng DOUBLE PRECISION,
    address TEXT,
    route_order INTEGER DEFAULT 0,
    due_date TIMESTAMPTZ,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('pending', 'in_route', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
    proof_photo_urls TEXT[] DEFAULT '{}',
    signature_url TEXT,
    customer_name TEXT,
    customer_phone TEXT,
    customer_rating SMALLINT CHECK (customer_rating BETWEEN 1 AND 5),
    customer_feedback TEXT,
    completion_notes TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. LIVE LOCATIONS & SOS ALERTS
CREATE TABLE IF NOT EXISTS public.live_locations (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    speed REAL DEFAULT 0,
    battery_level SMALLINT DEFAULT 100,
    is_mock_location BOOLEAN DEFAULT FALSE,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sos_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    status TEXT CHECK (status IN ('active', 'acknowledged', 'resolved')) DEFAULT 'active',
    message TEXT DEFAULT 'EMERGENCY: SOS Alert triggered by employee',
    triggered_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_by UUID REFERENCES public.profiles(id),
    resolved_at TIMESTAMPTZ
);

-- 7. CHAT MESSAGES
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    attachment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. EXPENSES
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    category TEXT CHECK (category IN ('fuel', 'food', 'materials', 'transport', 'other')) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    receipt_url TEXT,
    description TEXT,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    approved_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ASSETS & EQUIPMENT
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    asset_code TEXT UNIQUE NOT NULL,
    category TEXT CHECK (category IN ('vehicle', 'tool_kit', 'machinery', 'electronic', 'other')),
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('available', 'assigned', 'under_maintenance', 'damaged')) DEFAULT 'available',
    condition_notes TEXT,
    last_inspected_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- SIMPLE OPEN ACCESS POLICIES FOR INITIAL SETUP (Customize for production)
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Manage Tasks" ON public.tasks FOR ALL USING (true);
CREATE POLICY "Public Manage Attendance" ON public.attendance FOR ALL USING (true);
CREATE POLICY "Public Manage Locations" ON public.live_locations FOR ALL USING (true);
CREATE POLICY "Public Manage SOS" ON public.sos_alerts FOR ALL USING (true);
CREATE POLICY "Public Manage Sites" ON public.work_sites FOR ALL USING (true);
CREATE POLICY "Public Manage Expenses" ON public.expenses FOR ALL USING (true);
CREATE POLICY "Public Manage Assets" ON public.assets FOR ALL USING (true);
CREATE POLICY "Public Manage Chats" ON public.chat_messages FOR ALL USING (true);
CREATE POLICY "Public Manage Shifts" ON public.shifts FOR ALL USING (true);
