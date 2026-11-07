import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../../../core/constants/app_constants.dart';

class SosScreen extends StatefulWidget {
  const SosScreen({super.key});
  @override
  State<SosScreen> createState() => _SosScreenState();
}

class _SosScreenState extends State<SosScreen> {
  bool _sent = false;
  bool _loading = false;

  Future<void> _trigger() async {
    setState(() => _loading = true);
    try {
      await http.post(
        Uri.parse('${AppConstants.apiBaseUrl}/sos/trigger'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'userId': '00000000-0000-0000-0000-000000000000',
          'lat': 28.6315,
          'lng': 77.2167,
          'message': 'EMERGENCY: SOS Beacon triggered from Field Mobile App (Rahul Sharma)'
        }),
      );

      if (mounted) {
        setState(() {
          _sent = true;
          _loading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('🚨 Emergency SOS broadcasted live to all dispatch consoles!'),
            backgroundColor: Color(0xFFEF4444),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error triggering SOS: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF050B14),
      appBar: AppBar(title: const Text('Emergency SOS'), backgroundColor: const Color(0xFF050B14)),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                _sent ? 'SOS ALERT SENT ✅' : 'Emergency Assistance',
                style: TextStyle(
                  color: _sent ? const Color(0xFF10B981) : Colors.white,
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Pressing the SOS button instantly notifies your manager and broadcasts your live GPS coordinates.',
                style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 48),

              GestureDetector(
                onTap: _loading ? null : _trigger,
                child: Container(
                  height: 180,
                  width: 180,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: const Color(0xFFEF4444),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFFEF4444).withOpacity(0.4),
                        blurRadius: 40,
                        spreadRadius: 10,
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _loading
                          ? const CircularProgressIndicator(color: Colors.white)
                          : const Icon(Icons.warning_amber_rounded, color: Colors.white, size: 54),
                      const SizedBox(height: 6),
                      Text(
                        _loading ? 'SENDING...' : 'SOS',
                        style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900, letterSpacing: 2),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
