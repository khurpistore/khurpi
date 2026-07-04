// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of '../../../data/models/app_config_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$AppConfigModel {

// Branding
@JsonKey(name: 'app_name') String get appName;@JsonKey(name: 'app_tagline') String get appTagline;@JsonKey(name: 'logo_url') String? get logoUrl;// Colors
@JsonKey(name: 'primary_color') String get primaryColor;@JsonKey(name: 'primary_dark_color') String get primaryDarkColor;@JsonKey(name: 'secondary_color') String get secondaryColor;@JsonKey(name: 'accent_color') String get accentColor;@JsonKey(name: 'background_color') String get backgroundColor;@JsonKey(name: 'surface_color') String get surfaceColor;@JsonKey(name: 'error_color') String get errorColor;@JsonKey(name: 'success_color') String get successColor;// Typography
@JsonKey(name: 'font_family') String get fontFamily;@JsonKey(name: 'heading_font_size') int get headingFontSize;@JsonKey(name: 'body_font_size') int get bodyFontSize;@JsonKey(name: 'caption_font_size') int get captionFontSize;// Service Areas
@JsonKey(name: 'supported_countries') List<String> get supportedCountries;@JsonKey(name: 'supported_states') List<String> get supportedStates;@JsonKey(name: 'supported_cities') List<String> get supportedCities;@JsonKey(name: 'supported_pincodes') List<String> get supportedPincodes;@JsonKey(name: 'supported_societies') List<String> get supportedSocieties;// Delivery Settings
@JsonKey(name: 'min_order_value') double get minOrderValue;@JsonKey(name: 'free_delivery_threshold') double get freeDeliveryThreshold;@JsonKey(name: 'default_delivery_fee') double get defaultDeliveryFee;// Feature Flags
@JsonKey(name: 'enable_cod') bool get enableCod;@JsonKey(name: 'enable_online_payment') bool get enableOnlinePayment;@JsonKey(name: 'enable_subscriptions') bool get enableSubscriptions;@JsonKey(name: 'enable_referrals') bool get enableReferrals;@JsonKey(name: 'enable_spin_wheel') bool get enableSpinWheel;// Contact
@JsonKey(name: 'support_phone') String? get supportPhone;@JsonKey(name: 'support_email') String? get supportEmail;@JsonKey(name: 'support_whatsapp') String? get supportWhatsapp;
/// Create a copy of AppConfigModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$AppConfigModelCopyWith<AppConfigModel> get copyWith => _$AppConfigModelCopyWithImpl<AppConfigModel>(this as AppConfigModel, _$identity);

  /// Serializes this AppConfigModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is AppConfigModel&&(identical(other.appName, appName) || other.appName == appName)&&(identical(other.appTagline, appTagline) || other.appTagline == appTagline)&&(identical(other.logoUrl, logoUrl) || other.logoUrl == logoUrl)&&(identical(other.primaryColor, primaryColor) || other.primaryColor == primaryColor)&&(identical(other.primaryDarkColor, primaryDarkColor) || other.primaryDarkColor == primaryDarkColor)&&(identical(other.secondaryColor, secondaryColor) || other.secondaryColor == secondaryColor)&&(identical(other.accentColor, accentColor) || other.accentColor == accentColor)&&(identical(other.backgroundColor, backgroundColor) || other.backgroundColor == backgroundColor)&&(identical(other.surfaceColor, surfaceColor) || other.surfaceColor == surfaceColor)&&(identical(other.errorColor, errorColor) || other.errorColor == errorColor)&&(identical(other.successColor, successColor) || other.successColor == successColor)&&(identical(other.fontFamily, fontFamily) || other.fontFamily == fontFamily)&&(identical(other.headingFontSize, headingFontSize) || other.headingFontSize == headingFontSize)&&(identical(other.bodyFontSize, bodyFontSize) || other.bodyFontSize == bodyFontSize)&&(identical(other.captionFontSize, captionFontSize) || other.captionFontSize == captionFontSize)&&const DeepCollectionEquality().equals(other.supportedCountries, supportedCountries)&&const DeepCollectionEquality().equals(other.supportedStates, supportedStates)&&const DeepCollectionEquality().equals(other.supportedCities, supportedCities)&&const DeepCollectionEquality().equals(other.supportedPincodes, supportedPincodes)&&const DeepCollectionEquality().equals(other.supportedSocieties, supportedSocieties)&&(identical(other.minOrderValue, minOrderValue) || other.minOrderValue == minOrderValue)&&(identical(other.freeDeliveryThreshold, freeDeliveryThreshold) || other.freeDeliveryThreshold == freeDeliveryThreshold)&&(identical(other.defaultDeliveryFee, defaultDeliveryFee) || other.defaultDeliveryFee == defaultDeliveryFee)&&(identical(other.enableCod, enableCod) || other.enableCod == enableCod)&&(identical(other.enableOnlinePayment, enableOnlinePayment) || other.enableOnlinePayment == enableOnlinePayment)&&(identical(other.enableSubscriptions, enableSubscriptions) || other.enableSubscriptions == enableSubscriptions)&&(identical(other.enableReferrals, enableReferrals) || other.enableReferrals == enableReferrals)&&(identical(other.enableSpinWheel, enableSpinWheel) || other.enableSpinWheel == enableSpinWheel)&&(identical(other.supportPhone, supportPhone) || other.supportPhone == supportPhone)&&(identical(other.supportEmail, supportEmail) || other.supportEmail == supportEmail)&&(identical(other.supportWhatsapp, supportWhatsapp) || other.supportWhatsapp == supportWhatsapp));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hashAll([runtimeType,appName,appTagline,logoUrl,primaryColor,primaryDarkColor,secondaryColor,accentColor,backgroundColor,surfaceColor,errorColor,successColor,fontFamily,headingFontSize,bodyFontSize,captionFontSize,const DeepCollectionEquality().hash(supportedCountries),const DeepCollectionEquality().hash(supportedStates),const DeepCollectionEquality().hash(supportedCities),const DeepCollectionEquality().hash(supportedPincodes),const DeepCollectionEquality().hash(supportedSocieties),minOrderValue,freeDeliveryThreshold,defaultDeliveryFee,enableCod,enableOnlinePayment,enableSubscriptions,enableReferrals,enableSpinWheel,supportPhone,supportEmail,supportWhatsapp]);

