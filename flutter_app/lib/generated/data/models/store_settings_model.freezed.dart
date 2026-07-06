// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of '../../../data/models/store_settings_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$StoreSettingsModel {

@JsonKey(name: 'store_name') String get storeName;@JsonKey(name: 'store_phone') String? get storePhone;@JsonKey(name: 'store_email') String? get storeEmail;@JsonKey(name: 'store_address') String? get storeAddress;@JsonKey(name: 'min_order_value') double get minOrderValue;@JsonKey(name: 'default_delivery_fee') double get defaultDeliveryFee;@JsonKey(name: 'min_order_for_free_delivery') double get minOrderForFreeDelivery;@JsonKey(name: 'instant_delivery_enabled') bool get instantDeliveryEnabled;@JsonKey(name: 'instant_delivery_fee') double get instantDeliveryFee;@JsonKey(name: 'instant_delivery_time_minutes') int get instantDeliveryTimeMinutes;@JsonKey(name: 'slotted_delivery_enabled') bool get slottedDeliveryEnabled;@JsonKey(name: 'store_latitude') double? get storeLatitude;@JsonKey(name: 'store_longitude') double? get storeLongitude;@JsonKey(name: 'delivery_radius_km') double get deliveryRadiusKm;
/// Create a copy of StoreSettingsModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$StoreSettingsModelCopyWith<StoreSettingsModel> get copyWith => _$StoreSettingsModelCopyWithImpl<StoreSettingsModel>(this as StoreSettingsModel, _$identity);

  /// Serializes this StoreSettingsModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is StoreSettingsModel&&(identical(other.storeName, storeName) || other.storeName == storeName)&&(identical(other.storePhone, storePhone) || other.storePhone == storePhone)&&(identical(other.storeEmail, storeEmail) || other.storeEmail == storeEmail)&&(identical(other.storeAddress, storeAddress) || other.storeAddress == storeAddress)&&(identical(other.minOrderValue, minOrderValue) || other.minOrderValue == minOrderValue)&&(identical(other.defaultDeliveryFee, defaultDeliveryFee) || other.defaultDeliveryFee == defaultDeliveryFee)&&(identical(other.minOrderForFreeDelivery, minOrderForFreeDelivery) || other.minOrderForFreeDelivery == minOrderForFreeDelivery)&&(identical(other.instantDeliveryEnabled, instantDeliveryEnabled) || other.instantDeliveryEnabled == instantDeliveryEnabled)&&(identical(other.instantDeliveryFee, instantDeliveryFee) || other.instantDeliveryFee == instantDeliveryFee)&&(identical(other.instantDeliveryTimeMinutes, instantDeliveryTimeMinutes) || other.instantDeliveryTimeMinutes == instantDeliveryTimeMinutes)&&(identical(other.slottedDeliveryEnabled, slottedDeliveryEnabled) || other.slottedDeliveryEnabled == slottedDeliveryEnabled)&&(identical(other.storeLatitude, storeLatitude) || other.storeLatitude == storeLatitude)&&(identical(other.storeLongitude, storeLongitude) || other.storeLongitude == storeLongitude)&&(identical(other.deliveryRadiusKm, deliveryRadiusKm) || other.deliveryRadiusKm == deliveryRadiusKm));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,storeName,storePhone,storeEmail,storeAddress,minOrderValue,defaultDeliveryFee,minOrderForFreeDelivery,instantDeliveryEnabled,instantDeliveryFee,instantDeliveryTimeMinutes,slottedDeliveryEnabled,storeLatitude,storeLongitude,deliveryRadiusKm);

@override
String toString() {
  return 'StoreSettingsModel(storeName: $storeName, storePhone: $storePhone, storeEmail: $storeEmail, storeAddress: $storeAddress, minOrderValue: $minOrderValue, defaultDeliveryFee: $defaultDeliveryFee, minOrderForFreeDelivery: $minOrderForFreeDelivery, instantDeliveryEnabled: $instantDeliveryEnabled, instantDeliveryFee: $instantDeliveryFee, instantDeliveryTimeMinutes: $instantDeliveryTimeMinutes, slottedDeliveryEnabled: $slottedDeliveryEnabled, storeLatitude: $storeLatitude, storeLongitude: $storeLongitude, deliveryRadiusKm: $deliveryRadiusKm)';
}


}

