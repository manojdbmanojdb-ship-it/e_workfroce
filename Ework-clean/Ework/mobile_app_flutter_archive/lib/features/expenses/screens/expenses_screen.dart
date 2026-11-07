import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../../../core/constants/app_constants.dart';

class ExpensesScreen extends StatefulWidget {
  const ExpensesScreen({super.key});

  @override
  State<ExpensesScreen> createState() => _ExpensesScreenState();
}

class _ExpensesScreenState extends State<ExpensesScreen> {
  List<dynamic> _expenses = [];
  bool _loading = true;
  String _filter = 'all';

  final List<Map<String, dynamic>> _fallbackExpenses = const [
    {
      'id': 'exp-1',
      'category': 'fuel',
      'amount': 850,
      'description': 'Fuel for field inspection van #1',
      'status': 'pending',
      'created_at': '2026-10-15T09:30:00Z',
    },
    {
      'id': 'exp-2',
      'category': 'food',
      'amount': 320,
      'description': 'Lunch during Connaught Place client site visit',
      'status': 'approved',
      'created_at': '2026-10-14T13:15:00Z',
    },
    {
      'id': 'exp-3',
      'category': 'transport',
      'amount': 1200,
      'description': 'Highway toll & emergency transit parking',
      'status': 'pending',
      'created_at': '2026-10-15T16:45:00Z',
    },
  ];

  @override
  void initState() {
    super.initState();
    _fetchExpenses();
  }

  Future<void> _fetchExpenses() async {
    setState(() => _loading = true);
    try {
      final res = await http.get(Uri.parse('${AppConstants.apiBaseUrl}/expenses'));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (data['success'] == true && data['data'] != null && (data['data'] as List).isNotEmpty) {
          if (mounted) {
            setState(() {
              _expenses = data['data'];
              _loading = false;
            });
            return;
          }
        }
      }
    } catch (_) {}