@override
String toString() {
  return 'AppConfigModel(appName: $appName, appTagline: $appTagline, logoUrl: $logoUrl, primaryColor: $primaryColor, primaryDarkColor: $primaryDarkColor, secondaryColor: $secondaryColor, accentColor: $accentColor, backgroundColor: $backgroundColor, surfaceColor: $surfaceColor, errorColor: $errorColor, successColor: $successColor, fontFamily: $fontFamily, headingFontSize: $headingFontSize, bodyFontSize: $bodyFontSize, captionFontSize: $captionFontSize, supportedCountries: $supportedCountries, supportedStates: $supportedStates, supportedCities: $supportedCities, supportedPincodes: $supportedPincodes, supportedSocieties: $supportedSocieties, minOrderValue: $minOrderValue, freeDeliveryThreshold: $freeDeliveryThreshold, defaultDeliveryFee: $defaultDeliveryFee, enableCod: $enableCod, enableOnlinePayment: $enableOnlinePayment, enableSubscriptions: $enableSubscriptions, enableReferrals: $enableReferrals, enableSpinWheel: $enableSpinWheel, supportPhone: $supportPhone, supportEmail: $supportEmail, supportWhatsapp: $supportWhatsapp)';
}


}

/// @nodoc
abstract mixin class $AppConfigModelCopyWith<$Res>  {
  factory $AppConfigModelCopyWith(AppConfigModel value, $Res Function(AppConfigModel) _then) = _$AppConfigModelCopyWithImpl;
@useResult
$Res call({
@JsonKey(name: 'app_name') String appName,@JsonKey(name: 'app_tagline') String appTagline,@JsonKey(name: 'logo_url') String? logoUrl,@JsonKey(name: 'primary_color') String primaryColor,@JsonKey(name: 'primary_dark_color') String primaryDarkColor,@JsonKey(name: 'secondary_color') String secondaryColor,@JsonKey(name: 'accent_color') String accentColor,@JsonKey(name: 'background_color') String backgroundColor,@JsonKey(name: 'surface_color') String surfaceColor,@JsonKey(name: 'error_color') String errorColor,@JsonKey(name: 'success_color') String successColor,@JsonKey(name: 'font_family') String fontFamily,@JsonKey(name: 'heading_font_size') int headingFontSize,@JsonKey(name: 'body_font_size') int bodyFontSize,@JsonKey(name: 'caption_font_size') int captionFontSize,@JsonKey(name: 'supported_countries') List<String> supportedCountries,@JsonKey(name: 'supported_states') List<String> supportedStates,@JsonKey(name: 'supported_cities') List<String> supportedCities,@JsonKey(name: 'supported_pincodes') List<String> supportedPincodes,@JsonKey(name: 'supported_societies') List<String> supportedSocieties,@JsonKey(name: 'min_order_value') double minOrderValue,@JsonKey(name: 'free_delivery_threshold') double freeDeliveryThreshold,@JsonKey(name: 'default_delivery_fee') double defaultDeliveryFee,@JsonKey(name: 'enable_cod') bool enableCod,@JsonKey(name: 'enable_online_payment') bool enableOnlinePayment,@JsonKey(name: 'enable_subscriptions') bool enableSubscriptions,@JsonKey(name: 'enable_referrals') bool enableReferrals,@JsonKey(name: 'enable_spin_wheel') bool enableSpinWheel,@JsonKey(name: 'support_phone') String? supportPhone,@JsonKey(name: 'support_email') String? supportEmail,@JsonKey(name: 'support_whatsapp') String? supportWhatsapp
});




}
/// @nodoc
class _$AppConfigModelCopyWithImpl<$Res>
    implements $AppConfigModelCopyWith<$Res> {
  _$AppConfigModelCopyWithImpl(this._self, this._then);

  final AppConfigModel _self;
  final $Res Function(AppConfigModel) _then;

/// Create a copy of AppConfigModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? appName = null,Object? appTagline = null,Object? logoUrl = freezed,Object? primaryColor = null,Object? primaryDarkColor = null,Object? secondaryColor = null,Object? accentColor = null,Object? backgroundColor = null,Object? surfaceColor = null,Object? errorColor = null,Object? successColor = null,Object? fontFamily = null,Object? headingFontSize = null,Object? bodyFontSize = null,Object? captionFontSize = null,Object? supportedCountries = null,Object? supportedStates = null,Object? supportedCities = null,Object? supportedPincodes = null,Object? supportedSocieties = null,Object? minOrderValue = null,Object? freeDeliveryThreshold = null,Object? defaultDeliveryFee = null,Object? enableCod = null,Object? enableOnlinePayment = null,Object? enableSubscriptions = null,Object? enableReferrals = null,Object? enableSpinWheel = null,Object? supportPhone = freezed,Object? supportEmail = freezed,Object? supportWhatsapp = freezed,}) {
  return _then(_self.copyWith(
appName: null == appName ? _self.appName : appName // ignore: cast_nullable_to_non_nullable
as String,appTagline: null == appTagline ? _self.appTagline : appTagline // ignore: cast_nullable_to_non_nullable
as String,logoUrl: freezed == logoUrl ? _self.logoUrl : logoUrl // ignore: cast_nullable_to_non_nullable
as String?,primaryColor: null == primaryColor ? _self.primaryColor : primaryColor // ignore: cast_nullable_to_non_nullable
as String,primaryDarkColor: null == primaryDarkColor ? _self.primaryDarkColor : primaryDarkColor // ignore: cast_nullable_to_non_nullable
as String,secondaryColor: null == secondaryColor ? _self.secondaryColor : secondaryColor // ignore: cast_nullable_to_non_nullable
as String,accentColor: null == accentColor ? _self.accentColor : accentColor // ignore: cast_nullable_to_non_nullable
as String,backgroundColor: null == backgroundColor ? _self.backgroundColor : backgroundColor // ignore: cast_nullable_to_non_nullable
as String,surfaceColor: null == surfaceColor ? _self.surfaceColor : surfaceColor // ignore: cast_nullable_to_non_nullable
as String,errorColor: null == errorColor ? _self.errorColor : errorColor // ignore: cast_nullable_to_non_nullable
as String,successColor: null == successColor ? _self.successColor : successColor // ignore: cast_nullable_to_non_nullable
as String,fontFamily: null == fontFamily ? _self.fontFamily : fontFamily // ignore: cast_nullable_to_non_nullable
as String,headingFontSize: null == headingFontSize ? _self.headingFontSize : headingFontSize // ignore: cast_nullable_to_non_nullable
as int,bodyFontSize: null == bodyFontSize ? _self.bodyFontSize : bodyFontSize // ignore: cast_nullable_to_non_nullable
as int,captionFontSize: null == captionFontSize ? _self.captionFontSize : captionFontSize // ignore: cast_nullable_to_non_nullable
as int,supportedCountries: null == supportedCountries ? _self.supportedCountries : supportedCountries // ignore: cast_nullable_to_non_nullable
as List<String>,supportedStates: null == supportedStates ? _self.supportedStates : supportedStates // ignore: cast_nullable_to_non_nullable
as List<String>,supportedCities: null == supportedCities ? _self.supportedCities : supportedCities // ignore: cast_nullable_to_non_nullable
as List<String>,supportedPincodes: null == supportedPincodes ? _self.supportedPincodes : supportedPincodes // ignore: cast_nullable_to_non_nullable
as List<String>,supportedSocieties: null == supportedSocieties ? _self.supportedSocieties : supportedSocieties // ignore: cast_nullable_to_non_nullable
as List<String>,minOrderValue: null == minOrderValue ? _self.minOrderValue : minOrderValue // ignore: cast_nullable_to_non_nullable
as double,freeDeliveryThreshold: null == freeDeliveryThreshold ? _self.freeDeliveryThreshold : freeDeliveryThreshold // ignore: cast_nullable_to_non_nullable
as double,defaultDeliveryFee: null == defaultDeliveryFee ? _self.defaultDeliveryFee : defaultDeliveryFee // ignore: cast_nullable_to_non_nullable
as double,enableCod: null == enableCod ? _self.enableCod : enableCod // ignore: cast_nullable_to_non_nullable
as bool,enableOnlinePayment: null == enableOnlinePayment ? _self.enableOnlinePayment : enableOnlinePayment // ignore: cast_nullable_to_non_nullable
as bool,enableSubscriptions: null == enableSubscriptions ? _self.enableSubscriptions : enableSubscriptions // ignore: cast_nullable_to_non_nullable
as bool,enableReferrals: null == enableReferrals ? _self.enableReferrals : enableReferrals // ignore: cast_nullable_to_non_nullable
as bool,enableSpinWheel: null == enableSpinWheel ? _self.enableSpinWheel : enableSpinWheel // ignore: cast_nullable_to_non_nullable
as bool,supportPhone: freezed == supportPhone ? _self.supportPhone : supportPhone // ignore: cast_nullable_to_non_nullable
as String?,supportEmail: freezed == supportEmail ? _self.supportEmail : supportEmail // ignore: cast_nullable_to_non_nullable
as String?,supportWhatsapp: freezed == supportWhatsapp ? _self.supportWhatsapp : supportWhatsapp // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [AppConfigModel].
extension AppConfigModelPatterns on AppConfigModel {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _AppConfigModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _AppConfigModel() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _AppConfigModel value)  $default,){
final _that = this;
switch (_that) {
case _AppConfigModel():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _AppConfigModel value)?  $default,){
final _that = this;
switch (_that) {
case _AppConfigModel() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(name: 'app_name')  String appName, @JsonKey(name: 'app_tagline')  String appTagline, @JsonKey(name: 'logo_url')  String? logoUrl, @JsonKey(name: 'primary_color')  String primaryColor, @JsonKey(name: 'primary_dark_color')  String primaryDarkColor, @JsonKey(name: 'secondary_color')  String secondaryColor, @JsonKey(name: 'accent_color')  String accentColor, @JsonKey(name: 'background_color')  String backgroundColor, @JsonKey(name: 'surface_color')  String surfaceColor, @JsonKey(name: 'error_color')  String errorColor, @JsonKey(name: 'success_color')  String successColor, @JsonKey(name: 'font_family')  String fontFamily, @JsonKey(name: 'heading_font_size')  int headingFontSize, @JsonKey(name: 'body_font_size')  int bodyFontSize, @JsonKey(name: 'caption_font_size')  int captionFontSize, @JsonKey(name: 'supported_countries')  List<String> supportedCountries, @JsonKey(name: 'supported_states')  List<String> supportedStates, @JsonKey(name: 'supported_cities')  List<String> supportedCities, @JsonKey(name: 'supported_pincodes')  List<String> supportedPincodes, @JsonKey(name: 'supported_societies')  List<String> supportedSocieties, @JsonKey(name: 'min_order_value')  double minOrderValue, @JsonKey(name: 'free_delivery_threshold')  double freeDeliveryThreshold, @JsonKey(name: 'default_delivery_fee')  double defaultDeliveryFee, @JsonKey(name: 'enable_cod')  bool enableCod, @JsonKey(name: 'enable_online_payment')  bool enableOnlinePayment, @JsonKey(name: 'enable_subscriptions')  bool enableSubscriptions, @JsonKey(name: 'enable_referrals')  bool enableReferrals, @JsonKey(name: 'enable_spin_wheel')  bool enableSpinWheel, @JsonKey(name: 'support_phone')  String? supportPhone, @JsonKey(name: 'support_email')  String? supportEmail, @JsonKey(name: 'support_whatsapp')  String? supportWhatsapp)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _AppConfigModel() when $default != null:
return $default(_that.appName,_that.appTagline,_that.logoUrl,_that.primaryColor,_that.primaryDarkColor,_that.secondaryColor,_that.accentColor,_that.backgroundColor,_that.surfaceColor,_that.errorColor,_that.successColor,_that.fontFamily,_that.headingFontSize,_that.bodyFontSize,_that.captionFontSize,_that.supportedCountries,_that.supportedStates,_that.supportedCities,_that.supportedPincodes,_that.supportedSocieties,_that.minOrderValue,_that.freeDeliveryThreshold,_that.defaultDeliveryFee,_that.enableCod,_that.enableOnlinePayment,_that.enableSubscriptions,_that.enableReferrals,_that.enableSpinWheel,_that.supportPhone,_that.supportEmail,_that.supportWhatsapp);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(name: 'app_name')  String appName, @JsonKey(name: 'app_tagline')  String appTagline, @JsonKey(name: 'logo_url')  String? logoUrl, @JsonKey(name: 'primary_color')  String primaryColor, @JsonKey(name: 'primary_dark_color')  String primaryDarkColor, @JsonKey(name: 'secondary_color')  String secondaryColor, @JsonKey(name: 'accent_color')  String accentColor, @JsonKey(name: 'background_color')  String backgroundColor, @JsonKey(name: 'surface_color')  String surfaceColor, @JsonKey(name: 'error_color')  String errorColor, @JsonKey(name: 'success_color')  String successColor, @JsonKey(name: 'font_family')  String fontFamily, @JsonKey(name: 'heading_font_size')  int headingFontSize, @JsonKey(name: 'body_font_size')  int bodyFontSize, @JsonKey(name: 'caption_font_size')  int captionFontSize, @JsonKey(name: 'supported_countries')  List<String> supportedCountries, @JsonKey(name: 'supported_states')  List<String> supportedStates, @JsonKey(name: 'supported_cities')  List<String> supportedCities, @JsonKey(name: 'supported_pincodes')  List<String> supportedPincodes, @JsonKey(name: 'supported_societies')  List<String> supportedSocieties, @JsonKey(name: 'min_order_value')  double minOrderValue, @JsonKey(name: 'free_delivery_threshold')  double freeDeliveryThreshold, @JsonKey(name: 'default_delivery_fee')  double defaultDeliveryFee, @JsonKey(name: 'enable_cod')  bool enableCod, @JsonKey(name: 'enable_online_payment')  bool enableOnlinePayment, @JsonKey(name: 'enable_subscriptions')  bool enableSubscriptions, @JsonKey(name: 'enable_referrals')  bool enableReferrals, @JsonKey(name: 'enable_spin_wheel')  bool enableSpinWheel, @JsonKey(name: 'support_phone')  String? supportPhone, @JsonKey(name: 'support_email')  String? supportEmail, @JsonKey(name: 'support_whatsapp')  String? supportWhatsapp)  $default,) {final _that = this;
switch (_that) {
case _AppConfigModel():
return $default(_that.appName,_that.appTagline,_that.logoUrl,_that.primaryColor,_that.primaryDarkColor,_that.secondaryColor,_that.accentColor,_that.backgroundColor,_that.surfaceColor,_that.errorColor,_that.successColor,_that.fontFamily,_that.headingFontSize,_that.bodyFontSize,_that.captionFontSize,_that.supportedCountries,_that.supportedStates,_that.supportedCities,_that.supportedPincodes,_that.supportedSocieties,_that.minOrderValue,_that.freeDeliveryThreshold,_that.defaultDeliveryFee,_that.enableCod,_that.enableOnlinePayment,_that.enableSubscriptions,_that.enableReferrals,_that.enableSpinWheel,_that.supportPhone,_that.supportEmail,_that.supportWhatsapp);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(name: 'app_name')  String appName, @JsonKey(name: 'app_tagline')  String appTagline, @JsonKey(name: 'logo_url')  String? logoUrl, @JsonKey(name: 'primary_color')  String primaryColor, @JsonKey(name: 'primary_dark_color')  String primaryDarkColor, @JsonKey(name: 'secondary_color')  String secondaryColor, @JsonKey(name: 'accent_color')  String accentColor, @JsonKey(name: 'background_color')  String backgroundColor, @JsonKey(name: 'surface_color')  String surfaceColor, @JsonKey(name: 'error_color')  String errorColor, @JsonKey(name: 'success_color')  String successColor, @JsonKey(name: 'font_family')  String fontFamily, @JsonKey(name: 'heading_font_size')  int headingFontSize, @JsonKey(name: 'body_font_size')  int bodyFontSize, @JsonKey(name: 'caption_font_size')  int captionFontSize, @JsonKey(name: 'supported_countries')  List<String> supportedCountries, @JsonKey(name: 'supported_states')  List<String> supportedStates, @JsonKey(name: 'supported_cities')  List<String> supportedCities, @JsonKey(name: 'supported_pincodes')  List<String> supportedPincodes, @JsonKey(name: 'supported_societies')  List<String> supportedSocieties, @JsonKey(name: 'min_order_value')  double minOrderValue, @JsonKey(name: 'free_delivery_threshold')  double freeDeliveryThreshold, @JsonKey(name: 'default_delivery_fee')  double defaultDeliveryFee, @JsonKey(name: 'enable_cod')  bool enableCod, @JsonKey(name: 'enable_online_payment')  bool enableOnlinePayment, @JsonKey(name: 'enable_subscriptions')  bool enableSubscriptions, @JsonKey(name: 'enable_referrals')  bool enableReferrals, @JsonKey(name: 'enable_spin_wheel')  bool enableSpinWheel, @JsonKey(name: 'support_phone')  String? supportPhone, @JsonKey(name: 'support_email')  String? supportEmail, @JsonKey(name: 'support_whatsapp')  String? supportWhatsapp)?  $default,) {final _that = this;
switch (_that) {
case _AppConfigModel() when $default != null:
return $default(_that.appName,_that.appTagline,_that.logoUrl,_that.primaryColor,_that.primaryDarkColor,_that.secondaryColor,_that.accentColor,_that.backgroundColor,_that.surfaceColor,_that.errorColor,_that.successColor,_that.fontFamily,_that.headingFontSize,_that.bodyFontSize,_that.captionFontSize,_that.supportedCountries,_that.supportedStates,_that.supportedCities,_that.supportedPincodes,_that.supportedSocieties,_that.minOrderValue,_that.freeDeliveryThreshold,_that.defaultDeliveryFee,_that.enableCod,_that.enableOnlinePayment,_that.enableSubscriptions,_that.enableReferrals,_that.enableSpinWheel,_that.supportPhone,_that.supportEmail,_that.supportWhatsapp);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _AppConfigModel extends AppConfigModel {
  const _AppConfigModel({@JsonKey(name: 'app_name') this.appName = 'Khurpi Fresh', @JsonKey(name: 'app_tagline') this.appTagline = 'Fresh from Farm to Table', @JsonKey(name: 'logo_url') this.logoUrl, @JsonKey(name: 'primary_color') this.primaryColor = '#4CAF50', @JsonKey(name: 'primary_dark_color') this.primaryDarkColor = '#388E3C', @JsonKey(name: 'secondary_color') this.secondaryColor = '#FFC107', @JsonKey(name: 'accent_color') this.accentColor = '#FF5722', @JsonKey(name: 'background_color') this.backgroundColor = '#F5F5F5', @JsonKey(name: 'surface_color') this.surfaceColor = '#FFFFFF', @JsonKey(name: 'error_color') this.errorColor = '#F44336', @JsonKey(name: 'success_color') this.successColor = '#4CAF50', @JsonKey(name: 'font_family') this.fontFamily = 'Poppins', @JsonKey(name: 'heading_font_size') this.headingFontSize = 24, @JsonKey(name: 'body_font_size') this.bodyFontSize = 14, @JsonKey(name: 'caption_font_size') this.captionFontSize = 12, @JsonKey(name: 'supported_countries') final  List<String> supportedCountries = const [], @JsonKey(name: 'supported_states') final  List<String> supportedStates = const [], @JsonKey(name: 'supported_cities') final  List<String> supportedCities = const [], @JsonKey(name: 'supported_pincodes') final  List<String> supportedPincodes = const [], @JsonKey(name: 'supported_societies') final  List<String> supportedSocieties = const [], @JsonKey(name: 'min_order_value') this.minOrderValue = 100, @JsonKey(name: 'free_delivery_threshold') this.freeDeliveryThreshold = 500, @JsonKey(name: 'default_delivery_fee') this.defaultDeliveryFee = 40, @JsonKey(name: 'enable_cod') this.enableCod = true, @JsonKey(name: 'enable_online_payment') this.enableOnlinePayment = true, @JsonKey(name: 'enable_subscriptions') this.enableSubscriptions = true, @JsonKey(name: 'enable_referrals') this.enableReferrals = true, @JsonKey(name: 'enable_spin_wheel') this.enableSpinWheel = true, @JsonKey(name: 'support_phone') this.supportPhone, @JsonKey(name: 'support_email') this.supportEmail, @JsonKey(name: 'support_whatsapp') this.supportWhatsapp}): _supportedCountries = supportedCountries,_supportedStates = supportedStates,_supportedCities = supportedCities,_supportedPincodes = supportedPincodes,_supportedSocieties = supportedSocieties,super._();
  factory _AppConfigModel.fromJson(Map<String, dynamic> json) => _$AppConfigModelFromJson(json);

// Branding
@override@JsonKey(name: 'app_name') final  String appName;
@override@JsonKey(name: 'app_tagline') final  String appTagline;
@override@JsonKey(name: 'logo_url') final  String? logoUrl;
// Colors
@override@JsonKey(name: 'primary_color') final  String primaryColor;
@override@JsonKey(name: 'primary_dark_color') final  String primaryDarkColor;
@override@JsonKey(name: 'secondary_color') final  String secondaryColor;
@override@JsonKey(name: 'accent_color') final  String accentColor;
@override@JsonKey(name: 'background_color') final  String backgroundColor;
@override@JsonKey(name: 'surface_color') final  String surfaceColor;
@override@JsonKey(name: 'error_color') final  String errorColor;
@override@JsonKey(name: 'success_color') final  String successColor;
// Typography
@override@JsonKey(name: 'font_family') final  String fontFamily;
@override@JsonKey(name: 'heading_font_size') final  int headingFontSize;
@override@JsonKey(name: 'body_font_size') final  int bodyFontSize;
@override@JsonKey(name: 'caption_font_size') final  int captionFontSize;
// Service Areas
 final  List<String> _supportedCountries;
// Service Areas
@override@JsonKey(name: 'supported_countries') List<String> get supportedCountries {
  if (_supportedCountries is EqualUnmodifiableListView) return _supportedCountries;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_supportedCountries);
}

 final  List<String> _supportedStates;
@override@JsonKey(name: 'supported_states') List<String> get supportedStates {
  if (_supportedStates is EqualUnmodifiableListView) return _supportedStates;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_supportedStates);
}

 final  List<String> _supportedCities;
@override@JsonKey(name: 'supported_cities') List<String> get supportedCities {
  if (_supportedCities is EqualUnmodifiableListView) return _supportedCities;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_supportedCities);
}

 final  List<String> _supportedPincodes;
@override@JsonKey(name: 'supported_pincodes') List<String> get supportedPincodes {
  if (_supportedPincodes is EqualUnmodifiableListView) return _supportedPincodes;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_supportedPincodes);
}

 final  List<String> _supportedSocieties;
