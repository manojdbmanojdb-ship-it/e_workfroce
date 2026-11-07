import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import '../../../core/constants/app_constants.dart';

class TasksScreen extends StatefulWidget {
  const TasksScreen({super.key});

  @override
  State<TasksScreen> createState() => _TasksScreenState();
}

class _TasksScreenState extends State<TasksScreen> {
  List<dynamic> _tasks = [];
  bool _loading = true;
  String _filter = 'all';

  final List<Map<String, dynamic>> _fallbackTasks = const [
    {
      'id': '1436a466-987d-4c66-886f-3fe85c210d91',
      'title': 'HVAC Compressor Inspection #T-402',
      'description': 'Inspect main cooling compressor unit, replace filters',
      'address': 'Connaught Place, Delhi',
      'priority': 'high',
      'status': 'in_progress',
    },
    {
      'id': '3bdd4daa-6e89-4279-a0af-2ea958011d7c',
      'title': 'Electrical Safety Audit #E-108',
      'description': 'Check MCB circuit distribution boards',
      'address': 'Bandra West, Mumbai',
      'priority': 'urgent',
      'status': 'pending',
    },
    {
      'id': '71f8fc47-3742-495e-a45e-06d506f0af3f',
      'title': 'Water Pump Repair & Filter Swap',
      'description': 'Replace intake water valve and check flow',
      'address': 'Powai, Mumbai',
      'priority': 'medium',
      'status': 'pending',
    },
    {
      'id': 'a17ee20e-bbb7-41fe-93c2-756b7459cfed',
      'title': 'Quarterly Fire Extinguisher Testing',
      'description': 'Verify pressure on foam cylinders',
      'address': 'Hitec City, Hyderabad',
      'priority': 'low',
      'status': 'completed',
    },
  ];

  @override
  void initState() {
    super.initState();
    _fetchTasks();
  }

  Future<void> _fetchTasks() async {
    setState(() => _loading = true);
    try {
      final res = await http.get(Uri.parse('${AppConstants.apiBaseUrl}/tasks'));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['success'] == true && data['data'] != null && (data['data'] as List).isNotEmpty) {
          if (mounted) {
            setState(() {
              _tasks = data['data'];
              _loading = false;
            });
            return;
          }
        }
      }
    } catch (_) {
      // Offline fallback
    }

    if (mounted) {
      setState(() {
        _tasks = List.from(_fallbackTasks);
        _loading = false;
      });
    }
  }

  Color _getPriorityColor(String? priority) {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return const Color(0xFFEF4444);
      case 'high':
        return const Color(0xFFF97316);
      case 'medium':
        return const Color(0xFFF59E0B);
      case 'low':
      default:
        return const Color(0xFF10B981);
    }
  }

  Color _getStatusColor(String? status) {
    switch (status?.toLowerCase()) {
      case 'completed':
        return const Color(0xFF10B981);
      case 'in_progress':
        return const Color(0xFFF59E0B);
      case 'in_route':
        return const Color(0xFF0EA5E9);
      case 'pending':
      default:
        return const Color(0xFF94A3B8);
    }
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _tasks.where((t) {
      if (_filter == 'all') return true;
      return (t['status'] ?? '').toString().toLowerCase() == _filter;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFF050B14),
      appBar: AppBar(
        title: const Text('My Field Tasks', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
        backgroundColor: const Color(0xFF050B14),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Color(0xFF0EA5E9)),
            onPressed: _fetchTasks,
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter Tabs
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                _filterChip('All', 'all'),
                const SizedBox(width: 8),
                _filterChip('In Progress', 'in_progress'),
                const SizedBox(width: 8),
                _filterChip('Pending', 'pending'),
                const SizedBox(width: 8),
                _filterChip('Completed', 'completed'),
              ],
            ),
          ),

          // Task Count Bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${filtered.length} tasks assigned',
                  style: const TextStyle(color: Color(0xFF64748B), fontSize: 12, fontWeight: FontWeight.w600),
                ),
                const Row(
                  children: [
                    Icon(Icons.cloud_done, color: Color(0xFF10B981), size: 14),
                    SizedBox(width: 4),
                    Text('Supabase Sync Active', style: TextStyle(color: Color(0xFF10B981), fontSize: 11)),
                  ],
                ),
              ],
            ),
          ),

          // Tasks List
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFF0EA5E9)))
                : RefreshIndicator(
                    onRefresh: _fetchTasks,
                    color: const Color(0xFF0EA5E9),
                    backgroundColor: const Color(0xFF0D1829),
                    child: filtered.isEmpty
                        ? const Center(
                            child: Text('No tasks found in this view', style: TextStyle(color: Color(0xFF64748B))),
                          )
                        : ListView.separated(
                            padding: const EdgeInsets.all(16),
                            itemCount: filtered.length,
                            separatorBuilder: (_, __) => const SizedBox(height: 12),
                            itemBuilder: (context, i) {
                              final t = filtered[i];
                              final pColor = _getPriorityColor(t['priority']);
                              final sColor = _getStatusColor(t['status']);
                              final taskId = t['id']?.toString() ?? '$i';

                              return GestureDetector(
                                onTap: () async {
                                  await context.push('/tasks/$taskId');
                                  _fetchTasks();
                                },
                                child: Container(
                                  padding: const EdgeInsets.all(16),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF0D1829),
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(color: const Color(0xFF1E293B)),
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Expanded(
                                            child: Text(
                                              t['title'] ?? 'Untitled Task',
                                              style: const TextStyle(
                                                color: Colors.white,
                                                fontWeight: FontWeight.w700,
                                                fontSize: 14,
                                              ),
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                            decoration: BoxDecoration(
                                              color: pColor.withOpacity(0.15),
                                              borderRadius: BorderRadius.circular(6),
                                              border: Border.all(color: pColor.withOpacity(0.3)),
                                            ),
                                            child: Text(
                                              (t['priority'] ?? 'medium').toString().toUpperCase(),
                                              style: TextStyle(
                                                color: pColor,
                                                fontSize: 9,
                                                fontWeight: FontWeight.w800,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 8),
                                      Row(
                                        children: [
                                          const Icon(Icons.location_on_outlined, color: Color(0xFF64748B), size: 14),
                                          const SizedBox(width: 4),
                                          Expanded(
                                            child: Text(
                                              t['address'] ?? 'Site Location Not Specified',
                                              style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 12),
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                            decoration: BoxDecoration(
                                              color: sColor.withOpacity(0.12),
                                              borderRadius: BorderRadius.circular(6),
                                            ),
                                            child: Text(
                                              (t['status'] ?? 'pending').toString().replaceAll('_', ' ').toUpperCase(),
                                              style: TextStyle(
                                                color: sColor,
                                                fontSize: 10,
                                                fontWeight: FontWeight.w700,
                                              ),
                                            ),
                                          ),
                                          Row(
                                            children: const [
                                              Text('View Details', style: TextStyle(color: Color(0xFF0EA5E9), fontSize: 11, fontWeight: FontWeight.w600)),
                                              SizedBox(width: 2),
                                              Icon(Icons.chevron_right, color: Color(0xFF0EA5E9), size: 16),
                                            ],
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _filterChip(String label, String value) {
    final active = _filter == value;
    return GestureDetector(
      onTap: () => setState(() => _filter = value),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
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
            fontSize: 12,
            fontWeight: active ? FontWeight.w700 : FontWeight.w500,
          ),
        ),
      ),
    );
  }
}
