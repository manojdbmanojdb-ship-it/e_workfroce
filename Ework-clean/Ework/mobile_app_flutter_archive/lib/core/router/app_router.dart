import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/home/screens/home_screen.dart';
import '../../features/attendance/screens/attendance_screen.dart';
import '../../features/tasks/screens/tasks_screen.dart';
import '../../features/tasks/screens/task_detail_screen.dart';
import '../../features/tracking/screens/live_tracking_screen.dart';
import '../../features/chat/screens/chat_screen.dart';
import '../../features/expenses/screens/expenses_screen.dart';
import '../../features/sos/screens/sos_screen.dart';
import '../../features/reports/screens/reports_screen.dart';
import '../../features/assets/screens/asset_scanner_screen.dart';
import '../../features/offline/screens/offline_queue_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/home',
    routes: [
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      ShellRoute(
        builder: (context, state, child) => HomeScreen(child: child),
        routes: [
          GoRoute(path: '/home', builder: (_, __) => const HomeContent()),
          GoRoute(path: '/attendance', builder: (_, __) => const AttendanceScreen()),
          GoRoute(path: '/tasks', builder: (_, __) => const TasksScreen()),
          GoRoute(path: '/tasks/:id', builder: (_, state) => TaskDetailScreen(taskId: state.pathParameters['id'] ?? '1')),
          GoRoute(path: '/tracking', builder: (_, __) => const LiveTrackingScreen()),
          GoRoute(path: '/chat', builder: (_, __) => const ChatScreen()),
          GoRoute(path: '/expenses', builder: (_, __) => const ExpensesScreen()),
          GoRoute(path: '/assets', builder: (_, __) => const AssetScannerScreen()),
          GoRoute(path: '/offline-queue', builder: (_, __) => const OfflineQueueScreen()),
          GoRoute(path: '/sos', builder: (_, __) => const SosScreen()),
          GoRoute(path: '/reports', builder: (_, __) => const ReportsScreen()),
        ],
      ),
    ],
  );
});
