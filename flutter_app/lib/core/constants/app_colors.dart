import 'package:flutter/material.dart';

/// All colors are driven by the admin App Config (mobile /config endpoint).
/// Values below are fallbacks used until /config is fetched (and offline).
class AppColors {
  // Primary Colors
  static Color primary = const Color(0xFF4CAF50);
  static Color primaryDark = const Color(0xFF388E3C);
  static Color primaryLight = const Color(0xFFC8E6C9);

  // Secondary Colors
  static Color secondary = const Color(0xFFFF9800);
  static Color secondaryDark = const Color(0xFFF57C00);

  // Neutral Colors
  static Color background = const Color(0xFFF5F5F5);
  static Color surface = Colors.white;
  static Color card = Colors.white;

  // Text Colors
  static Color textPrimary = const Color(0xFF212121);
  static Color textSecondary = const Color(0xFF757575);
  static Color textHint = const Color(0xFFBDBDBD);

  // Status Colors
  static Color success = const Color(0xFF4CAF50);
  static Color warning = const Color(0xFFFFC107);
  static Color error = const Color(0xFFF44336);
  static Color info = const Color(0xFF2196F3);

  // Stock Status Colors
  static Color inStock = const Color(0xFF4CAF50);
  static Color growing = const Color(0xFFFFC107);
  static Color outOfStock = const Color(0xFFF44336);

  // Border Colors
  static Color border = const Color(0xFFE0E0E0);
  static Color divider = const Color(0xFFEEEEEE);

  // Gradient (getter so it always reflects the current dynamic colors)
  static LinearGradient get primaryGradient => LinearGradient(
        colors: [primary, primaryDark],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );

  static Color _hex(dynamic value, Color fallback) {
    if (value is! String || value.trim().isEmpty) return fallback;
    try {
      var hex = value.replaceAll('#', '').trim();
      if (hex.length == 6) hex = 'FF$hex';
      if (hex.length != 8) return fallback;
      return Color(int.parse(hex, radix: 16));
    } catch (_) {
      return fallback;
    }
  }

  /// Apply colors from the raw App Config JSON (keys are snake_case hex strings).
  static void applyConfig(Map<String, dynamic> c) {
    primary = _hex(c['primary_color'], primary);
    primaryDark = _hex(c['primary_dark_color'], primaryDark);
    primaryLight = _hex(c['primary_light_color'], primaryLight);
    secondary = _hex(c['secondary_color'], secondary);
    secondaryDark = _hex(c['secondary_dark_color'], secondaryDark);
    background = _hex(c['background_color'], background);
    surface = _hex(c['surface_color'], surface);
    card = _hex(c['card_color'], card);
    textPrimary = _hex(c['text_primary_color'], textPrimary);
    textSecondary = _hex(c['text_secondary_color'], textSecondary);
    textHint = _hex(c['text_hint_color'], textHint);
    success = _hex(c['success_color'], success);
    warning = _hex(c['warning_color'], warning);
    error = _hex(c['error_color'], error);
    info = _hex(c['info_color'], info);
    inStock = _hex(c['in_stock_color'], inStock);
    growing = _hex(c['growing_color'], growing);
    outOfStock = _hex(c['out_of_stock_color'], outOfStock);
    border = _hex(c['border_color'], border);
    divider = _hex(c['divider_color'], divider);
  }
}