@override@JsonKey(name: 'supported_societies') List<String> get supportedSocieties {
  if (_supportedSocieties is EqualUnmodifiableListView) return _supportedSocieties;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_supportedSocieties);
}

// Delivery Settings
@override@JsonKey(name: 'min_order_value') final  double minOrderValue;
@override@JsonKey(name: 'free_delivery_threshold') final  double freeDeliveryThreshold;
@override@JsonKey(name: 'default_delivery_fee') final  double defaultDeliveryFee;
// Feature Flags
@override@JsonKey(name: 'enable_cod') final  bool enableCod;
@override@JsonKey(name: 'enable_online_payment') final  bool enableOnlinePayment;
@override@JsonKey(name: 'enable_subscriptions') final  bool enableSubscriptions;
@override@JsonKey(name: 'enable_referrals') final  bool enableReferrals;
@override@JsonKey(name: 'enable_spin_wheel') final  bool enableSpinWheel;
// Contact
@override@JsonKey(name: 'support_phone') final  String? supportPhone;
@override@JsonKey(name: 'support_email') final  String? supportEmail;
@override@JsonKey(name: 'support_whatsapp') final  String? supportWhatsapp;

/// Create a copy of AppConfigModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$AppConfigModelCopyWith<_AppConfigModel> get copyWith => __$AppConfigModelCopyWithImpl<_AppConfigModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$AppConfigModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _AppConfigModel&&(identical(other.appName, appName) || other.appName == appName)&&(identical(other.appTagline, appTagline) || other.appTagline == appTagline)&&(identical(other.logoUrl, logoUrl) || other.logoUrl == logoUrl)&&(identical(other.primaryColor, primaryColor) || other.primaryColor == primaryColor)&&(identical(other.primaryDarkColor, primaryDarkColor) || other.primaryDarkColor == primaryDarkColor)&&(identical(other.secondaryColor, secondaryColor) || other.secondaryColor == secondaryColor)&&(identical(other.accentColor, accentColor) || other.accentColor == accentColor)&&(identical(other.backgroundColor, backgroundColor) || other.backgroundColor == backgroundColor)&&(identical(other.surfaceColor, surfaceColor) || other.surfaceColor == surfaceColor)&&(identical(other.errorColor, errorColor) || other.errorColor == errorColor)&&(identical(other.successColor, successColor) || other.successColor == successColor)&&(identical(other.fontFamily, fontFamily) || other.fontFamily == fontFamily)&&(identical(other.headingFontSize, headingFontSize) || other.headingFontSize == headingFontSize)&&(identical(other.bodyFontSize, bodyFontSize) || other.bodyFontSize == bodyFontSize)&&(identical(other.captionFontSize, captionFontSize) || other.captionFontSize == captionFontSize)&&const DeepCollectionEquality().equals(other._supportedCountries, _supportedCountries)&&const DeepCollectionEquality().equals(other._supportedStates, _supportedStates)&&const DeepCollectionEquality().equals(other._supportedCities, _supportedCities)&&const DeepCollectionEquality().equals(other._supportedPincodes, _supportedPincodes)&&const DeepCollectionEquality().equals(other._supportedSocieties, _supportedSocieties)&&(identical(other.minOrderValue, minOrderValue) || other.minOrderValue == minOrderValue)&&(identical(other.freeDeliveryThreshold, freeDeliveryThreshold) || other.freeDeliveryThreshold == freeDeliveryThreshold)&&(identical(other.defaultDeliveryFee, defaultDeliveryFee) || other.defaultDeliveryFee == defaultDeliveryFee)&&(identical(other.enableCod, enableCod) || other.enableCod == enableCod)&&(identical(other.enableOnlinePayment, enableOnlinePayment) || other.enableOnlinePayment == enableOnlinePayment)&&(identical(other.enableSubscriptions, enableSubscriptions) || other.enableSubscriptions == enableSubscriptions)&&(identical(other.enableReferrals, enableReferrals) || other.enableReferrals == enableReferrals)&&(identical(other.enableSpinWheel, enableSpinWheel) || other.enableSpinWheel == enableSpinWheel)&&(identical(other.supportPhone, supportPhone) || other.supportPhone == supportPhone)&&(identical(other.supportEmail, supportEmail) || other.supportEmail == supportEmail)&&(identical(other.supportWhatsapp, supportWhatsapp) || other.supportWhatsapp == supportWhatsapp));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hashAll([runtimeType,appName,appTagline,logoUrl,primaryColor,primaryDarkColor,secondaryColor,accentColor,backgroundColor,surfaceColor,errorColor,successColor,fontFamily,headingFontSize,bodyFontSize,captionFontSize,const DeepCollectionEquality().hash(_supportedCountries),const DeepCollectionEquality().hash(_supportedStates),const DeepCollectionEquality().hash(_supportedCities),const DeepCollectionEquality().hash(_supportedPincodes),const DeepCollectionEquality().hash(_supportedSocieties),minOrderValue,freeDeliveryThreshold,defaultDeliveryFee,enableCod,enableOnlinePayment,enableSubscriptions,enableReferrals,enableSpinWheel,supportPhone,supportEmail,supportWhatsapp]);

