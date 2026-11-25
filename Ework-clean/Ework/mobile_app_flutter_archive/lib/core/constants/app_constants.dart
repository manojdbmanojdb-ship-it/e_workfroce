class AppConstants {
  // Supabase Configuration
  static const String supabaseUrl = 'https://agggzpdbqvjiulqtzyrn.supabase.co';
  static const String supabaseAnonKey = 'sb_publishable__8-Vwbf0J08_JQ3cu6ekUw_qX9p5LlW';

  // Backend API
  static const String apiBaseUrl = 'http://localhost:5000/api';

  // Hive Offline Storage Boxes
  static const String hiveAttendanceBox = 'offline_attendance';
  static const String hiveTasksBox = 'offline_tasks';
  static const String hiveExpensesBox = 'offline_expenses';
  static const String hiveUserBox = 'user_session';

  // Geofencing Defaults
  static const double defaultGeofenceRadiusMeters = 150.0;
  static const int locationUpdateIntervalSeconds = 30;

  // App Metadata
  static const String appName = 'TaskRoom / Ework';
  static const String appVersion = '1.0.0';
}

class CurrentSession {
  static String name = 'Rahul Sharma';
  static String email = 'rahul@ework.com';
  static String role = 'Technician';
  static String userId = '00000000-0000-0000-0000-000000000000';
  static bool isManager = false;

  static void setSession({
    required String newName,
    required String newEmail,
    required String newRole,
    required String newUserId,
    bool manager = false,
  }) {
    name = newName;
    email = newEmail;
    role = newRole;
    userId = newUserId;
    isManager = manager;
  }
}

