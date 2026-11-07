export type ScreenType =
  | 'splash'
  | 'onboarding'
  | 'login'
  | 'forgot_password'
  | 'home'
  | 'tasks'
  | 'task_details'
  | 'attendance'
  | 'location'
  | 'maps'
  | 'leaves'
  | 'notifications'
  | 'reports'
  | 'profile'
  | 'settings';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  avatar?: string;
  phone?: string;
  employee_id?: string;
  badge?: string;
  organization_id?: string;
  designation?: string;
  status?: string;
  joining_date?: string;
  address?: string;
  emergency_contact?: string;
}

export interface TaskProof {
  photos?: string[];
  signature?: string;
  notes?: string;
  submittedAt?: string;
  customerName?: string;
  customerRating?: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed';
  assigned_to: string;
  due: string;
  address?: string;
  lat?: number;
  lng?: number;
  contact_name?: string;
  contact_phone?: string;
  proof?: TaskProof;
  created_at?: string;
  updated_at?: string;
}

export interface AttendanceRecord {
  id: string;
  user_id: string;
  user_name: string;
  date: string;
  check_in_time: string;
  check_out_time?: string;
  check_in_lat?: number;
  check_in_lng?: number;
  is_within_geofence: number | boolean;
  verification_method: string;
  status: 'present' | 'late' | 'half_day' | 'absent';
  overtime_minutes?: number;
  working_hours?: number;
  notes?: string;
  created_at?: string;
}

export interface LeaveRequest {
  id: string;
  user_id?: string;
  leave_type?: 'annual' | 'sick' | 'casual' | string;
  leaveType?: string;
  start_date?: string;
  startDate?: string;
  end_date?: string;
  endDate?: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | string;
  appliedAt?: string;
  created_at?: string;
}

export interface LeaveBalances {
  annual: number;
  sick: number;
  casual: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'urgent' | 'task' | 'alert' | 'system' | string;
  priority?: string;
  actionUrl?: string;
  read: boolean;
  time?: string;
  timestamp?: string;
}

export interface WorkReport {
  period: string;
  totalWorkingHours: number;
  tasksCompleted: number;
  tasksAssigned: number;
  overtimeMinutes: number;
  distanceTraveledKm: number;
  punctualityRate: number;
  fuelReimbursements: number;
}