@override
String toString() {
  return 'AppConfigModel(appName: $appName, appTagline: $appTagline, logoUrl: $logoUrl, primaryColor: $primaryColor, primaryDarkColor: $primaryDarkColor, secondaryColor: $secondaryColor, accentColor: $accentColor, backgroundColor: $backgroundColor, surfaceColor: $surfaceColor, errorColor: $errorColor, successColor: $successColor, fontFamily: $fontFamily, headingFontSize: $headingFontSize, bodyFontSize: $bodyFontSize, captionFontSize: $captionFontSize, supportedCountries: $supportedCountries, supportedStates: $supportedStates, supportedCities: $supportedCities, supportedPincodes: $supportedPincodes, supportedSocieties: $supportedSocieties, minOrderValue: $minOrderValue, freeDeliveryThreshold: $freeDeliveryThreshold, defaultDeliveryFee: $defaultDeliveryFee, enableCod: $enableCod, enableOnlinePayment: $enableOnlinePayment, enableSubscriptions: $enableSubscriptions, enableReferrals: $enableReferrals, enableSpinWheel: $enableSpinWheel, supportPhone: $supportPhone, supportEmail: $supportEmail, supportWhatsapp: $supportWhatsapp)';
}


}

/// @nodoc
abstract mixin class _$AppConfigModelCopyWith<$Res> implements $AppConfigModelCopyWith<$Res> {
  factory _$AppConfigModelCopyWith(_AppConfigModel value, $Res Function(_AppConfigModel) _then) = __$AppConfigModelCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(name: 'app_name') String appName,@JsonKey(name: 'app_tagline') String appTagline,@JsonKey(name: 'logo_url') String? logoUrl,@JsonKey(name: 'primary_color') String primaryColor,@JsonKey(name: 'primary_dark_color') String primaryDarkColor,@JsonKey(name: 'secondary_color') String secondaryColor,@JsonKey(name: 'accent_color') String accentColor,@JsonKey(name: 'background_color') String backgroundColor,@JsonKey(name: 'surface_color') String surfaceColor,@JsonKey(name: 'error_color') String errorColor,@JsonKey(name: 'success_color') String successColor,@JsonKey(name: 'font_family') String fontFamily,@JsonKey(name: 'heading_font_size') int headingFontSize,@JsonKey(name: 'body_font_size') int bodyFontSize,@JsonKey(name: 'caption_font_size') int captionFontSize,@JsonKey(name: 'supported_countries') List<String> supportedCountries,@JsonKey(name: 'supported_states') List<String> supportedStates,@JsonKey(name: 'supported_cities') List<String> supportedCities,@JsonKey(name: 'supported_pincodes') List<String> supportedPincodes,@JsonKey(name: 'supported_societies') List<String> supportedSocieties,@JsonKey(name: 'min_order_value') double minOrderValue,@JsonKey(name: 'free_delivery_threshold') double freeDeliveryThreshold,@JsonKey(name: 'default_delivery_fee') double defaultDeliveryFee,@JsonKey(name: 'enable_cod') bool enableCod,@JsonKey(name: 'enable_online_payment') bool enableOnlinePayment,@JsonKey(name: 'enable_subscriptions') bool enableSubscriptions,@JsonKey(name: 'enable_referrals') bool enableReferrals,@JsonKey(name: 'enable_spin_wheel') bool enableSpinWheel,@JsonKey(name: 'support_phone') String? supportPhone,@JsonKey(name: 'support_email') String? supportEmail,@JsonKey(name: 'support_whatsapp') String? supportWhatsapp
});




}
/// @nodoc
class __$AppConfigModelCopyWithImpl<$Res>
    implements _$AppConfigModelCopyWith<$Res> {
  __$AppConfigModelCopyWithImpl(this._self, this._then);

  final _AppConfigModel _self;
  final $Res Function(_AppConfigModel) _then;

/// Create a copy of AppConfigModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? appName = null,Object? appTagline = null,Object? logoUrl = freezed,Object? primaryColor = null,Object? primaryDarkColor = null,Object? secondaryColor = null,Object? accentColor = null,Object? backgroundColor = null,Object? surfaceColor = null,Object? errorColor = null,Object? successColor = null,Object? fontFamily = null,Object? headingFontSize = null,Object? bodyFontSize = null,Object? captionFontSize = null,Object? supportedCountries = null,Object? supportedStates = null,Object? supportedCities = null,Object? supportedPincodes = null,Object? supportedSocieties = null,Object? minOrderValue = null,Object? freeDeliveryThreshold = null,Object? defaultDeliveryFee = null,Object? enableCod = null,Object? enableOnlinePayment = null,Object? enableSubscriptions = null,Object? enableReferrals = null,Object? enableSpinWheel = null,Object? supportPhone = freezed,Object? supportEmail = freezed,Object? supportWhatsapp = freezed,}) {
  return _then(_AppConfigModel(
appName: null == appName ? _self.appName : appName // ignore: cast_nullable_to_non_nullable
as String,appTagline: null == appTagline ? _self.appTagline : appTagline // ignore: cast_nullable_to_non_nullable
as String,logoUrl: freezed == logoUrl ? _self.logoUrl : logoUrl // ignore: cast_nullable_to_non_nullable
as String?,primaryColor: null == primaryColor ? _self.primaryColor : primaryColor // ignore: cast_nullable_to_non_nullable
as String,primaryDarkColor: null == primaryDarkColor ? _self.primaryDarkColor : primaryDarkColor // ignore: cast_nullable_to_non_nullable
as String,secondaryColor: null == secondaryColor ? _self.secondaryColor : secondaryColor // ignore: cast_nullable_to_non_nullable
as String,accentColor: null == accentColor ? _self.accentColor : accentColor // ignore: cast_nullable_to_non_nullable
as String,backgroundColor: null == backgroundColor ? _self.backgroundColor : backgroundColor // ignore: cast_nullable_to_non_nullable
as String,surfaceColor: null == surfaceColor ? _self.surfaceColor : surfaceColor // ignore: cast_nullable_to_non_nullable
as String,errorColor: null == errorColor ? _self.errorColor : errorColor // ignore: cast_nullable_to_non_nullable
as String,successColor: null == successColor ? _self.successColor : successColor // ignore: cast_nullable_to_non_nullable
as String,fontFamily: null == fontFamily ? _self.fontFamily : fontFamily // ignore: cast_nullable_to_non_nullable
as String,headingFontSize: null == headingFontSize ? _self.headingFontSize : headingFontSize // ignore: cast_nullable_to_non_nullable
as int,bodyFontSize: null == bodyFontSize ? _self.bodyFontSize : bodyFontSize // ignore: cast_nullable_to_non_nullable
as int,captionFontSize: null == captionFontSize ? _self.captionFontSize : captionFontSize // ignore: cast_nullable_to_non_nullable
as int,supportedCountries: null == supportedCountries ? _self._supportedCountries : supportedCountries // ignore: cast_nullable_to_non_nullable
as List<String>,supportedStates: null == supportedStates ? _self._supportedStates : supportedStates // ignore: cast_nullable_to_non_nullable
as List<String>,supportedCities: null == supportedCities ? _self._supportedCities : supportedCities // ignore: cast_nullable_to_non_nullable
as List<String>,supportedPincodes: null == supportedPincodes ? _self._supportedPincodes : supportedPincodes // ignore: cast_nullable_to_non_nullable
as List<String>,supportedSocieties: null == supportedSocieties ? _self._supportedSocieties : supportedSocieties // ignore: cast_nullable_to_non_nullable
as List<String>,minOrderValue: null == minOrderValue ? _self.minOrderValue : minOrderValue // ignore: cast_nullable_to_non_nullable
as double,freeDeliveryThreshold: null == freeDeliveryThreshold ? _self.freeDeliveryThreshold : freeDeliveryThreshold // ignore: cast_nullable_to_non_nullable
as double,defaultDeliveryFee: null == defaultDeliveryFee ? _self.defaultDeliveryFee : defaultDeliveryFee // ignore: cast_nullable_to_non_nullable
as double,enableCod: null == enableCod ? _self.enableCod : enableCod // ignore: cast_nullable_to_non_nullable
as bool,enableOnlinePayment: null == enableOnlinePayment ? _self.enableOnlinePayment : enableOnlinePayment // ignore: cast_nullable_to_non_nullable
as bool,enableSubscriptions: null == enableSubscriptions ? _self.enableSubscriptions : enableSubscriptions // ignore: cast_nullable_to_non_nullable
as bool,enableReferrals: null == enableReferrals ? _self.enableReferrals : enableReferrals // ignore: cast_nullable_to_non_nullable
as bool,enableSpinWheel: null == enableSpinWheel ? _self.enableSpinWheel : enableSpinWheel // ignore: cast_nullable_to_non_nullable
as bool,supportPhone: freezed == supportPhone ? _self.supportPhone : supportPhone // ignore: cast_nullable_to_non_nullable
as String?,supportEmail: freezed == supportEmail ? _self.supportEmail : supportEmail // ignore: cast_nullable_to_non_nullable
as String?,supportWhatsapp: freezed == supportWhatsapp ? _self.supportWhatsapp : supportWhatsapp // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}

// dart format on
