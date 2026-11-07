import { Capacitor } from '@capacitor/core';
import type { Task, AttendanceRecord, LeaveRequest, LeaveBalances, NotificationItem, User } from '../types';

// Default host determination based on environment
export const getDefaultApiBase = (): string => {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('ework_api_url');
    if (custom) return custom;
  }
  
  if (Capacitor.getPlatform() === 'android') {
    // 10.0.2.2 is Android emulator standard mapping for host machine localhost
    return 'http://10.0.2.2:5000/api';
  }
  return 'http://localhost:5000/api';
};

class ApiService {
  private baseUrl: string = getDefaultApiBase();

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ework_api_url');
      if (saved) this.baseUrl = saved;
    }
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    localStorage.setItem('ework_api_url', this.baseUrl);
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    // Attach auth headers if user session exists
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    const savedUser = localStorage.getItem('ework_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.id || u.user_id) {
          headers['x-user-id'] = u.id || u.user_id;
          headers['x-user-role'] = u.role || 'Field Staff';
        }
      } catch (e) {
        // ignore JSON parse
      }
    }

    try {
      const res = await fetch(url, {
        ...options,
        headers
      });

      const data = await res.json();
      return data;
    } catch (err: any) {
      console.warn(`[API] Failed request to ${url}:`, err.message);
      throw err;
    }
  }

  // Auth Endpoints
  async signIn(email: string, password: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.request('/auth/sign-in', {
      method: 'POST',
      body: JSON.stringify({ email, password, portalMode: 'employee' })
    });
  }

  async getProfile(): Promise<{ success: boolean; data?: User }> {
    return this.request('/employee/profile');
  }

  async updateProfile(updates: Partial<User>): Promise<{ success: boolean; data?: User }> {
    return this.request('/employee/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  // Dashboard Summary
  async getDashboardSummary(): Promise<{ success: boolean; data?: any }> {
    return this.request('/employee/dashboard-summary');
  }

  // Tasks Endpoints
  async getTasks(): Promise<{ success: boolean; data?: Task[] }> {
    return this.request('/employee/tasks');
  }

  async updateTaskStatus(id: string, status: string): Promise<{ success: boolean; data?: Task }> {
    return this.request(`/employee/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  async submitTaskProof(id: string, proof: any): Promise<{ success: boolean; data?: Task }> {
    return this.request(`/employee/tasks/${id}/proof`, {
      method: 'PATCH',
      body: JSON.stringify(proof)
    });
  }

  async addTaskNote(id: string, note: string): Promise<{ success: boolean; data?: any }> {
    return this.request(`/employee/tasks/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note })
    });
  }

  // Attendance Endpoints
  async getAttendance(): Promise<{ success: boolean; data?: AttendanceRecord[] }> {
    return this.request('/employee/attendance');
  }

  async checkIn(lat: number, lng: number, notes?: string): Promise<{ success: boolean; data?: AttendanceRecord; error?: string; message?: string }> {
    return this.request('/employee/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify({ lat, lng, notes })
    });
  }

  async checkOut(lat: number, lng: number, notes?: string): Promise<{ success: boolean; data?: AttendanceRecord; error?: string; message?: string }> {
    return this.request('/employee/attendance/check-out', {
      method: 'POST',
      body: JSON.stringify({ lat, lng, notes })
    });
  }

  async toggleBreak(action: 'start' | 'end', type: string = 'Tea Break'): Promise<{ success: boolean; data?: any }> {
    return this.request('/employee/attendance/break', {
      method: 'POST',
      body: JSON.stringify({ action, type })
    });
  }

  // Leave Endpoints
  async getLeaves(): Promise<{ success: boolean; data?: { leaves: LeaveRequest[]; balances: LeaveBalances; totalUsedDays: number } }> {
    return this.request('/employee/leaves');
  }

  async applyLeave(leave: { leaveType: string; startDate: string; endDate: string; days: number; reason: string }): Promise<{ success: boolean; data?: any; message?: string }> {
    return this.request('/employee/leave-apply', {
      method: 'POST',
      body: JSON.stringify(leave)
    });
  }

  // Notifications Endpoints
  async getNotifications(): Promise<{ success: boolean; data?: NotificationItem[] }> {
    return this.request('/employee/notifications');
  }

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return this.request(`/employee/notifications/${id}/read`, {
      method: 'PATCH'
    });
  }

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    return this.request('/employee/notifications/mark-all-read', {
      method: 'POST'
    });
  }

  // Performance & Work Reports
  async getPerformanceSummary(): Promise<{ success: boolean; data?: any }> {
    return this.request('/employee/performance');
  }

  // SOS Emergency Beacon
  async triggerSOS(lat: number, lng: number, message?: string): Promise<{ success: boolean; data?: any }> {
    return this.request('/sos/trigger', {
      method: 'POST',
      body: JSON.stringify({
        lat,
        lng,
        message: message || 'EMERGENCY: Field staff pressed SOS Panic in Mobile App'
      })
    });
  }
}

export const apiService = new ApiService();
