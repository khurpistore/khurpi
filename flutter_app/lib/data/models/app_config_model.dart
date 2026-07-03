import 'package:freezed_annotation/freezed_annotation.dart';

part '../../generated/data/models/app_config_model.freezed.dart';
part '../../generated/data/models/app_config_model.g.dart';

@freezed
abstract class AppConfigModel with _$AppConfigModel {
  const AppConfigModel._();
  
  const factory AppConfigModel({
    // Branding
    @JsonKey(name: 'app_name') @Default('Khurpi Fresh') String appName,
    @JsonKey(name: 'app_tagline') @Default('Fresh from Farm to Table') String appTagline,
    @JsonKey(name: 'logo_url') String? logoUrl,
    
    // Colors
    @JsonKey(name: 'primary_color') @Default('#4CAF50') String primaryColor,
    @JsonKey(name: 'primary_dark_color') @Default('#388E3C') String primaryDarkColor,
    @JsonKey(name: 'secondary_color') @Default('#FFC107') String secondaryColor,
    @JsonKey(name: 'accent_color') @Default('#FF5722') String accentColor,
    @JsonKey(name: 'background_color') @Default('#F5F5F5') String backgroundColor,
    @JsonKey(name: 'surface_color') @Default('#FFFFFF') String surfaceColor,
    @JsonKey(name: 'error_color') @Default('#F44336') String errorColor,
    @JsonKey(name: 'success_color') @Default('#4CAF50') String successColor,
    
    // Typography
    @JsonKey(name: 'font_family') @Default('Poppins') String fontFamily,
    @JsonKey(name: 'heading_font_size') @Default(24) int headingFontSize,
    @JsonKey(name: 'body_font_size') @Default(14) int bodyFontSize,
    @JsonKey(name: 'caption_font_size') @Default(12) int captionFontSize,
    
    // Service Areas
    @JsonKey(name: 'supported_countries') @Default([]) List<String> supportedCountries,
    @JsonKey(name: 'supported_states') @Default([]) List<String> supportedStates,
    @JsonKey(name: 'supported_cities') @Default([]) List<String> supportedCities,
    @JsonKey(name: 'supported_pincodes') @Default([]) List<String> supportedPincodes,
    @JsonKey(name: 'supported_societies') @Default([]) List<String> supportedSocieties,
    
    // Delivery Settings
    @JsonKey(name: 'min_order_value') @Default(100) double minOrderValue,
    @JsonKey(name: 'free_delivery_threshold') @Default(500) double freeDeliveryThreshold,
    @JsonKey(name: 'default_delivery_fee') @Default(40) double defaultDeliveryFee,
    
    // Feature Flags
    @JsonKey(name: 'enable_cod') @Default(true) bool enableCod,
    @JsonKey(name: 'enable_online_payment') @Default(true) bool enableOnlinePayment,
    @JsonKey(name: 'enable_subscriptions') @Default(true) bool enableSubscriptions,
    @JsonKey(name: 'enable_referrals') @Default(true) bool enableReferrals,
    @JsonKey(name: 'enable_spin_wheel') @Default(true) bool enableSpinWheel,
    
    // Contact
    @JsonKey(name: 'support_phone') String? supportPhone,
    @JsonKey(name: 'support_email') String? supportEmail,
    @JsonKey(name: 'support_whatsapp') String? supportWhatsapp,
  }) = _AppConfigModel;

  factory AppConfigModel.fromJson(Map<String, dynamic> json) =>
      _$AppConfigModelFromJson(json);
}
