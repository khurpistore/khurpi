// GENERATED CODE - DO NOT MODIFY BY HAND

part of '../../../data/models/app_config_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_AppConfigModel _$AppConfigModelFromJson(Map<String, dynamic> json) =>
    _AppConfigModel(
      appName: json['app_name'] as String? ?? 'Khurpi Fresh',
      appTagline: json['app_tagline'] as String? ?? 'Fresh from Farm to Table',
      logoUrl: json['logo_url'] as String?,
      primaryColor: json['primary_color'] as String? ?? '#4CAF50',
      primaryDarkColor: json['primary_dark_color'] as String? ?? '#388E3C',
      secondaryColor: json['secondary_color'] as String? ?? '#FFC107',
      accentColor: json['accent_color'] as String? ?? '#FF5722',
      backgroundColor: json['background_color'] as String? ?? '#F5F5F5',
      surfaceColor: json['surface_color'] as String? ?? '#FFFFFF',
      errorColor: json['error_color'] as String? ?? '#F44336',
      successColor: json['success_color'] as String? ?? '#4CAF50',
      fontFamily: json['font_family'] as String? ?? 'Poppins',
      headingFontSize: (json['heading_font_size'] as num?)?.toInt() ?? 24,
      bodyFontSize: (json['body_font_size'] as num?)?.toInt() ?? 14,
      captionFontSize: (json['caption_font_size'] as num?)?.toInt() ?? 12,
      supportedCountries:
          (json['supported_countries'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      supportedStates:
          (json['supported_states'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      supportedCities:
          (json['supported_cities'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      supportedPincodes:
          (json['supported_pincodes'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      supportedSocieties:
          (json['supported_societies'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      minOrderValue: (json['min_order_value'] as num?)?.toDouble() ?? 100,
      freeDeliveryThreshold:
          (json['free_delivery_threshold'] as num?)?.toDouble() ?? 500,
      defaultDeliveryFee:
          (json['default_delivery_fee'] as num?)?.toDouble() ?? 40,
      enableCod: json['enable_cod'] as bool? ?? true,
      enableOnlinePayment: json['enable_online_payment'] as bool? ?? true,
      enableSubscriptions: json['enable_subscriptions'] as bool? ?? true,
      enableReferrals: json['enable_referrals'] as bool? ?? true,
      enableSpinWheel: json['enable_spin_wheel'] as bool? ?? true,
      supportPhone: json['support_phone'] as String?,
      supportEmail: json['support_email'] as String?,
      supportWhatsapp: json['support_whatsapp'] as String?,
    );

Map<String, dynamic> _$AppConfigModelToJson(_AppConfigModel instance) =>
    <String, dynamic>{
      'app_name': instance.appName,
      'app_tagline': instance.appTagline,
      'logo_url': ?instance.logoUrl,
      'primary_color': instance.primaryColor,
      'primary_dark_color': instance.primaryDarkColor,
      'secondary_color': instance.secondaryColor,
      'accent_color': instance.accentColor,
      'background_color': instance.backgroundColor,
      'surface_color': instance.surfaceColor,
      'error_color': instance.errorColor,
      'success_color': instance.successColor,
      'font_family': instance.fontFamily,
      'heading_font_size': instance.headingFontSize,
      'body_font_size': instance.bodyFontSize,
      'caption_font_size': instance.captionFontSize,
      'supported_countries': instance.supportedCountries,
      'supported_states': instance.supportedStates,
      'supported_cities': instance.supportedCities,
      'supported_pincodes': instance.supportedPincodes,
      'supported_societies': instance.supportedSocieties,
      'min_order_value': instance.minOrderValue,
      'free_delivery_threshold': instance.freeDeliveryThreshold,
      'default_delivery_fee': instance.defaultDeliveryFee,
      'enable_cod': instance.enableCod,
      'enable_online_payment': instance.enableOnlinePayment,
      'enable_subscriptions': instance.enableSubscriptions,
      'enable_referrals': instance.enableReferrals,
      'enable_spin_wheel': instance.enableSpinWheel,
      'support_phone': ?instance.supportPhone,
      'support_email': ?instance.supportEmail,
      'support_whatsapp': ?instance.supportWhatsapp,
    };
