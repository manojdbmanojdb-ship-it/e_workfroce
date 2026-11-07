import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { MobileHeader } from './components/MobileHeader';
import { BottomNavigation } from './components/BottomNavigation';
import { QuickDrawer } from './components/QuickDrawer';
import { SplashScreen } from './screens/SplashScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { LoginScreen } from './screens/LoginScreen';
import { ForgotPasswordScreen } from './screens/ForgotPasswordScreen';
import { HomeScreen } from './screens/HomeScreen';
import { TasksScreen } from './screens/TasksScreen';
import { TaskDetailsScreen } from './screens/TaskDetailsScreen';
import { AttendanceScreen } from './screens/AttendanceScreen';
import { LocationScreen } from './screens/LocationScreen';
import { MapsScreen } from './screens/MapsScreen';
import { LeavesScreen } from './screens/LeavesScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { App as CapApp } from '@capacitor/app';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ScreenRouter: React.FC = () => {
  const { currentScreen, selectedTaskId, navigateTo, toast } = useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Handle Android Native Hardware Back Button
  useEffect(() => {
    let backHandler: any;
    try {
      backHandler = CapApp.addListener('backButton', ({ canGoBack }) => {
        if (drawerOpen) {
          setDrawerOpen(false);
          return;
        }

        if (currentScreen === 'task_details') {
          navigateTo('tasks');
        } else if (
          ['tasks', 'attendance', 'maps', 'location', 'leaves', 'notifications', 'reports', 'profile', 'settings'].includes(currentScreen)
        ) {
          navigateTo('home');
        } else if (currentScreen === 'forgot_password') {
          navigateTo('login');
        } else if (currentScreen === 'onboarding') {
          navigateTo('splash');
        } else if (canGoBack) {
          window.history.back();
        } else {
          CapApp.exitApp();
        }
      });
    } catch {
      // Running in browser mode
    }

    return () => {
      if (backHandler && typeof backHandler.remove === 'function') {
        backHandler.remove();
      }
    };
  }, [currentScreen, drawerOpen, navigateTo]);

  // Public / Auth Screens without main mobile navigation chrome
  if (currentScreen === 'splash') {
    return <SplashScreen />;
  }

  if (currentScreen === 'onboarding') {
    return <OnboardingScreen />;
  }

  if (currentScreen === 'login') {
    return <LoginScreen />;
  }

  if (currentScreen === 'forgot_password') {
    return <ForgotPasswordScreen />;
  }

  // Authenticated Portal Screens
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070c14] text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-500 selection:text-white transition-colors duration-200">
      {/* Top Mobile Header */}
      <MobileHeader
        showBack={currentScreen === 'task_details'}
        onBack={() => navigateTo('tasks')}
        onOpenMenu={() => setDrawerOpen(true)}
      />

      {/* Main Screen Content Area */}
      <main className="flex-1 w-full max-w-lg mx-auto overflow-y-auto no-scrollbar">
        {currentScreen === 'home' && <HomeScreen />}
        {currentScreen === 'tasks' && <TasksScreen />}
        {currentScreen === 'task_details' && <TaskDetailsScreen />}
        {currentScreen === 'attendance' && <AttendanceScreen />}
        {currentScreen === 'location' && <LocationScreen />}
        {currentScreen === 'maps' && <MapsScreen />}
        {currentScreen === 'leaves' && <LeavesScreen />}
        {currentScreen === 'notifications' && <NotificationsScreen />}
        {currentScreen === 'reports' && <ReportsScreen />}
        {currentScreen === 'profile' && <ProfileScreen />}
        {currentScreen === 'settings' && <SettingsScreen />}
      </main>

      {/* Floating Global Toast Notification Overlay */}
      {toast && (
        <div className="fixed top-18 left-4 right-4 z-50 max-w-sm mx-auto flex items-center justify-between p-3.5 rounded-2xl shadow-xl backdrop-blur-md animate-in slide-in-from-top-4 border ${
          toast.type === 'success'
            ? 'bg-emerald-600/95 text-white border-emerald-400/40 shadow-emerald-500/20'
            : toast.type === 'error'
            ? 'bg-rose-600/95 text-white border-rose-400/40 shadow-rose-500/20'
            : 'bg-blue-600/95 text-white border-blue-400/40 shadow-blue-500/20'
        }">
          <div className="flex items-center space-x-2.5">
            {toast.type === 'success' && <CheckCircle2 className="h-4 w-4 flex-shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="h-4 w-4 flex-shrink-0" />}
            {toast.type === 'info' && <Info className="h-4 w-4 flex-shrink-0" />}
            <span className="text-xs font-semibold">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Quick Drawer Navigation Menu */}
      <QuickDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Bottom Sticky Navigation */}
      <BottomNavigation />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <ScreenRouter />
    </AppProvider>
  );
};

export default App;
