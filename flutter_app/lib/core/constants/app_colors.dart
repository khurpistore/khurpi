import 'package:flutter/material.dart';
import 'package:khurpi_fresh/data/models/app_config_model.dart';

class AppColors {
  // Primary Colors (dynamic - driven by admin App Config)
  static Color primary = const Color(0xFF4CAF50);
  static Color primaryDark = const Color(0xFF388E3C);
  static const Color primaryLight = Color(0xFFC8E6C9);

  // Secondary Colors (secondary is dynamic)
  static Color secondary = const Color(0xFFFF9800);
  static const Color secondaryDark = Color(0xFFF57C00);

  // Neutral Colors (dynamic)
  static Color background = const Color(0xFFF5F5F5);
  static Color surface = Colors.white;
  static const Color card = Colors.white;

  // Text Colors
  static const Color textPrimary = Color(0xFF212121);
  static const Color textSecondary = Color(0xFF757575);
  static const Color textHint = Color(0xFFBDBDBD);

  // Status Colors (error/success dynamic)
  static Color success = const Color(0xFF4CAF50);
  static const Color warning = Color(0xFFFFC107);
  static Color error = const Color(0xFFF44336);
  static const Color info = Color(0xFF2196F3);

  // Stock Status Colors
  static const Color inStock = Color(0xFF4CAF50);
  static const Color growing = Color(0xFFFFC107);
  static const Color outOfStock = Color(0xFFF44336);

  // Border Colors
  static const Color border = Color(0xFFE0E0E0);
  static const Color divider = Color(0xFFEEEEEE);

  // Gradient (getter so it always reflects current dynamic colors)
  static LinearGradient get primaryGradient => LinearGradient(
        colors: [primary, primaryDark],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );

  /// Parse a hex color string like "#4CAF50" or "4CAF50" (with optional alpha).
  static Color _parseHex(String? value, Color fallback) {
    if (value == null || value.trim().isEmpty) return fallback;
    try {
      var hex = value.replaceAll('#', '').trim();
      if (hex.length == 6) hex = 'FF$hex';
      if (hex.length != 8) return fallback;
      return Color(int.parse(hex, radix: 16));
    } catch (_) {
      return fallback;
    }
  }

  /// Apply colors coming from the admin App Config (mobile /config endpoint).
  static void applyConfig(AppConfigModel config) {
    primary = _parseHex(config.primaryColor, primary);
    primaryDark = _parseHex(config.primaryDarkColor, primaryDark);
    secondary = _parseHex(config.secondaryColor, secondary);
    background = _parseHex(config.backgroundColor, background);
    surface = _parseHex(config.surfaceColor, surface);
    success = _parseHex(config.successColor, success);
    error = _parseHex(config.errorColor, error);
  }
}
