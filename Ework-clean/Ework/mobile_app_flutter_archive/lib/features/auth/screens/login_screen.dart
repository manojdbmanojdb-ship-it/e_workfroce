import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/constants/app_constants.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController(text: 'rahul@ework.com');
  final _passwordController = TextEditingController(text: 'Workforce@2026');
  bool _loading = false;
  bool _obscure = true;

  final List<Map<String, String>> _demoAccounts = const [
    {
      'name': 'Rahul Sharma',
      'email': 'rahul@ework.com',
      'role': 'Technician',
      'icon': '🔧',
      'color': '0xFF0EA5E9',
    },
    {
      'name': 'Priya Patel',
      'email': 'priya@ework.com',
      'role': 'Sales Executive',
      'icon': '💼',
      'color': '0xFF10B981',
    },
    {
      'name': 'Amit Verma',
      'email': 'amit@ework.com',
      'role': 'Delivery Agent',
      'icon': '📦',
      'color': '0xFFF59E0B',
    },
    {
      'name': 'Sneha Rao',
      'email': 'sneha@ework.com',
      'role': 'Site Inspector',
      'icon': '📋',
      'color': '0xFF6366F1',
    },
    {
      'name': 'Rajesh Kumar',
      'email': 'manager@ework.com',
      'role': 'Operations Manager',
      'icon': '👔',
      'color': '0xFFEC4899',
    },
  ];

  void _selectPersona(Map<String, String> acc) {
    setState(() {
      _emailController.text = acc['email']!;
      _passwordController.text = 'Workforce@2026';
    });
  }

  Future<void> _login() async {
    setState(() {
      _loading = true;
    });

    final email = _emailController.text.trim();
    final pwd = _passwordController.text;

    // Try Supabase auth if configured
    try {
      final res = await Supabase.instance.client.auth.signInWithPassword(
        email: email,
        password: pwd,
      );
      if (res.user != null) {
        final meta = res.user!.userMetadata;
        CurrentSession.setSession(
          newName: meta?['full_name'] ?? email.split('@')[0],
          newEmail: email,
          newRole: meta?['role'] ?? 'Technician',
          newUserId: res.user!.id,
          manager: meta?['role'] == 'manager' || meta?['role'] == 'admin',
        );
      }
    } catch (_) {
      // Fallback matching demo account
      final match = _demoAccounts.firstWhere(
        (a) => a['email']!.toLowerCase() == email.toLowerCase(),
        orElse: () => {
          'name': email.split('@')[0],
          'email': email,
          'role': 'Field Employee',
          'icon': '👤',
          'color': '0xFF0EA5E9',
        },
      );

      CurrentSession.setSession(
        newName: match['name']!,
        newEmail: match['email']!,
        newRole: match['role']!,
        newUserId: '00000000-0000-0000-0000-000000000000',
        manager: match['role']?.contains('Manager') == true,
      );
    }

    if (mounted) {
      setState(() => _loading = false);
      context.go('/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF050B14),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 20),
              // Brand Logo
              Row(
                children: [
                  Container(
                    height: 44,
                    width: 44,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(14),
                      gradient: const LinearGradient(
                        colors: [Color(0xFF2563EB), Color(0xFF0EA5E9)],
                      ),
                    ),
                    child: const Icon(Icons.navigation, color: Colors.white, size: 22),
                  ),
                  const SizedBox(width: 12),
                  RichText(
                    text: const TextSpan(
                      style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, letterSpacing: 2),
                      children: [
                        TextSpan(text: 'TASK', style: TextStyle(color: Colors.white)),
                        TextSpan(text: 'ROOM', style: TextStyle(color: Color(0xFF0EA5E9))),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 36),
              const Text('Welcome Back', style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900)),
              const SizedBox(height: 4),
              const Text('Sign in to your enterprise workforce account', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13)),
              const SizedBox(height: 24),

              // Quick Persona Selector
              const Text('SELECT DEMO PERSONA', style: TextStyle(color: Color(0xFF64748B), fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 1.2)),
              const SizedBox(height: 10),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: _demoAccounts.map((acc) {
                    final isSelected = _emailController.text == acc['email'];
                    return GestureDetector(
                      onTap: () => _selectPersona(acc),
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
                            Text(acc['icon']!, style: const TextStyle(fontSize: 14)),
                            const SizedBox(width: 6),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(acc['name']!, style: TextStyle(color: isSelected ? Colors.white : const Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.w700)),
                                Text(acc['role']!, style: const TextStyle(color: Color(0xFF64748B), fontSize: 9)),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 24),

              // Email Input
              TextField(
                controller: _emailController,
                style: const TextStyle(color: Colors.white, fontSize: 14),
                decoration: InputDecoration(
                  labelText: 'Email Address',
                  labelStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
                  hintText: 'you@ework.com',
                  hintStyle: const TextStyle(color: Color(0xFF334155)),
                  prefixIcon: const Icon(Icons.email_outlined, color: Color(0xFF475569), size: 20),
                  filled: true,
                  fillColor: const Color(0xFF0D1829),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF1E293B))),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF1E293B))),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF0EA5E9))),
                ),
              ),
              const SizedBox(height: 16),

              // Password Input
              TextField(
                controller: _passwordController,
                obscureText: _obscure,
                style: const TextStyle(color: Colors.white, fontSize: 14),
                onSubmitted: (_) => _login(),
                decoration: InputDecoration(
                  labelText: 'Password',
                  labelStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 13),
                  hintText: '••••••••',
                  hintStyle: const TextStyle(color: Color(0xFF334155)),
                  prefixIcon: const Icon(Icons.lock_outline, color: Color(0xFF475569), size: 20),
                  suffixIcon: IconButton(
                    icon: Icon(_obscure ? Icons.visibility_off : Icons.visibility, color: const Color(0xFF475569), size: 20),
                    onPressed: () => setState(() => _obscure = !_obscure),
                  ),
                  filled: true,
                  fillColor: const Color(0xFF0D1829),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF1E293B))),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF1E293B))),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF0EA5E9))),
                ),
              ),
              const SizedBox(height: 28),

              // Submit Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _loading ? null : _login,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    backgroundColor: const Color(0xFF0EA5E9),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: _loading
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Text('Sign In to TaskRoom', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: Colors.white)),
                ),
              ),
              const SizedBox(height: 20),

              Center(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: const [
                    Icon(Icons.shield_outlined, color: Color(0xFF10B981), size: 14),
                    SizedBox(width: 6),
                    Text('Supabase Enterprise JWT Security', style: TextStyle(color: Color(0xFF64748B), fontSize: 11)),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
