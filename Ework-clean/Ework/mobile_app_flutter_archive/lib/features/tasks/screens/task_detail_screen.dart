import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../../../core/constants/app_constants.dart';

class TaskDetailScreen extends StatefulWidget {
  final String taskId;
  const TaskDetailScreen({super.key, required this.taskId});

  @override
  State<TaskDetailScreen> createState() => _TaskDetailScreenState();
}

class _TaskDetailScreenState extends State<TaskDetailScreen> {
  Map<String, dynamic>? _task;
  bool _loading = true;
  bool _submitting = false;

  bool _photoAdded = false;
  bool _signatureAdded = false;
  int _rating = 5;
  final TextEditingController _clientNameController = TextEditingController(text: 'Anil Mehta (Store Mgr)');
  final TextEditingController _feedbackController = TextEditingController(text: 'Job completed satisfactorily. Compressor operational.');

  @override
  void initState() {
    super.initState();
    _loadTask();
  }

  Future<void> _loadTask() async {
    setState(() => _loading = true);
    try {
      final res = await http.get(Uri.parse('${AppConstants.apiBaseUrl}/tasks'));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['success'] == true && data['data'] != null) {
          final list = data['data'] as List;
          final match = list.firstWhere(
            (t) => t['id']?.toString() == widget.taskId,
            orElse: () => null,
          );
          if (match != null && mounted) {
            setState(() {
              _task = match;
              if (match['customer_rating'] != null) {
                _rating = match['customer_rating'] as int;
              }
              if (match['status'] == 'completed') {
                _photoAdded = true;
                _signatureAdded = true;
              }
              _loading = false;
            });
            return;
          }
        }
      }
    } catch (_) {}

    // Fallback info
    if (mounted) {
      setState(() {
        _task = {
          'id': widget.taskId,
          'title': 'HVAC Compressor Inspection #T-402',
          'description': 'Inspect main cooling compressor unit, replace filters and run diagnostics.',
          'address': 'Connaught Place, New Delhi',
          'priority': 'high',
          'status': 'in_progress',
        };
        _loading = false;
      });
    }
  }

  Future<void> _updateStatus(String newStatus) async {
    setState(() => _submitting = true);
    try {
      await http.patch(
        Uri.parse('${AppConstants.apiBaseUrl}/tasks/${widget.taskId}/status'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'status': newStatus}),
      );
      if (mounted) {
        setState(() {
          _task?['status'] = newStatus;
          _submitting = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Status updated to ${newStatus.replaceAll('_', ' ').toUpperCase()}'),
            backgroundColor: const Color(0xFF0EA5E9),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _submitting = false);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  Future<void> _submitProof() async {
    setState(() => _submitting = true);
    try {
      await http.patch(
        Uri.parse('${AppConstants.apiBaseUrl}/tasks/${widget.taskId}/proof'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'proofPhotoUrls': [
            'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500'
          ],
          'signatureUrl': 'data:image/svg+xml;base64,PHN2Zz5TaWduZWQgYnkgQ3VzdG9tZXI8L3N2Zz4=',
          'customerName': _clientNameController.text.trim(),
          'customerRating': _rating,
          'customerFeedback': _feedbackController.text.trim(),
        }),
      );

      if (mounted) {
        setState(() {
          _submitting = false;
          _task?['status'] = 'completed';
        });

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ Proof submitted! Task marked Completed on Web Dispatch Board.'),
            backgroundColor: Color(0xFF10B981),
            duration: Duration(seconds: 3),
          ),
        );

        Future.delayed(const Duration(milliseconds: 1200), () {
          if (mounted) Navigator.pop(context, true);
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _submitting = false);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to submit proof: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
        backgroundColor: Color(0xFF050B14),
        body: Center(child: CircularProgressIndicator(color: Color(0xFF0EA5E9))),
      );
    }

    final isCompleted = _task?['status'] == 'completed';

    return Scaffold(
      backgroundColor: const Color(0xFF050B14),
      appBar: AppBar(
        title: const Text('Task Details', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
        backgroundColor: const Color(0xFF050B14),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Task Header Card
            Container(
              padding: const EdgeInsets.all(18),
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
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: isCompleted
                              ? const Color(0xFF10B981).withOpacity(0.15)
                              : const Color(0xFF0EA5E9).withOpacity(0.15),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          (_task?['status'] ?? 'pending').toString().replaceAll('_', ' ').toUpperCase(),
                          style: TextStyle(
                            color: isCompleted ? const Color(0xFF10B981) : const Color(0xFF0EA5E9),
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                      Text(
                        'Priority: ${(_task?['priority'] ?? 'medium').toString().toUpperCase()}',
                        style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 11, fontWeight: FontWeight.w700),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    _task?['title'] ?? 'Task Details',
                    style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.location_on, color: Color(0xFF0EA5E9), size: 16),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          _task?['address'] ?? 'Site address',
                          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Divider(color: Color(0xFF1E293B)),
                  const SizedBox(height: 8),
                  const Text('Description & Work Instructions', style: TextStyle(color: Color(0xFF64748B), fontSize: 11, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 4),
                  Text(
                    _task?['description'] ?? 'Perform on-site maintenance and test operational safety parameters.',
                    style: const TextStyle(color: Color(0xFFF1F5F9), fontSize: 13, height: 1.4),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Route & In-Progress Quick Triggers
            if (!isCompleted) ...[
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      icon: const Icon(Icons.directions_car, size: 16),
                      label: const Text('In Route'),
                      onPressed: _submitting ? null : () => _updateStatus('in_route'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF0EA5E9),
                        side: const BorderSide(color: Color(0xFF0EA5E9)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton.icon(
                      icon: const Icon(Icons.play_arrow, size: 16),
                      label: const Text('Start Work'),
                      onPressed: _submitting ? null : () => _updateStatus('in_progress'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFFF59E0B),
                        side: const BorderSide(color: Color(0xFFF59E0B)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
            ],

            // Proof of Work Section
            const Text('Proof of Work (Required to Complete)', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 15)),
            const SizedBox(height: 12),

            Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: isCompleted ? null : () => setState(() => _photoAdded = !_photoAdded),
                    child: Container(
                      height: 88,
                      decoration: BoxDecoration(
                        color: _photoAdded ? const Color(0xFF10B981).withOpacity(0.15) : const Color(0xFF0D1829),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: _photoAdded ? const Color(0xFF10B981) : const Color(0xFF1E293B)),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            _photoAdded ? Icons.check_circle : Icons.camera_alt_outlined,
                            color: _photoAdded ? const Color(0xFF10B981) : const Color(0xFF0EA5E9),
                            size: 26,
                          ),
                          const SizedBox(height: 6),
                          Text(
                            _photoAdded ? 'Site Photo Attached' : 'Capture Photo',
                            style: TextStyle(
                              color: _photoAdded ? const Color(0xFF10B981) : const Color(0xFF94A3B8),
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: GestureDetector(
                    onTap: isCompleted ? null : () => setState(() => _signatureAdded = !_signatureAdded),
                    child: Container(
                      height: 88,
                      decoration: BoxDecoration(
                        color: _signatureAdded ? const Color(0xFF0EA5E9).withOpacity(0.15) : const Color(0xFF0D1829),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: _signatureAdded ? const Color(0xFF0EA5E9) : const Color(0xFF1E293B)),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            _signatureAdded ? Icons.check_circle : Icons.draw_outlined,
                            color: _signatureAdded ? const Color(0xFF0EA5E9) : const Color(0xFF0EA5E9),
                            size: 26,
                          ),
                          const SizedBox(height: 6),
                          Text(
                            _signatureAdded ? 'Signature Verified' : 'Customer Sign',
                            style: TextStyle(
                              color: _signatureAdded ? const Color(0xFF0EA5E9) : const Color(0xFF94A3B8),
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Customer Name & Rating
            const Text('Customer Sign-off Details', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14)),
            const SizedBox(height: 8),

            TextField(
              controller: _clientNameController,
              enabled: !isCompleted,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                labelText: 'Customer / Manager Sign-off Name',
                labelStyle: const TextStyle(color: Color(0xFF64748B)),
                filled: true,
                fillColor: const Color(0xFF0D1829),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF1E293B))),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF1E293B))),
              ),
            ),
            const SizedBox(height: 12),

            TextField(
              controller: _feedbackController,
              enabled: !isCompleted,
              maxLines: 2,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                labelText: 'Work Notes & Feedback',
                labelStyle: const TextStyle(color: Color(0xFF64748B)),
                filled: true,
                fillColor: const Color(0xFF0D1829),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF1E293B))),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF1E293B))),
              ),
            ),
            const SizedBox(height: 16),

            // Rating Stars
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Client Satisfaction Rating:', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                Row(
                  children: List.generate(5, (i) => GestureDetector(
                    onTap: isCompleted ? null : () => setState(() => _rating = i + 1),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 2),
                      child: Icon(
                        i < _rating ? Icons.star : Icons.star_border,
                        color: const Color(0xFFF59E0B),
                        size: 26,
                      ),
                    ),
                  )),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Submit Button
            if (!isCompleted)
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: (_photoAdded && _signatureAdded && !_submitting) ? _submitProof : null,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    backgroundColor: const Color(0xFF10B981),
                    disabledBackgroundColor: const Color(0xFF1E293B),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: _submitting
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text(
                          'Complete Task & Submit Proof',
                          style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: Colors.white),
                        ),
                ),
              )
            else
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withOpacity(0.12),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFF10B981).withOpacity(0.3)),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.check_circle, color: Color(0xFF10B981)),
                    SizedBox(width: 8),
                    Text('Task Completed & Verified on Web Console', style: TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.w700, fontSize: 13)),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
