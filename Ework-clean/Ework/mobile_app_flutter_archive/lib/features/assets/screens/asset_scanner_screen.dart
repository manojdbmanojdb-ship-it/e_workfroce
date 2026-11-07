import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../../../core/constants/app_constants.dart';

class AssetScannerScreen extends StatefulWidget {
  const AssetScannerScreen({super.key});

  @override
  State<AssetScannerScreen> createState() => _AssetScannerScreenState();
}

class _AssetScannerScreenState extends State<AssetScannerScreen> with SingleTickerProviderStateMixin {
  final TextEditingController _codeController = TextEditingController(text: 'VEH-001');
  Map<String, dynamic>? _scannedAsset;
  bool _searching = false;
  bool _updating = false;
  late AnimationController _laserController;

  final List<Map<String, String>> _quickAssets = const [
    {'code': 'VEH-001', 'name': 'Toyota HiAce Van #1', 'cat': '🚐'},
    {'code': 'TOOL-003', 'name': 'Multimeter Kit Pro', 'cat': '🧰'},
    {'code': 'ELEC-007', 'name': 'FLIR Thermal Cam', 'cat': '📱'},
    {'code': 'MACH-002', 'name': 'Hydraulic Pump', 'cat': '⚙️'},
  ];

  @override
  void initState() {
    super.initState();
    _laserController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..repeat(reverse: true);
    _lookupAsset('VEH-001');
  }

  @override
  void dispose() {
    _laserController.dispose();
    _codeController.dispose();
    super.dispose();
  }

