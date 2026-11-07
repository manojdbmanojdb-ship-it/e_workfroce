import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/services/offline_sync_service.dart';

class HomeScreen extends StatelessWidget {
  final Widget child;
  const HomeScreen({super.key, required this.child});

  int _currentIndex(BuildContext context) {
    final loc = GoRouterState.of(context).matchedLocation;
    if (loc.startsWith('/attendance')) return 1;
    if (loc.startsWith('/tasks')) return 2;
    if (loc.startsWith('/chat')) return 3;
    if (loc.startsWith('/expenses')) return 4;
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final idx = _currentIndex(context);
    return Scaffold(
      body: child,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Color(0xFF0D1829),
          border: Border(top: BorderSide(color: Color(0xFF1E293B))),
        ),
        child: BottomNavigationBar(
          currentIndex: idx,
          backgroundColor: Colors.transparent,
          elevation: 0,
          selectedItemColor: const Color(0xFF0EA5E9),
          unselectedItemColor: const Color(0xFF475569),
          type: BottomNavigationBarType.fixed,
          onTap: (i) {
            switch (i) {
              case 0: context.go('/home'); break;
              case 1: context.go('/attendance'); break;
              case 2: context.go('/tasks'); break;
              case 3: context.go('/chat'); break;
              case 4: context.go('/expenses'); break;
            }
          },
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.home_outlined), activeIcon: Icon(Icons.home), label: 'Home'),
            BottomNavigationBarItem(icon: Icon(Icons.fingerprint_outlined), activeIcon: Icon(Icons.fingerprint), label: 'Attendance'),
            BottomNavigationBarItem(icon: Icon(Icons.check_box_outlined), activeIcon: Icon(Icons.check_box), label: 'Tasks'),
            BottomNavigationBarItem(icon: Icon(Icons.chat_bubble_outline), activeIcon: Icon(Icons.chat_bubble), label: 'Chat'),
            BottomNavigationBarItem(icon: Icon(Icons.receipt_long_outlined), activeIcon: Icon(Icons.receipt_long), label: 'Expenses'),
          ],
        ),
      ),
    );
  }
}

class HomeContent extends StatelessWidget {
  const HomeContent({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF050B14),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('${CurrentSession.role} · Good Day 👋', style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 11, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 2),
                      Text(CurrentSession.name, style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800)),
                    ],
                  ),
                    Row(
                    children: [
                      AnimatedBuilder(
                        animation: OfflineSyncService.instance,
                        builder: (context, _) {
                          final pending = OfflineSyncService.instance.pendingCount;
                          final isOffline = OfflineSyncService.instance.isOfflineMode;
                          return GestureDetector(
                            onTap: () => context.go('/offline-queue'),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                              decoration: BoxDecoration(
                                color: (isOffline || pending > 0)
                                    ? const Color(0xFFF59E0B).withOpacity(0.18)
                                    : const Color(0xFF10B981).withOpacity(0.15),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                  color: (isOffline || pending > 0)
                                      ? const Color(0xFFF59E0B).withOpacity(0.4)
                                      : const Color(0xFF10B981).withOpacity(0.3),
                                ),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    isOffline ? Icons.wifi_off : Icons.sync,
                                    size: 14,
                                    color: (isOffline || pending > 0) ? const Color(0xFFF59E0B) : const Color(0xFF10B981),
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    isOffline ? 'OFFLINE' : (pending > 0 ? '$pending Sync' : 'Sync OK'),
                                    style: TextStyle(
                                      color: (isOffline || pending > 0) ? const Color(0xFFF59E0B) : const Color(0xFF10B981),
                                      fontSize: 11,
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                      const SizedBox(width: 6),
                      IconButton(
                        icon: const Icon(Icons.logout, color: Color(0xFF64748B), size: 20),
                        tooltip: 'Switch Account / Logout',
                        onPressed: () => context.go('/login'),
                      ),
                      const SizedBox(width: 4),
                      GestureDetector(
                        onTap: () => context.go('/sos'),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: const Color(0xFFEF4444).withOpacity(0.15),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.4)),
                          ),
                          child: Row(
                            children: const [
                              Icon(Icons.warning_amber_rounded, color: Color(0xFFEF4444), size: 16),
                              SizedBox(width: 4),
                              Text('SOS', style: TextStyle(color: Color(0xFFEF4444), fontWeight: FontWeight.w800, fontSize: 13)),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 24),

              GestureDetector(
                onTap: () => context.go('/attendance'),
                child: Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF0284C7), Color(0xFF0EA5E9)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(18),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.location_on, color: Colors.white, size: 36),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: const [
                            Text('Status: Not Checked In', style: TextStyle(color: Colors.white70, fontSize: 12)),
                            Text('Tap to Check In with GPS', style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w800)),
                            SizedBox(height: 4),
                            Text('Geofence: Delhi HQ • 150m radius', style: TextStyle(color: Colors.white70, fontSize: 11)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 24),
              const Text('Quick Access', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 15)),
              const SizedBox(height: 12),
              GridView.count(
                crossAxisCount: 3,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
                childAspectRatio: 0.95,
                children: [
                  _ActionTile(icon: Icons.fingerprint, label: 'Attendance', color: const Color(0xFF0EA5E9), onTap: () => context.go('/attendance')),
                  _ActionTile(icon: Icons.task_alt, label: 'My Tasks', color: const Color(0xFF10B981), onTap: () => context.go('/tasks')),
                  _ActionTile(icon: Icons.map_outlined, label: 'Live Route', color: const Color(0xFF6366F1), onTap: () => context.go('/tracking')),
                  _ActionTile(icon: Icons.qr_code_scanner, label: 'Asset Scan', color: const Color(0xFFF97316), onTap: () => context.go('/assets')),
                  _ActionTile(icon: Icons.sync_alt, label: 'Sync Tray', color: const Color(0xFF38BDF8), onTap: () => context.go('/offline-queue')),
                  _ActionTile(icon: Icons.chat_bubble_outline, label: 'Chat', color: const Color(0xFFF59E0B), onTap: () => context.go('/chat')),
                  _ActionTile(icon: Icons.receipt_long_outlined, label: 'Expenses', color: const Color(0xFFEC4899), onTap: () => context.go('/expenses')),
                  _ActionTile(icon: Icons.bar_chart, label: 'Reports', color: const Color(0xFF14B8A6), onTap: () => context.go('/reports')),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ActionTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  const _ActionTile({required this.icon, required this.label, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF0D1829),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFF1E293B)),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              height: 44,
              width: 44,
              decoration: BoxDecoration(color: color.withOpacity(0.15), borderRadius: BorderRadius.circular(12)),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(height: 8),
            Text(label, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }
}
