import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import '../../../core/constants/app_constants.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  Timer? _pollTimer;
  bool _sending = false;

  final List<Map<String, dynamic>> _messages = [
    {
      'id': 'm1',
      'sender': 'Manager',
      'text': 'Rahul, please ensure photos are uploaded for the HVAC task at Connaught Place.',
      'time': '09:15 AM',
      'isMe': false,
    },
    {
      'id': 'm2',
      'sender': 'Rahul',
      'text': 'Understood sir, started inspection and replacement of compressor filter.',
      'time': '09:18 AM',
      'isMe': true,
    },
    {
      'id': 'm3',
      'sender': 'Manager',
      'text': 'Approved. Customer signature is mandatory before checkout.',
      'time': '09:20 AM',
      'isMe': false,
    },
  ];

  @override
  void initState() {
    super.initState();
    _fetchMessages();
    _pollTimer = Timer.periodic(const Duration(seconds: 4), (_) => _fetchMessages());
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _fetchMessages() async {
    try {
      final res = await http.get(Uri.parse('${AppConstants.apiBaseUrl}/chat/messages'));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['success'] == true && data['data'] != null && (data['data'] as List).isNotEmpty) {
          final list = data['data'] as List;
          final List<Map<String, dynamic>> loaded = [];

          for (var m in list) {
            final isRahul = m['sender_id'] == '00000000-0000-0000-0000-000000000000';
            final created = m['created_at'] != null ? DateTime.tryParse(m['created_at']) : null;
            final timeStr = created != null
                ? '${created.hour.toString().padLeft(2, '0')}:${created.minute.toString().padLeft(2, '0')}'
                : 'Just now';

            loaded.add({
              'id': m['id']?.toString() ?? UniqueKey().toString(),
              'sender': isRahul ? 'Rahul' : 'Manager',
              'text': m['content'] ?? '',
              'time': timeStr,
              'isMe': isRahul,
            });
          }

          if (mounted) {
            setState(() {
              // Combine initial messages and server messages avoiding duplicates
              for (var lm in loaded) {
                if (!_messages.any((x) => x['id'] == lm['id'])) {
                  _messages.add(lm);
                }
              }
            });
          }
        }
      }
    } catch (_) {}
  }

  Future<void> _sendMessage([String? quickText]) async {
    final text = quickText ?? _textController.text.trim();
    if (text.isEmpty || _sending) return;

    if (quickText == null) _textController.clear();

    final localMsg = {
      'id': UniqueKey().toString(),
      'sender': 'Rahul',
      'text': text,
      'time': '${TimeOfDay.now().hour.toString().padLeft(2, '0')}:${TimeOfDay.now().minute.toString().padLeft(2, '0')}',
      'isMe': true,
    };

    setState(() {
      _messages.add(localMsg);
      _sending = true;
    });

    _scrollToBottom();

    try {
      await http.post(
        Uri.parse('${AppConstants.apiBaseUrl}/chat/messages'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'senderId': '00000000-0000-0000-0000-000000000000',
          'content': text,
        }),
      );
    } catch (_) {} finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF050B14),
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              height: 36,
              width: 36,
              decoration: BoxDecoration(
                color: const Color(0xFF0EA5E9).withOpacity(0.2),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF0EA5E9).withOpacity(0.4)),
              ),
              child: const Icon(Icons.support_agent, color: Color(0xFF0EA5E9), size: 20),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text('Dispatch Operations', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800)),
                Text('Live 2-Way Console Sync', style: TextStyle(fontSize: 10, color: Color(0xFF10B981), fontWeight: FontWeight.w600)),
              ],
            ),
          ],
        ),
        backgroundColor: const Color(0xFF050B14),
        actions: [
          IconButton(
            icon: const Icon(Icons.warning_amber_rounded, color: Color(0xFFEF4444)),
            tooltip: 'SOS Emergency',
            onPressed: () => context.go('/sos'),
          ),
        ],
      ),
      body: Column(
        children: [
          // Messages list
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              itemCount: _messages.length,
              itemBuilder: (context, i) {
                final m = _messages[i];
                final isMe = m['isMe'] == true;

                return Align(
                  alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.78),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isMe ? const Color(0xFF0284C7) : const Color(0xFF0D1829),
                      borderRadius: BorderRadius.only(
                        topLeft: const Radius.circular(16),
                        topRight: const Radius.circular(16),
                        bottomLeft: Radius.circular(isMe ? 16 : 4),
                        bottomRight: Radius.circular(isMe ? 4 : 16),
                      ),
                      border: Border.all(
                        color: isMe ? const Color(0xFF38BDF8) : const Color(0xFF1E293B),
                        width: isMe ? 0.8 : 1,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.2),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (!isMe)
                          Padding(
                            padding: const EdgeInsets.only(bottom: 4),
                            child: Text(
                              m['sender'] ?? 'Dispatch',
                              style: const TextStyle(
                                color: Color(0xFF38BDF8),
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                        Text(
                          m['text'] ?? '',
                          style: const TextStyle(color: Colors.white, fontSize: 13, height: 1.3),
                        ),
                        const SizedBox(height: 4),
                        Align(
                          alignment: Alignment.bottomRight,
                          child: Text(
                            m['time'] ?? '',
                            style: TextStyle(
                              color: isMe ? Colors.white70 : const Color(0xFF64748B),
                              fontSize: 9,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          // Quick action chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            child: Row(
              children: [
                _quickChip('📍 Reached site safely'),
                const SizedBox(width: 8),
                _quickChip('🔧 Need part approval'),
                const SizedBox(width: 8),
                _quickChip('✅ Task #T-402 done'),
                const SizedBox(width: 8),
                _quickChip('⌛ 15 min delayed'),
              ],
            ),
          ),

          // Message input bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: const BoxDecoration(
              color: Color(0xFF0D1829),
              border: Border(top: BorderSide(color: Color(0xFF1E293B))),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _textController,
                      style: const TextStyle(color: Colors.white, fontSize: 14),
                      onSubmitted: (_) => _sendMessage(),
                      decoration: InputDecoration(
                        hintText: 'Type message to manager...',
                        hintStyle: const TextStyle(color: Color(0xFF475569), fontSize: 13),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        filled: true,
                        fillColor: const Color(0xFF050B14),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(20),
                          borderSide: const BorderSide(color: Color(0xFF1E293B)),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(20),
                          borderSide: const BorderSide(color: Color(0xFF1E293B)),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(20),
                          borderSide: const BorderSide(color: Color(0xFF0EA5E9)),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  GestureDetector(
                    onTap: _sendMessage,
                    child: Container(
                      height: 44,
                      width: 44,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: Color(0xFF0EA5E9),
                      ),
                      child: const Icon(Icons.send_rounded, color: Colors.white, size: 20),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _quickChip(String text) {
    return GestureDetector(
      onTap: () => _sendMessage(text),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: const Color(0xFF0D1829),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFF1E293B)),
        ),
        child: Text(text, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.w500)),
      ),
    );
  }
}