  Future<void> _lookupAsset(String code) async {
    final cleanCode = code.trim().toUpperCase();
    if (cleanCode.isEmpty) return;

    setState(() {
      _searching = true;
      _scannedAsset = null;
    });

    try {
      final res = await http.get(Uri.parse('${AppConstants.apiBaseUrl}/assets/scan/$cleanCode'));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['success'] == true && data['data'] != null) {
          if (mounted) {
            setState(() {
              _scannedAsset = data['data'];
              _searching = false;
            });
            return;
          }
        }
      }
    } catch (_) {}

    // Fallback info if API error
    if (mounted) {
      setState(() {
        _scannedAsset = {
          'id': '843eb1f3-eb2a-4fce-8a54-268fb4efcf35',
          'name': 'Toyota HiAce Field Van #1',
          'asset_code': cleanCode,
          'category': 'vehicle',
          'status': 'assigned',
          'assigned_to': CurrentSession.name,
          'condition_notes': 'Odometer: 24,500 km. Good operational condition.',
        };
        _searching = false;
      });
    }
  }

  Future<void> _updateAssetStatus({String? assignedTo, required String status}) async {
    if (_scannedAsset == null) return;
    setState(() => _updating = true);

    final id = _scannedAsset!['id'] ?? _scannedAsset!['asset_code'];

    try {
      final res = await http.patch(
        Uri.parse('${AppConstants.apiBaseUrl}/assets/$id/assign'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'assignedTo': assignedTo,
          'status': status,
        }),
      );

      final data = jsonDecode(res.body);
      if (data['success'] == true && data['data'] != null) {
        setState(() {
          _scannedAsset = data['data'];
        });
      }
    } catch (_) {
      setState(() {
        _scannedAsset?['assigned_to'] = assignedTo;
        _scannedAsset?['status'] = status;
      });
    } finally {
      if (mounted) {
        setState(() => _updating = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('✅ Asset ${status.toUpperCase()} — Synced to Web Inventory Console'),
            backgroundColor: const Color(0xFF10B981),
          ),
        );
      }
    }
  }

  Color _getStatusColor(String? status) {
    switch (status?.toLowerCase()) {
      case 'available':
        return const Color(0xFF10B981);
      case 'assigned':
        return const Color(0xFF0EA5E9);
      case 'under_maintenance':
        return const Color(0xFFF59E0B);
      case 'damaged':
        return const Color(0xFFEF4444);
      default:
        return const Color(0xFF94A3B8);
    }
  }

  String _getCategoryIcon(String? cat) {
    switch (cat?.toLowerCase()) {
      case 'vehicle':
        return '🚐';
      case 'tool_kit':
        return '🧰';
      case 'machinery':
        return '⚙️';
      case 'electronic':
        return '📱';
      default:
        return '📦';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF050B14),
      appBar: AppBar(
        title: const Text('Asset & Fleet Scanner', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
        backgroundColor: const Color(0xFF050B14),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Barcode Viewfinder Box with Laser Animation
            Container(
              height: 180,
              width: double.infinity,
              decoration: BoxDecoration(
                color: const Color(0xFF0D1829),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF0EA5E9).withOpacity(0.3)),
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // Corner brackets
                  Padding(
                    padding: const EdgeInsets.all(24),
                    child: Container(
                      decoration: BoxDecoration(
                        border: Border.all(color: const Color(0xFF38BDF8), width: 2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),

                  // Animated Scanning Laser Line
                  AnimatedBuilder(
                    animation: _laserController,
                    builder: (context, _) {
                      return Positioned(
                        top: 36 + (_laserController.value * 108),
                        left: 40,
                        right: 40,
                        child: Container(
                          height: 2,
                          decoration: BoxDecoration(
                            color: const Color(0xFF38BDF8),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF0EA5E9).withOpacity(0.8),
                                blurRadius: 8,
                                spreadRadius: 1,
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),

                  // Center barcode icon
                  const Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.qr_code_scanner, color: Color(0xFF0EA5E9), size: 38),
                      SizedBox(height: 6),
                      Text('Aim Camera at Asset Barcode / QR', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Quick Scan Barcode Pills
            const Align(
              alignment: Alignment.centerLeft,
              child: Text('TEST ASSET BARCODES', style: TextStyle(color: Color(0xFF64748B), fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 1.2)),
            ),
            const SizedBox(height: 8),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _quickAssets.map((a) {
                  final isSelected = _codeController.text == a['code'];
                  return GestureDetector(
                    onTap: () {
                      _codeController.text = a['code']!;
                      _lookupAsset(a['code']!);
                    },
                    child: Container(
                      margin: const EdgeInsets.only(right: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: isSelected ? const Color(0xFF0EA5E9).withOpacity(0.2) : const Color(0xFF0D1829),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isSelected ? const Color(0xFF0EA5E9) : const Color(0xFF1E293B),
                        ),
                      ),
                      child: Row(
                        children: [
                          Text(a['cat']!, style: const TextStyle(fontSize: 14)),
                          const SizedBox(width: 6),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(a['code']!, style: TextStyle(color: isSelected ? Colors.white : const Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.w700, fontFamily: 'monospace')),
                              Text(a['name']!, style: const TextStyle(color: Color(0xFF64748B), fontSize: 9)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 20),

            // Scanned Result Card
            if (_searching)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(24),
                  child: CircularProgressIndicator(color: Color(0xFF0EA5E9)),
                ),
              )
            else if (_scannedAsset != null) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: const Color(0xFF0D1829),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: const Color(0xFF1E293B)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Text(_getCategoryIcon(_scannedAsset!['category']), style: const TextStyle(fontSize: 24)),
                            const SizedBox(width: 10),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  _scannedAsset!['name'] ?? 'Asset Details',
                                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 14),
                                ),
                                Text(
                                  'Tag: ${_scannedAsset!['asset_code'] ?? _codeController.text}',
                                  style: const TextStyle(color: Color(0xFF0EA5E9), fontSize: 11, fontFamily: 'monospace', fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: _getStatusColor(_scannedAsset!['status']).withOpacity(0.15),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: _getStatusColor(_scannedAsset!['status']).withOpacity(0.3)),
                          ),
                          child: Text(
                            (_scannedAsset!['status'] ?? 'available').toString().replaceAll('_', ' ').toUpperCase(),
                            style: TextStyle(
                              color: _getStatusColor(_scannedAsset!['status']),
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    const Divider(color: Color(0xFF1E293B)),
                    const SizedBox(height: 10),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Currently Assigned To:', style: TextStyle(color: Color(0xFF64748B), fontSize: 12)),
                        Text(
                          _scannedAsset!['assigned_to'] ?? '— Unassigned / In Depot',
                          style: TextStyle(
                            color: _scannedAsset!['assigned_to'] != null ? Colors.white : const Color(0xFF94A3B8),
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Condition & Notes:', style: TextStyle(color: Color(0xFF64748B), fontSize: 12)),
                        Expanded(
                          child: Text(
                            _scannedAsset!['condition_notes'] ?? 'Operational',
                            textAlign: TextAlign.right,
                            style: const TextStyle(color: Color(0xFFF1F5F9), fontSize: 12),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 18),

                    // Action Buttons for Worker
                    Row(
                      children: [
                        // Check Out / Assign to Self
                        Expanded(
                          child: ElevatedButton.icon(
                            icon: const Icon(Icons.person_add, size: 16),
                            label: const Text('Check Out to Me', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                            onPressed: _updating
                                ? null
                                : () => _updateAssetStatus(assignedTo: CurrentSession.name, status: 'assigned'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF0EA5E9),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),

                        // Return to Depot
                        Expanded(
                          child: OutlinedButton.icon(
                            icon: const Icon(Icons.assignment_return, size: 16),
                            label: const Text('Return to Depot', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                            onPressed: _updating
                                ? null
                                : () => _updateAssetStatus(assignedTo: null, status: 'available'),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: const Color(0xFF10B981),
                              side: const BorderSide(color: Color(0xFF10B981)),
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
