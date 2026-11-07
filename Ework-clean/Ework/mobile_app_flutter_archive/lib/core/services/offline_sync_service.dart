import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../constants/app_constants.dart';

class QueuedAction {
  final String id;
  final String type; // 'attendance', 'task_proof', 'expense', 'chat'
  final String title;
  final String description;
  final Map<String, dynamic> payload;
  final DateTime timestamp;
  bool isSyncing;
  bool isSynced;

  QueuedAction({
    required this.id,
    required this.type,
    required this.title,
    required this.description,
    required this.payload,
    required this.timestamp,
    this.isSyncing = false,
    this.isSynced = false,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'type': type,
    'title': title,
    'description': description,
    'payload': payload,
    'timestamp': timestamp.toIso8601String(),
    'isSynced': isSynced,
  };
}

class OfflineSyncService extends ChangeNotifier {
  static final OfflineSyncService instance = OfflineSyncService._internal();
  OfflineSyncService._internal() {
    _initSampleQueue();
  }

  bool _isOfflineMode = false;
  bool get isOfflineMode => _isOfflineMode;

  final List<QueuedAction> _queue = [];
  List<QueuedAction> get queue => List.unmodifiable(_queue);

  int get pendingCount => _queue.where((a) => !a.isSynced).length;

  void toggleOfflineMode(bool value) {
    _isOfflineMode = value;
    notifyListeners();
  }

  void _initSampleQueue() {
    _queue.addAll([
      QueuedAction(
        id: 'q-101',
        type: 'attendance',
        title: 'Geofenced Check-In',
        description: 'Connaught Place Site (GPS Lat: 28.6315, Lng: 77.2167)',
        payload: {
          'userId': '00000000-0000-0000-0000-000000000000',
          'siteId': 'b827ac9e-c6c4-4861-b1ad-d332343d1ed3',
          'lat': 28.6315,
          'lng': 77.2167,
          'method': 'gps_offline_queue'
        },
        timestamp: DateTime.now().subtract(const Duration(minutes: 42)),
      ),
      QueuedAction(
        id: 'q-102',
        type: 'task_proof',
        title: 'HVAC Inspection Proof #T-402',
        description: 'Photo + Customer Signature captured offline in basement',
        payload: {
          'taskId': '1436a466-987d-4c66-886f-3fe85c210d91',
          'customerName': 'Anil Mehta (Store Mgr)',
          'customerRating': 5,
          'customerFeedback': 'Compressor repaired and cleaned filters.',
        },
        timestamp: DateTime.now().subtract(const Duration(minutes: 25)),
      ),
      QueuedAction(
        id: 'q-103',
        type: 'expense',
        title: 'Fuel Claim ₹750',
        description: 'Gasoline for Field Van #1 with receipt photo',
        payload: {
          'userId': '00000000-0000-0000-0000-000000000000',
          'category': 'fuel',
          'amount': 750,
          'description': 'Fuel receipt during no-network transit',
        },
        timestamp: DateTime.now().subtract(const Duration(minutes: 10)),
      ),
    ]);
  }

  void addAction({
    required String type,
    required String title,
    required String description,
    required Map<String, dynamic> payload,
  }) {
    _queue.insert(
      0,
      QueuedAction(
        id: 'q-${DateTime.now().millisecondsSinceEpoch}',
        type: type,
        title: title,
        description: description,
        payload: payload,
        timestamp: DateTime.now(),
      ),
    );
    notifyListeners();
  }

  Future<int> flushQueue() async {
    int syncedCount = 0;

    for (final action in _queue.where((a) => !a.isSynced)) {
      action.isSyncing = true;
      notifyListeners();

      try {
        if (action.type == 'attendance') {
          await http.post(
            Uri.parse('${AppConstants.apiBaseUrl}/attendance/check-in'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode(action.payload),
          );
        } else if (action.type == 'task_proof') {
          final taskId = action.payload['taskId'] ?? '1436a466-987d-4c66-886f-3fe85c210d91';
          await http.patch(
            Uri.parse('${AppConstants.apiBaseUrl}/tasks/$taskId/proof'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'proofPhotoUrls': ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500'],
              'signatureUrl': 'data:image/svg+xml;base64,offline_signature_verified',
              'customerName': action.payload['customerName'] ?? 'Offline Verified Client',
              'customerRating': action.payload['customerRating'] ?? 5,
              'customerFeedback': action.payload['customerFeedback'] ?? 'Synced from offline storage queue',
            }),
          );
        } else if (action.type == 'expense') {
          await http.post(
            Uri.parse('${AppConstants.apiBaseUrl}/expenses'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode(action.payload),
          );
        }

        action.isSynced = true;
        syncedCount++;
      } catch (_) {
        // Keep in queue for next sync attempt
      } finally {
        action.isSyncing = false;
        notifyListeners();
      }
    }

    notifyListeners();
    return syncedCount;
  }

  void clearSynced() {
    _queue.removeWhere((a) => a.isSynced);
    notifyListeners();
  }
}
