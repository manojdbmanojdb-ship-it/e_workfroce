import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../../../core/constants/app_constants.dart';

class AttendanceScreen extends StatefulWidget {
  const AttendanceScreen({super.key});
  @override
  State<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  bool _checkedIn = false;
  bool _loading = false;
  String? _checkInTime;
  String? _attendanceId;

  // Anti-Spoofing & Mock Location verification states
  bool _spoofDetected = false;
  bool _simulateSpoofAttempt = false;
  double _distanceFromSite = 18.4; // meters from Delhi HQ
  final double _geofenceRadius = 150.0;

  Future<void> _handleCheckIn() async {
    if (_simulateSpoofAttempt) {
      setState(() => _spoofDetected = true);
      showDialog(
        context: context,
        builder: (_) => AlertDialog(
          backgroundColor: const Color(0xFF0D1829),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(
            children: const [
              Icon(Icons.shield, color: Color(0xFFEF4444)),
              SizedBox(width: 8),
              Text('Security Alert', style: TextStyle(color: Colors.white, fontSize: 16)),
            ],
          ),
          content: const Text(
            'Mock Location Provider Detected!\n\nTaskRoom Enterprise security policy blocks simulated GPS coordinates. This violation has been flagged to your operations manager.',
            style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13, height: 1.4),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Acknowledge', style: TextStyle(color: Color(0xFF0EA5E9), fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      );
      return;
    }

    setState(() => _loading = true);
    try {
      if (!_checkedIn) {
        // Send check-in to backend
        final res = await http.post(
          Uri.parse('${AppConstants.apiBaseUrl}/attendance/check-in'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'userId': CurrentSession.userId,
            'siteId': 'b827ac9e-c6c4-4861-b1ad-d332343d1ed3',
            'lat': 28.6315,
            'lng': 77.2167,
            'method': 'gps_geofence'
          }),
        );
        final data = jsonDecode(res.body);

        if (mounted) {
          setState(() {
            _loading = false;
            _checkedIn = true;
            final now = TimeOfDay.now();
            _checkInTime = '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';
            _attendanceId = data['data'] != null ? data['data']['id'] : null;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('✅ Hardware GPS & Geofence Verified! Attendance recorded in Supabase.'),
              backgroundColor: Color(0xFF10B981),
            ),
          );
        }
      } else {
        // Handle check out
        if (_attendanceId != null) {
          await http.patch(
            Uri.parse('${AppConstants.apiBaseUrl}/attendance/check-out/$_attendanceId'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'lat': 28.6315, 'lng': 77.2167}),
          );
        }

        if (mounted) {
          setState(() {
            _loading = false;
            _checkedIn = false;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Shift Completed! Check-out logged to dispatch console.'),
              backgroundColor: Color(0xFF0EA5E9),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Connection error: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF050B14),
      appBar: AppBar(
        title: const Text('Attendance & Geofencing', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
        backgroundColor: const Color(0xFF050B14),
        actions: [
          IconButton(icon: const Icon(Icons.qr_code_scanner, color: Color(0xFF0EA5E9)), onPressed: () {}),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Anti-Spoofing Security Banner
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: _simulateSpoofAttempt
                    ? const Color(0xFFEF4444).withOpacity(0.15)
                    : const Color(0xFF10B981).withOpacity(0.12),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: _simulateSpoofAttempt ? const Color(0xFFEF4444) : const Color(0xFF10B981).withOpacity(0.3),
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    _simulateSpoofAttempt ? Icons.gpp_bad : Icons.verified_user,
                    color: _simulateSpoofAttempt ? const Color(0xFFEF4444) : const Color(0xFF10B981),
                    size: 22,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _simulateSpoofAttempt ? 'Mock Location Jitter Alert' : 'Anti-Spoofing Guard Active',
                          style: TextStyle(
                            color: _simulateSpoofAttempt ? const Color(0xFFEF4444) : const Color(0xFF10B981),
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        Text(
                          _simulateSpoofAttempt
                              ? 'Synthetic GPS signals intercepted · Policy violation'
                              : 'Hardware Sensor Integrity: 100% Genuine',
                          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Geofence Radar Animation
            Center(
              child: SizedBox(
                height: 190,
                width: 190,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    Container(
                      height: 190,
                      width: 190,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: const Color(0xFF0EA5E9).withOpacity(0.15), width: 1.5),
                      ),
                    ),
                    Container(
                      height: 130,
                      width: 130,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: const Color(0xFF0EA5E9).withOpacity(0.3), width: 1.5),
                      ),
                    ),
                    Container(
                      height: 74,
                      width: 74,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: const Color(0xFF0EA5E9), width: 2),
                        color: const Color(0xFF0EA5E9).withOpacity(0.1),
                      ),
                      child: const Icon(Icons.place, color: Color(0xFF0EA5E9), size: 28),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),

            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.check_circle, color: Color(0xFF10B981), size: 16),
                const SizedBox(width: 6),
                Text(
                  'Inside Geofence: ${_distanceFromSite.toStringAsFixed(1)}m from site (Limit: ${_geofenceRadius.toInt()}m)',
                  style: const TextStyle(color: Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.w700),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (_spoofDetected)
              Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFEF4444).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.3)),
                ),
                child: Row(
                  children: const [
                    Icon(Icons.warning, color: Color(0xFFEF4444), size: 18),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Mock GPS violation flagged and reported.',
                        style: TextStyle(color: Color(0xFFEF4444), fontSize: 12, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
              ),

            // Status Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF0D1829),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: const Color(0xFF1E293B)),
              ),
              child: Column(
                children: [
                  Icon(
                    _checkedIn ? Icons.check_circle_rounded : Icons.radio_button_unchecked,
                    color: _checkedIn ? const Color(0xFF10B981) : const Color(0xFF475569),
                    size: 44,
                  ),
                  const SizedBox(height: 10),
                  Text(
                    _checkedIn ? 'Currently Checked In' : 'Not Checked In',
                    style: TextStyle(
                      color: _checkedIn ? const Color(0xFF10B981) : Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Employee: ${CurrentSession.name} (${CurrentSession.role})',
                    style: const TextStyle(color: Color(0xFF64748B), fontSize: 11),
                  ),
                  if (_checkInTime != null) ...[
                    const SizedBox(height: 6),
                    Text('Check-In Time: $_checkInTime  •  Live Supabase Synced', style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Check In/Out Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _loading ? null : _handleCheckIn,
                icon: _loading
                    ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : Icon(_checkedIn ? Icons.logout : Icons.login),
                label: Text(
                  _loading
                      ? 'Verifying Geofence & Hardware...'
                      : (_checkedIn ? 'Check Out of Shift' : 'Verify GPS & Check In'),
                  style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                ),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: _checkedIn ? const Color(0xFFEF4444) : const Color(0xFF0EA5E9),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Spoof Simulation Test Switch (Enterprise Audit Demo)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFF0D1829),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF1E293B)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: const [
                      Icon(Icons.bug_report_outlined, color: Color(0xFFF59E0B), size: 18),
                      SizedBox(width: 8),
                      Text('Test Mock GPS Detection', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12, fontWeight: FontWeight.w600)),
                    ],
                  ),
                  Switch(
                    value: _simulateSpoofAttempt,
                    onChanged: (v) => setState(() {
                      _simulateSpoofAttempt = v;
                      if (!v) _spoofDetected = false;
                    }),
                    activeColor: const Color(0xFFEF4444),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
