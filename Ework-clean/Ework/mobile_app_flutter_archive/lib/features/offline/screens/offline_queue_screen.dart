import 'package:flutter/material.dart';
import '../../../core/services/offline_sync_service.dart';

class OfflineQueueScreen extends StatefulWidget {
  const OfflineQueueScreen({super.key});

  @override
  State<OfflineQueueScreen> createState() => _OfflineQueueScreenState();
}

class _OfflineQueueScreenState extends State<OfflineQueueScreen> {
  final OfflineSyncService _syncService = OfflineSyncService.instance;
  bool _flushing = false;
  String _filter = 'all';

  @override
  void initState() {
    super.initState();
    _syncService.addListener(_onServiceUpdate);
  }

  @override
  void dispose() {
    _syncService.removeListener(_onServiceUpdate);
    super.dispose();
  }

  void _onServiceUpdate() {
    if (mounted) setState(() {});
  }

  Future<void> _handleFlush() async {
    setState(() => _flushing = true);
    final count = await _syncService.flushQueue();
    if (mounted) {
      setState(() => _flushing = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('✅ Successfully synced $count records to Supabase & Manager Console!'),
          backgroundColor: const Color(0xFF10B981),
        ),
      );
    }
  }

  void _addSampleAction() {
    _syncService.addAction(
      type: 'expense',
      title: 'Emergency Van Repair ₹1,200',
      description: 'Puncture repair receipt recorded during basement service',
      payload: {
        'userId': '00000000-0000-0000-0000-000000000000',
        'category': 'materials',
        'amount': 1200,
        'description': 'Offline recorded tire repair',
      },
    );
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('📦 Action queued in local encrypted offline storage!'),
        backgroundColor: Color(0xFF0EA5E9),
      ),
    );
  }

  String _getTypeIcon(String type) {
    switch (type) {
      case 'attendance':
        return '📍';
      case 'task_proof':
        return '📋';
      case 'expense':
        return '💰';
      default:
        return '📦';
    }
  }

  @override
  Widget build(BuildContext context) {
    final actions = _syncService.queue.where((a) {
      if (_filter == 'pending') return !a.isSynced;
      if (_filter == 'synced') return a.isSynced;
      return true;
    }).toList();

    final pendingCount = _syncService.pendingCount;

    return Scaffold(
      backgroundColor: const Color(0xFF050B14),
      appBar: AppBar(
        title: const Text('Offline Sync Tray', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
        backgroundColor: const Color(0xFF050B14),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline, color: Color(0xFF0EA5E9)),
            tooltip: 'Queue Test Action',
            onPressed: _addSampleAction,
          ),
          IconButton(
            icon: const Icon(Icons.cleaning_services, color: Color(0xFF64748B)),
            tooltip: 'Clear Synced Items',
            onPressed: () => _syncService.clearSynced(),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Network Simulation Mode Banner
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: _syncService.isOfflineMode
                    ? const Color(0xFFF59E0B).withOpacity(0.12)
                    : const Color(0xFF10B981).withOpacity(0.12),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: _syncService.isOfflineMode
                      ? const Color(0xFFF59E0B).withOpacity(0.3)
                      : const Color(0xFF10B981).withOpacity(0.3),
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    _syncService.isOfflineMode ? Icons.wifi_off : Icons.wifi,
                    color: _syncService.isOfflineMode ? const Color(0xFFF59E0B) : const Color(0xFF10B981),
                    size: 26,
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _syncService.isOfflineMode ? 'Simulated Zero-Signal Mode' : 'Online · Cloud Connected',
                          style: TextStyle(
                            color: _syncService.isOfflineMode ? const Color(0xFFF59E0B) : const Color(0xFF10B981),
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        Text(
                          _syncService.isOfflineMode
                              ? 'Actions are buffered to local Hive/SQLite box.'
                              : 'Real-time two-way synchronization active.',
                          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                  Switch(
                    value: _syncService.isOfflineMode,
                    onChanged: (v) => _syncService.toggleOfflineMode(v),
                    activeColor: const Color(0xFFF59E0B),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Queue Summary Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF0D1829),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF1E293B)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('QUEUED LOCAL ACTIONS', style: TextStyle(color: Color(0xFF64748B), fontSize: 10, fontWeight: FontWeight.w800)),
                      const SizedBox(height: 4),
                      Text(
                        '$pendingCount Items Pending Upload',
                        style: TextStyle(
                          color: pendingCount > 0 ? const Color(0xFFF59E0B) : const Color(0xFF10B981),
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ],
                  ),
                  ElevatedButton.icon(
                    icon: _flushing
                        ? const SizedBox(height: 14, width: 14, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : const Icon(Icons.cloud_upload_outlined, size: 16),
                    label: Text(_flushing ? 'Syncing...' : 'Flush Queue', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12)),
                    onPressed: (pendingCount == 0 || _flushing) ? null : _handleFlush,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0EA5E9),
                      disabledBackgroundColor: const Color(0xFF1E293B),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Filter Tabs
            Row(
              children: [
                _filterChip('All Items (${_syncService.queue.length})', 'all'),
                const SizedBox(width: 8),
                _filterChip('Pending ($pendingCount)', 'pending'),
                const SizedBox(width: 8),
                _filterChip('Synced (${_syncService.queue.length - pendingCount})', 'synced'),
              ],
            ),
            const SizedBox(height: 16),

            // Queued Action Items List
            if (actions.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(32),
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: const Color(0xFF0D1829),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF1E293B)),
                ),
                child: Column(
                  children: const [
                    Icon(Icons.done_all, color: Color(0xFF10B981), size: 36),
                    SizedBox(height: 8),
                    Text('All Offline Actions Synced', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14)),
                    SizedBox(height: 4),
                    Text('Zero pending items in local device buffer.', style: TextStyle(color: Color(0xFF64748B), fontSize: 11)),
                  ],
                ),
              )
            else
              ...actions.map((act) {
                final isSynced = act.isSynced;
                final isSyncing = act.isSyncing;

                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0D1829),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isSynced
                          ? const Color(0xFF10B981).withOpacity(0.3)
                          : const Color(0xFFF59E0B).withOpacity(0.3),
                    ),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        height: 40,
                        width: 40,
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: const Color(0xFF050B14),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(_getTypeIcon(act.type), style: const TextStyle(fontSize: 18)),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              act.title,
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              act.description,
                              style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Recorded: ${act.timestamp.hour.toString().padLeft(2, '0')}:${act.timestamp.minute.toString().padLeft(2, '0')} · Encrypted in Hive',
                              style: const TextStyle(color: Color(0xFF475569), fontSize: 10),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: isSynced
                              ? const Color(0xFF10B981).withOpacity(0.15)
                              : isSyncing
                              ? const Color(0xFF0EA5E9).withOpacity(0.15)
                              : const Color(0xFFF59E0B).withOpacity(0.15),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (isSyncing) ...[
                              const SizedBox(height: 8, width: 8, child: CircularProgressIndicator(color: Color(0xFF0EA5E9), strokeWidth: 1.5)),
                              const SizedBox(width: 4),
                            ],
                            Text(
                              isSynced
                                  ? 'SYNCED'
                                  : isSyncing
                                  ? 'SYNCING'
                                  : 'BUFFERED',
                              style: TextStyle(
                                color: isSynced
                                    ? const Color(0xFF10B981)
                                    : isSyncing
                                    ? const Color(0xFF0EA5E9)
                                    : const Color(0xFFF59E0B),
                                fontSize: 9,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
          ],
        ),
      ),
    );
  }

  Widget _filterChip(String label, String value) {
    final active = _filter == value;
    return GestureDetector(
      onTap: () => setState(() => _filter = value),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: active ? const Color(0xFF0EA5E9).withOpacity(0.2) : const Color(0xFF0D1829),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: active ? const Color(0xFF0EA5E9) : const Color(0xFF1E293B),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: active ? const Color(0xFF0EA5E9) : const Color(0xFF94A3B8),
            fontSize: 11,
            fontWeight: active ? FontWeight.w700 : FontWeight.w500,
          ),
        ),
      ),
    );
  }
}
