import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, ScreenType, Task, AttendanceRecord, NotificationItem } from '../types';
import { apiService } from '../services/apiService';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

interface ToastInfo {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
}

interface AppContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  currentScreen: ScreenType;
  selectedTaskId: string | null;
  activeTab: 'home' | 'tasks' | 'attendance' | 'maps' | 'profile';
  darkMode: boolean;
  isOnline: boolean;
  unreadCount: number;
  isTrackingEnabled: boolean;
  currentLocation: { lat: number; lng: number; accuracy: number };
  todayAttendance: AttendanceRecord | null;
  toast: ToastInfo | null;
  login: (user: User) => void;
  logout: () => void;
  navigateTo: (screen: ScreenType, taskId?: string) => void;
  toggleTheme: () => void;
  toggleLocationTracking: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  refreshData: () => Promise<void>;
  updateUser: (updated: Partial<User>) => void;
  setTodayAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord | null>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('ework_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentScreen, setCurrentScreen] = useState<ScreenType>('splash');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'tasks' | 'attendance' | 'maps' | 'profile'>('home');
  
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('ework_mobile_theme');
    return saved ? saved === 'dark' : true; // Default dark for technical high-contrast field view
  });

  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [unreadCount, setUnreadCount] = useState<number>(2);
  const [isTrackingEnabled, setIsTrackingEnabled] = useState<boolean>(true);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number; accuracy: number }>({
    lat: 28.6318,
    lng: 77.2170,
    accuracy: 8
  });
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [toast, setToast] = useState<ToastInfo | null>(null);

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ework_mobile_theme', 'dark');
      if (Capacitor.isPluginAvailable('StatusBar')) {
        StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
        StatusBar.setBackgroundColor({ color: '#070c14' }).catch(() => {});
      }
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ework_mobile_theme', 'light');
      if (Capacitor.isPluginAvailable('StatusBar')) {
        StatusBar.setStyle({ style: Style.Light }).catch(() => {});
        StatusBar.setBackgroundColor({ color: '#f8fafc' }).catch(() => {});
      }
    }
  }, [darkMode]);

  // Online / offline detector
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // GPS position tracking
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCurrentLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy || 10)
        });
      },
      (err) => {
        // Fallback to Connaught Place default on permissions not yet approved
        console.warn('Geolocation fallback used:', err.message);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToast({ message, type, id });
    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 3500);
  };

  const login = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('ework_user', JSON.stringify(user));
    navigateTo('home');
    showToast(`Welcome back, ${user.name}!`, 'success');
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ework_user');
    navigateTo('login');
    showToast('Signed out of E-WorkForce', 'info');
  };

  const navigateTo = (screen: ScreenType, taskId?: string) => {
    if (taskId) setSelectedTaskId(taskId);
    setCurrentScreen(screen);

    // Map screen to bottom navigation tab if applicable
    if (screen === 'home') setActiveTab('home');
    else if (screen === 'tasks' || screen === 'task_details') setActiveTab('tasks');
    else if (screen === 'attendance') setActiveTab('attendance');
    else if (screen === 'maps') setActiveTab('maps');
    else if (screen === 'profile') setActiveTab('profile');
  };

  const toggleTheme = () => setDarkMode((prev) => !prev);
  const toggleLocationTracking = () => {
    setIsTrackingEnabled((prev) => {
      const next = !prev;
      showToast(next ? 'Live GPS Location Tracking Active' : 'Location Tracking Paused', next ? 'success' : 'info');
      return next;
    });
  };

  const updateUser = (updated: Partial<User>) => {
    setCurrentUser((prev) => {
      if (!prev) return null;
      const merged = { ...prev, ...updated };
      localStorage.setItem('ework_user', JSON.stringify(merged));
      return merged;
    });
  };

  const refreshData = async () => {
    if (!currentUser) return;
    try {
      const [notifsRes, attRes] = await Promise.all([
        apiService.getNotifications().catch(() => ({ success: false, data: [] })),
        apiService.getAttendance().catch(() => ({ success: false, data: [] }))
      ]);

      if (notifsRes.data) {
        const unread = notifsRes.data.filter((n: NotificationItem) => !n.read).length;
        setUnreadCount(unread);
      }

      if (attRes.data && attRes.data.length > 0) {
        const todayStr = new Date().toISOString().split('T')[0];
        const match = attRes.data.find((a: AttendanceRecord) => a.date === todayStr);
        setTodayAttendance(match || null);
      }
    } catch (e) {
      // offline silent fallback
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        currentScreen,
        selectedTaskId,
        activeTab,
        darkMode,
        isOnline,
        unreadCount,
        isTrackingEnabled,
        currentLocation,
        todayAttendance,
        toast,
        login,
        logout,
        navigateTo,
        toggleTheme,
        toggleLocationTracking,
        showToast,
        refreshData,
        updateUser,
        setTodayAttendance
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
