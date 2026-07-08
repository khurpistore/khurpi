import 'package:flutter/material.dart';
import 'package:khurpi_fresh/data/models/app_config_model.dart';
import 'app_colors.dart';

/// Typography is driven by the admin App Config (font sizes + family).
/// The values below are fallbacks used until `/config` is fetched (and offline).
class AppTextStyles {
  // Base values (overridden by AppConfig via applyConfig)
  static double _heading = 24;
  static double _body = 14;
  static double _caption = 12;
  static String _fontFamily = 'Poppins';

  static void applyConfig(AppConfigModel config) {
    if (config.headingFontSize > 0) _heading = config.headingFontSize.toDouble();
    if (config.bodyFontSize > 0) _body = config.bodyFontSize.toDouble();
    if (config.captionFontSize > 0) _caption = config.captionFontSize.toDouble();
    if (config.fontFamily.trim().isNotEmpty) _fontFamily = config.fontFamily.trim();
  }

  static String get fontFamily => _fontFamily;

  // Headings (scaled around the config heading size)
  static TextStyle get h1 => TextStyle(fontFamily: _fontFamily, fontSize: _heading + 4, fontWeight: FontWeight.bold, color: AppColors.textPrimary);
  static TextStyle get h2 => TextStyle(fontFamily: _fontFamily, fontSize: _heading, fontWeight: FontWeight.bold, color: AppColors.textPrimary);
  static TextStyle get h3 => TextStyle(fontFamily: _fontFamily, fontSize: _heading - 4, fontWeight: FontWeight.w600, color: AppColors.textPrimary);
  static TextStyle get h4 => TextStyle(fontFamily: _fontFamily, fontSize: _heading - 6, fontWeight: FontWeight.w600, color: AppColors.textPrimary);

  // Body text styles (scaled around the config body size)
  static TextStyle get body => TextStyle(fontFamily: _fontFamily, fontSize: _body, fontWeight: FontWeight.normal, color: AppColors.textPrimary);
  static TextStyle get bodyLarge => TextStyle(fontFamily: _fontFamily, fontSize: _body + 2, fontWeight: FontWeight.normal, color: AppColors.textPrimary);
  static TextStyle get bodyMedium => TextStyle(fontFamily: _fontFamily, fontSize: _body, fontWeight: FontWeight.normal, color: AppColors.textPrimary);
  static TextStyle get bodySmall => TextStyle(fontFamily: _fontFamily, fontSize: _body - 2, fontWeight: FontWeight.normal, color: AppColors.textPrimary);

  static TextStyle get button => TextStyle(fontFamily: _fontFamily, fontSize: _body + 2, fontWeight: FontWeight.w600, color: Colors.white);
  static TextStyle get caption => TextStyle(fontFamily: _fontFamily, fontSize: _caption, fontWeight: FontWeight.normal, color: AppColors.textSecondary);

  static TextStyle get price => TextStyle(fontFamily: _fontFamily, fontSize: _heading - 6, fontWeight: FontWeight.bold, color: AppColors.primary);
  static TextStyle get priceSmall => TextStyle(fontFamily: _fontFamily, fontSize: _body, fontWeight: FontWeight.w600, color: AppColors.primary);
  static TextStyle get strikeThrough => TextStyle(
        fontFamily: _fontFamily,
        fontSize: _body,
        fontWeight: FontWeight.normal,
        color: AppColors.textHint,
        decoration: TextDecoration.lineThrough,
      );
}