/// @nodoc
abstract mixin class $StoreSettingsModelCopyWith<$Res>  {
  factory $StoreSettingsModelCopyWith(StoreSettingsModel value, $Res Function(StoreSettingsModel) _then) = _$StoreSettingsModelCopyWithImpl;
@useResult
$Res call({
@JsonKey(name: 'store_name') String storeName,@JsonKey(name: 'store_phone') String? storePhone,@JsonKey(name: 'store_email') String? storeEmail,@JsonKey(name: 'store_address') String? storeAddress,@JsonKey(name: 'min_order_value') double minOrderValue,@JsonKey(name: 'default_delivery_fee') double defaultDeliveryFee,@JsonKey(name: 'min_order_for_free_delivery') double minOrderForFreeDelivery,@JsonKey(name: 'instant_delivery_enabled') bool instantDeliveryEnabled,@JsonKey(name: 'instant_delivery_fee') double instantDeliveryFee,@JsonKey(name: 'instant_delivery_time_minutes') int instantDeliveryTimeMinutes,@JsonKey(name: 'slotted_delivery_enabled') bool slottedDeliveryEnabled,@JsonKey(name: 'store_latitude') double? storeLatitude,@JsonKey(name: 'store_longitude') double? storeLongitude,@JsonKey(name: 'delivery_radius_km') double deliveryRadiusKm
});




}
/// @nodoc
class _$StoreSettingsModelCopyWithImpl<$Res>
    implements $StoreSettingsModelCopyWith<$Res> {
  _$StoreSettingsModelCopyWithImpl(this._self, this._then);

  final StoreSettingsModel _self;
  final $Res Function(StoreSettingsModel) _then;

/// Create a copy of StoreSettingsModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? storeName = null,Object? storePhone = freezed,Object? storeEmail = freezed,Object? storeAddress = freezed,Object? minOrderValue = null,Object? defaultDeliveryFee = null,Object? minOrderForFreeDelivery = null,Object? instantDeliveryEnabled = null,Object? instantDeliveryFee = null,Object? instantDeliveryTimeMinutes = null,Object? slottedDeliveryEnabled = null,Object? storeLatitude = freezed,Object? storeLongitude = freezed,Object? deliveryRadiusKm = null,}) {
  return _then(_self.copyWith(
storeName: null == storeName ? _self.storeName : storeName // ignore: cast_nullable_to_non_nullable
as String,storePhone: freezed == storePhone ? _self.storePhone : storePhone // ignore: cast_nullable_to_non_nullable
as String?,storeEmail: freezed == storeEmail ? _self.storeEmail : storeEmail // ignore: cast_nullable_to_non_nullable
as String?,storeAddress: freezed == storeAddress ? _self.storeAddress : storeAddress // ignore: cast_nullable_to_non_nullable
as String?,minOrderValue: null == minOrderValue ? _self.minOrderValue : minOrderValue // ignore: cast_nullable_to_non_nullable
as double,defaultDeliveryFee: null == defaultDeliveryFee ? _self.defaultDeliveryFee : defaultDeliveryFee // ignore: cast_nullable_to_non_nullable
as double,minOrderForFreeDelivery: null == minOrderForFreeDelivery ? _self.minOrderForFreeDelivery : minOrderForFreeDelivery // ignore: cast_nullable_to_non_nullable
as double,instantDeliveryEnabled: null == instantDeliveryEnabled ? _self.instantDeliveryEnabled : instantDeliveryEnabled // ignore: cast_nullable_to_non_nullable
as bool,instantDeliveryFee: null == instantDeliveryFee ? _self.instantDeliveryFee : instantDeliveryFee // ignore: cast_nullable_to_non_nullable
as double,instantDeliveryTimeMinutes: null == instantDeliveryTimeMinutes ? _self.instantDeliveryTimeMinutes : instantDeliveryTimeMinutes // ignore: cast_nullable_to_non_nullable
as int,slottedDeliveryEnabled: null == slottedDeliveryEnabled ? _self.slottedDeliveryEnabled : slottedDeliveryEnabled // ignore: cast_nullable_to_non_nullable
as bool,storeLatitude: freezed == storeLatitude ? _self.storeLatitude : storeLatitude // ignore: cast_nullable_to_non_nullable
as double?,storeLongitude: freezed == storeLongitude ? _self.storeLongitude : storeLongitude // ignore: cast_nullable_to_non_nullable
as double?,deliveryRadiusKm: null == deliveryRadiusKm ? _self.deliveryRadiusKm : deliveryRadiusKm // ignore: cast_nullable_to_non_nullable
as double,
  ));
}

}


