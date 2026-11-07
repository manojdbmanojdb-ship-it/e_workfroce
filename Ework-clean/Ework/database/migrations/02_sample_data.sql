-- =========================================================================
-- 10 SAMPLE DATA RECORDS FOR SUPABASE CHECKING & TESTING
-- =========================================================================

-- 1. WORK SITES & GEOFENCE RADIUS (3 Sites)
INSERT INTO public.work_sites (id, name, address, latitude, longitude, radius_meters)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Delhi Corporate HQ', 'Connaught Place, Inner Circle, New Delhi', 28.6315, 77.2167, 150),
  ('22222222-2222-2222-2222-222222222222', 'Mumbai Tech Hub', 'Bandra Kurla Complex, Bandra West, Mumbai', 19.0600, 72.8688, 200),
  ('33333333-3333-3333-3333-333333333333', 'Bengaluru Depot', 'Indiranagar 100ft Road, Bengaluru', 12.9784, 77.6408, 150)
ON CONFLICT (id) DO NOTHING;

-- 2. SAMPLE ASSETS & EQUIPMENT (3 Assets)
INSERT INTO public.assets (id, name, asset_code, category, status, condition_notes)
VALUES
  ('aaaa1111-1111-1111-1111-111111111111', 'Toyota HiAce Field Van #1', 'VEH-001', 'vehicle', 'available', 'Odometer: 24,500 km. Good condition.'),
  ('aaaa2222-2222-2222-2222-222222222222', 'Digital Multimeter Pro Kit', 'TOOL-003', 'tool_kit', 'available', 'Calibrated on 01-Oct-2026.'),
  ('aaaa3333-3333-3333-3333-333333333333', 'Industrial Hydraulic Pressure Gauge', 'MACH-002', 'machinery', 'under_maintenance', 'Scheduled for oil filter replacement.')
ON CONFLICT (id) DO NOTHING;

-- 3. SAMPLE FIELD TASKS WITH ADDRESS & PRIORITY (4 Tasks)
INSERT INTO public.tasks (id, title, description, address, destination_lat, destination_lng, priority, status)
VALUES
  ('bbbb1111-1111-1111-1111-111111111111', 'HVAC Compressor Inspection #T-402', 'Inspect main cooling compressor unit, replace air filters, run diagnostic cycle.', 'Connaught Place, Delhi', 28.6315, 77.2167, 'high', 'in_progress'),
  ('bbbb2222-2222-2222-2222-222222222222', 'Electrical Safety Audit #E-108', 'Check MCB circuit distribution boards and test earth leakage relays.', 'Bandra West, Mumbai', 19.0596, 72.8295, 'urgent', 'pending'),
  ('bbbb3333-3333-3333-3333-333333333333', 'Water Pump Repair & Filter Swap', 'Replace intake water valve and check RPM pressure flow.', 'Powai, Mumbai', 19.1176, 72.9060, 'medium', 'pending'),
  ('bbbb4444-4444-4444-4444-444444444444', 'Quarterly Fire Extinguisher Testing', 'Verify hydrostatic pressure on 12 foam cylinders and update inspection tag.', 'Hitec City, Hyderabad', 17.4435, 78.3772, 'low', 'completed')
ON CONFLICT (id) DO NOTHING;
