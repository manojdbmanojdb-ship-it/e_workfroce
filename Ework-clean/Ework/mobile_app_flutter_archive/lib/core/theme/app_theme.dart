import 'package:flutter/material.dart';

class AppTheme {
  // Brand Palette matching Web Dashboard
  static const Color primary = Color(0xFF0EA5E9);     // Sky Blue
  static const Color primaryDark = Color(0xFF0284C7);
  static const Color accent = Color(0xFF10B981);      // Emerald Green
  static const Color danger = Color(0xFFEF4444);      // Red (SOS)
  static const Color warning = Color(0xFFF59E0B);     // Amber

  // Dark Theme Palette
  static const Color bgDeep = Color(0xFF050B14);
  static const Color bgCard = Color(0xFF0D1829);
  static const Color bgElevated = Color(0xFF111E2E);
  static const Color bgBorder = Color(0xFF1E293B);

  // Text Colors
  static const Color textPrimary = Color(0xFFF1F5F9);
  static const Color textSecondary = Color(0xFF94A3B8);
  static const Color textMuted = Color(0xFF475569);

  static ThemeData get darkTheme => ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    colorScheme: const ColorScheme.dark(
      primary: primary,
      secondary: accent,
      error: danger,
      surface: bgCard,
    ),
    scaffoldBackgroundColor: bgDeep,
    cardColor: bgCard,
    dividerColor: bgBorder,
    textTheme: const TextTheme(
      displayLarge: TextStyle(color: textPrimary, fontWeight: FontWeight.w900, fontSize: 32),
      titleLarge: TextStyle(color: textPrimary, fontWeight: FontWeight.w700, fontSize: 20),
      titleMedium: TextStyle(color: textPrimary, fontWeight: FontWeight.w600, fontSize: 16),
      bodyLarge: TextStyle(color: textPrimary, fontSize: 14),
      bodyMedium: TextStyle(color: textSecondary, fontSize: 12),
      labelSmall: TextStyle(color: textMuted, fontSize: 10),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: bgDeep,
      elevation: 0,
      iconTheme: IconThemeData(color: textPrimary),
      titleTextStyle: TextStyle(
        color: textPrimary,
        fontSize: 18,
        fontWeight: FontWeight.w700,
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primary,
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        textStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
      ),
    ),
  );
}