/// Adds pattern-matching-related methods to [StoreSettingsModel].
extension StoreSettingsModelPatterns on StoreSettingsModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _StoreSettingsModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _StoreSettingsModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _StoreSettingsModel value)  $default,){
final _that = this;
switch (_that) {
case _StoreSettingsModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _StoreSettingsModel value)?  $default,){
final _that = this;
switch (_that) {
case _StoreSettingsModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(name: 'store_name')  String storeName, @JsonKey(name: 'store_phone')  String? storePhone, @JsonKey(name: 'store_email')  String? storeEmail, @JsonKey(name: 'store_address')  String? storeAddress, @JsonKey(name: 'min_order_value')  double minOrderValue, @JsonKey(name: 'default_delivery_fee')  double defaultDeliveryFee, @JsonKey(name: 'min_order_for_free_delivery')  double minOrderForFreeDelivery, @JsonKey(name: 'instant_delivery_enabled')  bool instantDeliveryEnabled, @JsonKey(name: 'instant_delivery_fee')  double instantDeliveryFee, @JsonKey(name: 'instant_delivery_time_minutes')  int instantDeliveryTimeMinutes, @JsonKey(name: 'slotted_delivery_enabled')  bool slottedDeliveryEnabled, @JsonKey(name: 'store_latitude')  double? storeLatitude, @JsonKey(name: 'store_longitude')  double? storeLongitude, @JsonKey(name: 'delivery_radius_km')  double deliveryRadiusKm)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _StoreSettingsModel() when $default != null:
return $default(_that.storeName,_that.storePhone,_that.storeEmail,_that.storeAddress,_that.minOrderValue,_that.defaultDeliveryFee,_that.minOrderForFreeDelivery,_that.instantDeliveryEnabled,_that.instantDeliveryFee,_that.instantDeliveryTimeMinutes,_that.slottedDeliveryEnabled,_that.storeLatitude,_that.storeLongitude,_that.deliveryRadiusKm);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(name: 'store_name')  String storeName, @JsonKey(name: 'store_phone')  String? storePhone, @JsonKey(name: 'store_email')  String? storeEmail, @JsonKey(name: 'store_address')  String? storeAddress, @JsonKey(name: 'min_order_value')  double minOrderValue, @JsonKey(name: 'default_delivery_fee')  double defaultDeliveryFee, @JsonKey(name: 'min_order_for_free_delivery')  double minOrderForFreeDelivery, @JsonKey(name: 'instant_delivery_enabled')  bool instantDeliveryEnabled, @JsonKey(name: 'instant_delivery_fee')  double instantDeliveryFee, @JsonKey(name: 'instant_delivery_time_minutes')  int instantDeliveryTimeMinutes, @JsonKey(name: 'slotted_delivery_enabled')  bool slottedDeliveryEnabled, @JsonKey(name: 'store_latitude')  double? storeLatitude, @JsonKey(name: 'store_longitude')  double? storeLongitude, @JsonKey(name: 'delivery_radius_km')  double deliveryRadiusKm)  $default,) {final _that = this;
switch (_that) {
case _StoreSettingsModel():
return $default(_that.storeName,_that.storePhone,_that.storeEmail,_that.storeAddress,_that.minOrderValue,_that.defaultDeliveryFee,_that.minOrderForFreeDelivery,_that.instantDeliveryEnabled,_that.instantDeliveryFee,_that.instantDeliveryTimeMinutes,_that.slottedDeliveryEnabled,_that.storeLatitude,_that.storeLongitude,_that.deliveryRadiusKm);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(name: 'store_name')  String storeName, @JsonKey(name: 'store_phone')  String? storePhone, @JsonKey(name: 'store_email')  String? storeEmail, @JsonKey(name: 'store_address')  String? storeAddress, @JsonKey(name: 'min_order_value')  double minOrderValue, @JsonKey(name: 'default_delivery_fee')  double defaultDeliveryFee, @JsonKey(name: 'min_order_for_free_delivery')  double minOrderForFreeDelivery, @JsonKey(name: 'instant_delivery_enabled')  bool instantDeliveryEnabled, @JsonKey(name: 'instant_delivery_fee')  double instantDeliveryFee, @JsonKey(name: 'instant_delivery_time_minutes')  int instantDeliveryTimeMinutes, @JsonKey(name: 'slotted_delivery_enabled')  bool slottedDeliveryEnabled, @JsonKey(name: 'store_latitude')  double? storeLatitude, @JsonKey(name: 'store_longitude')  double? storeLongitude, @JsonKey(name: 'delivery_radius_km')  double deliveryRadiusKm)?  $default,) {final _that = this;
switch (_that) {
case _StoreSettingsModel() when $default != null:
return $default(_that.storeName,_that.storePhone,_that.storeEmail,_that.storeAddress,_that.minOrderValue,_that.defaultDeliveryFee,_that.minOrderForFreeDelivery,_that.instantDeliveryEnabled,_that.instantDeliveryFee,_that.instantDeliveryTimeMinutes,_that.slottedDeliveryEnabled,_that.storeLatitude,_that.storeLongitude,_that.deliveryRadiusKm);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _StoreSettingsModel implements StoreSettingsModel {
  const _StoreSettingsModel({@JsonKey(name: 'store_name') this.storeName = 'Khurpi Fresh', @JsonKey(name: 'store_phone') this.storePhone, @JsonKey(name: 'store_email') this.storeEmail, @JsonKey(name: 'store_address') this.storeAddress, @JsonKey(name: 'min_order_value') this.minOrderValue = 0, @JsonKey(name: 'default_delivery_fee') this.defaultDeliveryFee = 30, @JsonKey(name: 'min_order_for_free_delivery') this.minOrderForFreeDelivery = 500, @JsonKey(name: 'instant_delivery_enabled') this.instantDeliveryEnabled = true, @JsonKey(name: 'instant_delivery_fee') this.instantDeliveryFee = 30, @JsonKey(name: 'instant_delivery_time_minutes') this.instantDeliveryTimeMinutes = 60, @JsonKey(name: 'slotted_delivery_enabled') this.slottedDeliveryEnabled = true, @JsonKey(name: 'store_latitude') this.storeLatitude, @JsonKey(name: 'store_longitude') this.storeLongitude, @JsonKey(name: 'delivery_radius_km') this.deliveryRadiusKm = 10});
  factory _StoreSettingsModel.fromJson(Map<String, dynamic> json) => _$StoreSettingsModelFromJson(json);

@override@JsonKey(name: 'store_name') final  String storeName;
@override@JsonKey(name: 'store_phone') final  String? storePhone;
@override@JsonKey(name: 'store_email') final  String? storeEmail;
@override@JsonKey(name: 'store_address') final  String? storeAddress;
@override@JsonKey(name: 'min_order_value') final  double minOrderValue;
@override@JsonKey(name: 'default_delivery_fee') final  double defaultDeliveryFee;
@override@JsonKey(name: 'min_order_for_free_delivery') final  double minOrderForFreeDelivery;
@override@JsonKey(name: 'instant_delivery_enabled') final  bool instantDeliveryEnabled;
@override@JsonKey(name: 'instant_delivery_fee') final  double instantDeliveryFee;
@override@JsonKey(name: 'instant_delivery_time_minutes') final  int instantDeliveryTimeMinutes;
@override@JsonKey(name: 'slotted_delivery_enabled') final  bool slottedDeliveryEnabled;
@override@JsonKey(name: 'store_latitude') final  double? storeLatitude;
@override@JsonKey(name: 'store_longitude') final  double? storeLongitude;
@override@JsonKey(name: 'delivery_radius_km') final  double deliveryRadiusKm;

/// Create a copy of StoreSettingsModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$StoreSettingsModelCopyWith<_StoreSettingsModel> get copyWith => __$StoreSettingsModelCopyWithImpl<_StoreSettingsModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$StoreSettingsModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _StoreSettingsModel&&(identical(other.storeName, storeName) || other.storeName == storeName)&&(identical(other.storePhone, storePhone) || other.storePhone == storePhone)&&(identical(other.storeEmail, storeEmail) || other.storeEmail == storeEmail)&&(identical(other.storeAddress, storeAddress) || other.storeAddress == storeAddress)&&(identical(other.minOrderValue, minOrderValue) || other.minOrderValue == minOrderValue)&&(identical(other.defaultDeliveryFee, defaultDeliveryFee) || other.defaultDeliveryFee == defaultDeliveryFee)&&(identical(other.minOrderForFreeDelivery, minOrderForFreeDelivery) || other.minOrderForFreeDelivery == minOrderForFreeDelivery)&&(identical(other.instantDeliveryEnabled, instantDeliveryEnabled) || other.instantDeliveryEnabled == instantDeliveryEnabled)&&(identical(other.instantDeliveryFee, instantDeliveryFee) || other.instantDeliveryFee == instantDeliveryFee)&&(identical(other.instantDeliveryTimeMinutes, instantDeliveryTimeMinutes) || other.instantDeliveryTimeMinutes == instantDeliveryTimeMinutes)&&(identical(other.slottedDeliveryEnabled, slottedDeliveryEnabled) || other.slottedDeliveryEnabled == slottedDeliveryEnabled)&&(identical(other.storeLatitude, storeLatitude) || other.storeLatitude == storeLatitude)&&(identical(other.storeLongitude, storeLongitude) || other.storeLongitude == storeLongitude)&&(identical(other.deliveryRadiusKm, deliveryRadiusKm) || other.deliveryRadiusKm == deliveryRadiusKm));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,storeName,storePhone,storeEmail,storeAddress,minOrderValue,defaultDeliveryFee,minOrderForFreeDelivery,instantDeliveryEnabled,instantDeliveryFee,instantDeliveryTimeMinutes,slottedDeliveryEnabled,storeLatitude,storeLongitude,deliveryRadiusKm);

@override
String toString() {
  return 'StoreSettingsModel(storeName: $storeName, storePhone: $storePhone, storeEmail: $storeEmail, storeAddress: $storeAddress, minOrderValue: $minOrderValue, defaultDeliveryFee: $defaultDeliveryFee, minOrderForFreeDelivery: $minOrderForFreeDelivery, instantDeliveryEnabled: $instantDeliveryEnabled, instantDeliveryFee: $instantDeliveryFee, instantDeliveryTimeMinutes: $instantDeliveryTimeMinutes, slottedDeliveryEnabled: $slottedDeliveryEnabled, storeLatitude: $storeLatitude, storeLongitude: $storeLongitude, deliveryRadiusKm: $deliveryRadiusKm)';
}


}

/// @nodoc
abstract mixin class _$StoreSettingsModelCopyWith<$Res> implements $StoreSettingsModelCopyWith<$Res> {
  factory _$StoreSettingsModelCopyWith(_StoreSettingsModel value, $Res Function(_StoreSettingsModel) _then) = __$StoreSettingsModelCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(name: 'store_name') String storeName,@JsonKey(name: 'store_phone') String? storePhone,@JsonKey(name: 'store_email') String? storeEmail,@JsonKey(name: 'store_address') String? storeAddress,@JsonKey(name: 'min_order_value') double minOrderValue,@JsonKey(name: 'default_delivery_fee') double defaultDeliveryFee,@JsonKey(name: 'min_order_for_free_delivery') double minOrderForFreeDelivery,@JsonKey(name: 'instant_delivery_enabled') bool instantDeliveryEnabled,@JsonKey(name: 'instant_delivery_fee') double instantDeliveryFee,@JsonKey(name: 'instant_delivery_time_minutes') int instantDeliveryTimeMinutes,@JsonKey(name: 'slotted_delivery_enabled') bool slottedDeliveryEnabled,@JsonKey(name: 'store_latitude') double? storeLatitude,@JsonKey(name: 'store_longitude') double? storeLongitude,@JsonKey(name: 'delivery_radius_km') double deliveryRadiusKm
});




}
/// @nodoc
class __$StoreSettingsModelCopyWithImpl<$Res>
    implements _$StoreSettingsModelCopyWith<$Res> {
  __$StoreSettingsModelCopyWithImpl(this._self, this._then);

  final _StoreSettingsModel _self;
  final $Res Function(_StoreSettingsModel) _then;

/// Create a copy of StoreSettingsModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? storeName = null,Object? storePhone = freezed,Object? storeEmail = freezed,Object? storeAddress = freezed,Object? minOrderValue = null,Object? defaultDeliveryFee = null,Object? minOrderForFreeDelivery = null,Object? instantDeliveryEnabled = null,Object? instantDeliveryFee = null,Object? instantDeliveryTimeMinutes = null,Object? slottedDeliveryEnabled = null,Object? storeLatitude = freezed,Object? storeLongitude = freezed,Object? deliveryRadiusKm = null,}) {
  return _then(_StoreSettingsModel(
storeName: null == storeName ? _self.storeName : storeName // ignore: cast_nullable_to_non_nullable
as String,storePhone: freezed == storePhone ? _self.storePhone : storePhone // ignore: cast_nullable_to_non_nullable
as String?,storeEmail: freezed == storeEmail ? _self.storeEmail : storeEmail // ignore: cast_nullable_to_non_nullable
as String?,storeAddress: freezed == storeAddress ? _self.storeAddress : storeAddress // ignore: cast_nullable_to_non_nullable
as String?,minOrderValue: null == minOrderValue ? _self.minOrderValue : minOrderValue // ignore: cast_nullable_to_non_nullable
as double,defaultDeliveryFee: null == defaultDeliveryFee ? _self.defaultDeliveryFee : defaultDeliveryFee // ignore: cast_nullable_to_non_nullable
as double,minOrderForFreeDelivery: null == minOrderForFreeDelivery ? _self.minOrderForFreeDelivery : minOrderForFreeDelivery // ignore: cast_nullable_to_non_nullable
as double,instantDeliveryEnabled: null == instantDeliveryEnabled ? _self.instantDeliveryEnabled : instantDeliveryEnabled // ignore: cast_nullable_to_non_nullable
as bool,instantDeliveryFee: null == instantDeliveryFee ? _self.instantDeliveryFee : instantDeliveryFee // ignore: cast_nullable_to_non_nullable
as double,instantDeliveryTimeMinutes: null == instantDeliveryTimeMinutes ? _self.instantDeliveryTimeMinutes : instantDeliveryTimeMinutes // ignore: cast_nullable_to_non_nullable
as int,slottedDeliveryEnabled: null == slottedDeliveryEnabled ? _self.slottedDeliveryEnabled : slottedDeliveryEnabled // ignore: cast_nullable_to_non_nullable
as bool,storeLatitude: freezed == storeLatitude ? _self.storeLatitude : storeLatitude // ignore: cast_nullable_to_non_nullable
as double?,storeLongitude: freezed == storeLongitude ? _self.storeLongitude : storeLongitude // ignore: cast_nullable_to_non_nullable
as double?,deliveryRadiusKm: null == deliveryRadiusKm ? _self.deliveryRadiusKm : deliveryRadiusKm // ignore: cast_nullable_to_non_nullable
as double,
  ));
}


}

// dart format on