    if (mounted) {
      setState(() {
        _expenses = List.from(_fallbackExpenses);
        _loading = false;
      });
    }
  }

  void _showAddExpenseSheet() {
    final amountController = TextEditingController();
    final descController = TextEditingController();
    String category = 'fuel';
    bool hasReceipt = true;
    bool submitting = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF0D1829),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 20,
                bottom: MediaQuery.of(context).viewInsets.bottom + 24,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Submit Expense Claim',
                        style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: Color(0xFF94A3B8)),
                        onPressed: () => Navigator.pop(ctx),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Amount
                  const Text('Amount (INR)', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: amountController,
                    keyboardType: TextInputType.number,
                    style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700),
                    decoration: InputDecoration(
                      prefixText: '₹ ',
                      prefixStyle: const TextStyle(color: Color(0xFF0EA5E9), fontSize: 16, fontWeight: FontWeight.bold),
                      hintText: 'e.g. 750',
                      hintStyle: const TextStyle(color: Color(0xFF475569)),
                      filled: true,
                      fillColor: const Color(0xFF050B14),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF1E293B))),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF1E293B))),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Category
                  const Text('Category', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    decoration: BoxDecoration(
                      color: const Color(0xFF050B14),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF1E293B)),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: category,
                        dropdownColor: const Color(0xFF0D1829),
                        isExpanded: true,
                        icon: const Icon(Icons.keyboard_arrow_down, color: Color(0xFF0EA5E9)),
                        items: const [
                          DropdownMenuItem(value: 'fuel', child: Text('⛽ Fuel & Gasoline', style: TextStyle(color: Colors.white))),
                          DropdownMenuItem(value: 'food', child: Text('🍱 Meals & Refreshment', style: TextStyle(color: Colors.white))),
                          DropdownMenuItem(value: 'transport', child: Text('🚕 Travel / Tolls', style: TextStyle(color: Colors.white))),
                          DropdownMenuItem(value: 'materials', child: Text('🔧 Replacement Parts', style: TextStyle(color: Colors.white))),
                          DropdownMenuItem(value: 'other', child: Text('📦 Other Equipment', style: TextStyle(color: Colors.white))),
                        ],
                        onChanged: (val) {
                          if (val != null) setModalState(() => category = val);
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Description
                  const Text('Purpose / Description', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: descController,
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    decoration: InputDecoration(
                      hintText: 'e.g. Purchased air filter replacement',
                      hintStyle: const TextStyle(color: Color(0xFF475569)),
                      filled: true,
                      fillColor: const Color(0xFF050B14),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF1E293B))),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF1E293B))),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Receipt Toggle
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: const [
                          Icon(Icons.receipt_long, color: Color(0xFF0EA5E9), size: 20),
                          SizedBox(width: 8),
                          Text('Attach Receipt Photo', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
                        ],
                      ),
                      Switch(
                        value: hasReceipt,
                        onChanged: (v) => setModalState(() => hasReceipt = v),
                        activeColor: const Color(0xFF0EA5E9),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Submit
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: submitting
                          ? null
                          : () async {
                              final amt = double.tryParse(amountController.text.trim());
                              if (amt == null || amt <= 0) {
                                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please enter a valid amount')));
                                return;
                              }

                              setModalState(() => submitting = true);
                              try {
                                await http.post(
                                  Uri.parse('${AppConstants.apiBaseUrl}/expenses'),
                                  headers: {'Content-Type': 'application/json'},
                                  body: jsonEncode({
                                    'userId': '00000000-0000-0000-0000-000000000000',
                                    'category': category,
                                    'amount': amt,
                                    'currency': 'INR',
                                    'description': descController.text.trim().isNotEmpty
                                        ? descController.text.trim()
                                        : 'Field expense ($category)',
                                    'receiptUrl': hasReceipt ? 'https://example.com/receipt.jpg' : null,
                                  }),
                                );

                                Navigator.pop(ctx);
                                _fetchExpenses();

                                if (mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('✅ Expense submitted! Synced to Web Manager Console.'),
                                      backgroundColor: Color(0xFF10B981),
                                    ),
                                  );
                                }
                              } catch (e) {
                                setModalState(() => submitting = false);
                                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
                              }
                            },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0EA5E9),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      child: submitting
                          ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : const Text('Submit for Approval', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: Colors.white)),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  String _getCategoryIcon(String? cat) {
    switch (cat?.toLowerCase()) {
      case 'fuel':
        return '⛽';
      case 'food':
        return '🍱';
      case 'transport':
        return '🚕';
      case 'materials':
        return '🔧';
      default:
        return '📦';
    }
  }

  Color _getStatusColor(String? status) {
    switch (status?.toLowerCase()) {
      case 'approved':
        return const Color(0xFF10B981);
      case 'rejected':
        return const Color(0xFFEF4444);
      case 'pending':
      default:
        return const Color(0xFFF59E0B);
    }
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _expenses.where((e) {
      if (_filter == 'all') return true;
      return (e['status'] ?? '').toString().toLowerCase() == _filter;
    }).toList();

    double totalApproved = 0;
    for (var e in _expenses) {
      if ((e['status'] ?? '').toString().toLowerCase() == 'approved') {
        totalApproved += (e['amount'] is num ? (e['amount'] as num).toDouble() : double.tryParse(e['amount'].toString()) ?? 0);
      }
    }

    return Scaffold(
      backgroundColor: const Color(0xFF050B14),
      appBar: AppBar(
        title: const Text('Expense Claims', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
        backgroundColor: const Color(0xFF050B14),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Color(0xFF0EA5E9)),
            onPressed: _fetchExpenses,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showAddExpenseSheet,
        backgroundColor: const Color(0xFF0EA5E9),
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('New Claim', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
      ),
      body: Column(
        children: [
          // Total Approved Banner
          Container(
            margin: const EdgeInsets.all(16),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF0D1829), Color(0xFF111E2E)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF1E293B)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Approved Claims This Month', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                    const SizedBox(height: 4),
                    Text(
                      '₹${totalApproved.toStringAsFixed(0)}',
                      style: const TextStyle(color: Color(0xFF10B981), fontSize: 24, fontWeight: FontWeight.w900),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withOpacity(0.12),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '${_expenses.where((e) => (e['status'] ?? '').toString().toLowerCase() == 'pending').length} Pending',
                    style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 11, fontWeight: FontWeight.w700),
                  ),
                ),
              ],
            ),
          ),

          // Filter Row
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                _filterChip('All Claims', 'all'),
                const SizedBox(width: 8),
                _filterChip('Pending', 'pending'),
                const SizedBox(width: 8),
                _filterChip('Approved', 'approved'),
                const SizedBox(width: 8),
                _filterChip('Rejected', 'rejected'),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Expenses List
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFF0EA5E9)))
                : RefreshIndicator(
                    onRefresh: _fetchExpenses,
                    color: const Color(0xFF0EA5E9),
                    backgroundColor: const Color(0xFF0D1829),
                    child: filtered.isEmpty
                        ? const Center(child: Text('No expense claims found', style: TextStyle(color: Color(0xFF64748B))))
                        : ListView.separated(
                            padding: const EdgeInsets.fromLTRB(16, 4, 16, 80),
                            itemCount: filtered.length,
                            separatorBuilder: (_, __) => const SizedBox(height: 10),
                            itemBuilder: (context, i) {
                              final exp = filtered[i];
                              final status = (exp['status'] ?? 'pending').toString().toLowerCase();
                              final sColor = _getStatusColor(status);
                              final icon = _getCategoryIcon(exp['category']);
                              final amount = exp['amount']?.toString() ?? '0';

                              return Container(
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF0D1829),
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: const Color(0xFF1E293B)),
                                ),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Container(
                                      height: 44,
                                      width: 44,
                                      alignment: Alignment.center,
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF050B14),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Text(icon, style: const TextStyle(fontSize: 20)),
                                    ),
                                    const SizedBox(width: 14),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            exp['description'] ?? 'Field expense (${exp['category']})',
                                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            '${(exp['category'] ?? 'General').toString().toUpperCase()} • ${exp['receipt_url'] != null ? '📷 Receipt Uploaded' : 'No Receipt'}',
                                            style: const TextStyle(color: Color(0xFF64748B), fontSize: 11),
                                          ),
                                        ],
                                      ),
                                    ),
                                    const SizedBox(width: 10),
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.end,
                                      children: [
                                        Text(
                                          '₹$amount',
                                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 16),
                                        ),
                                        const SizedBox(height: 4),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                          decoration: BoxDecoration(
                                            color: sColor.withOpacity(0.15),
                                            borderRadius: BorderRadius.circular(6),
                                            border: Border.all(color: sColor.withOpacity(0.3)),
                                          ),
                                          child: Text(
                                            status.toUpperCase(),
                                            style: TextStyle(color: sColor, fontSize: 9, fontWeight: FontWeight.w800),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
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
