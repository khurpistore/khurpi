// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of '../../../data/models/address_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$AddressModel {

 String? get id;@JsonKey(name: 'user_id') String? get userId; String get label;@JsonKey(name: 'full_name') String get fullName; String get phone;@JsonKey(name: 'address_line1') String get addressLine1;@JsonKey(name: 'address_line2') String? get addressLine2; String? get landmark; String get city; String get state; String get pincode; String get country; String? get society; double? get latitude; double? get longitude;@JsonKey(name: 'is_default') bool get isDefault;@JsonKey(name: 'created_at') String? get createdAt;
/// Create a copy of AddressModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$AddressModelCopyWith<AddressModel> get copyWith => _$AddressModelCopyWithImpl<AddressModel>(this as AddressModel, _$identity);

  /// Serializes this AddressModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is AddressModel&&(identical(other.id, id) || other.id == id)&&(identical(other.userId, userId) || other.userId == userId)&&(identical(other.label, label) || other.label == label)&&(identical(other.fullName, fullName) || other.fullName == fullName)&&(identical(other.phone, phone) || other.phone == phone)&&(identical(other.addressLine1, addressLine1) || other.addressLine1 == addressLine1)&&(identical(other.addressLine2, addressLine2) || other.addressLine2 == addressLine2)&&(identical(other.landmark, landmark) || other.landmark == landmark)&&(identical(other.city, city) || other.city == city)&&(identical(other.state, state) || other.state == state)&&(identical(other.pincode, pincode) || other.pincode == pincode)&&(identical(other.country, country) || other.country == country)&&(identical(other.society, society) || other.society == society)&&(identical(other.latitude, latitude) || other.latitude == latitude)&&(identical(other.longitude, longitude) || other.longitude == longitude)&&(identical(other.isDefault, isDefault) || other.isDefault == isDefault)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,userId,label,fullName,phone,addressLine1,addressLine2,landmark,city,state,pincode,country,society,latitude,longitude,isDefault,createdAt);

@override
String toString() {
  return 'AddressModel(id: $id, userId: $userId, label: $label, fullName: $fullName, phone: $phone, addressLine1: $addressLine1, addressLine2: $addressLine2, landmark: $landmark, city: $city, state: $state, pincode: $pincode, country: $country, society: $society, latitude: $latitude, longitude: $longitude, isDefault: $isDefault, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class $AddressModelCopyWith<$Res>  {
  factory $AddressModelCopyWith(AddressModel value, $Res Function(AddressModel) _then) = _$AddressModelCopyWithImpl;
@useResult
$Res call({
 String? id,@JsonKey(name: 'user_id') String? userId, String label,@JsonKey(name: 'full_name') String fullName, String phone,@JsonKey(name: 'address_line1') String addressLine1,@JsonKey(name: 'address_line2') String? addressLine2, String? landmark, String city, String state, String pincode, String country, String? society, double? latitude, double? longitude,@JsonKey(name: 'is_default') bool isDefault,@JsonKey(name: 'created_at') String? createdAt
});




}
/// @nodoc
class _$AddressModelCopyWithImpl<$Res>
    implements $AddressModelCopyWith<$Res> {
  _$AddressModelCopyWithImpl(this._self, this._then);

  final AddressModel _self;
  final $Res Function(AddressModel) _then;

/// Create a copy of AddressModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = freezed,Object? userId = freezed,Object? label = null,Object? fullName = null,Object? phone = null,Object? addressLine1 = null,Object? addressLine2 = freezed,Object? landmark = freezed,Object? city = null,Object? state = null,Object? pincode = null,Object? country = null,Object? society = freezed,Object? latitude = freezed,Object? longitude = freezed,Object? isDefault = null,Object? createdAt = freezed,}) {
  return _then(_self.copyWith(
id: freezed == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String?,userId: freezed == userId ? _self.userId : userId // ignore: cast_nullable_to_non_nullable
as String?,label: null == label ? _self.label : label // ignore: cast_nullable_to_non_nullable
as String,fullName: null == fullName ? _self.fullName : fullName // ignore: cast_nullable_to_non_nullable
as String,phone: null == phone ? _self.phone : phone // ignore: cast_nullable_to_non_nullable
as String,addressLine1: null == addressLine1 ? _self.addressLine1 : addressLine1 // ignore: cast_nullable_to_non_nullable
as String,addressLine2: freezed == addressLine2 ? _self.addressLine2 : addressLine2 // ignore: cast_nullable_to_non_nullable
as String?,landmark: freezed == landmark ? _self.landmark : landmark // ignore: cast_nullable_to_non_nullable
as String?,city: null == city ? _self.city : city // ignore: cast_nullable_to_non_nullable
as String,state: null == state ? _self.state : state // ignore: cast_nullable_to_non_nullable
as String,pincode: null == pincode ? _self.pincode : pincode // ignore: cast_nullable_to_non_nullable
as String,country: null == country ? _self.country : country // ignore: cast_nullable_to_non_nullable
as String,society: freezed == society ? _self.society : society // ignore: cast_nullable_to_non_nullable
as String?,latitude: freezed == latitude ? _self.latitude : latitude // ignore: cast_nullable_to_non_nullable
as double?,longitude: freezed == longitude ? _self.longitude : longitude // ignore: cast_nullable_to_non_nullable
as double?,isDefault: null == isDefault ? _self.isDefault : isDefault // ignore: cast_nullable_to_non_nullable
as bool,createdAt: freezed == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [AddressModel].
extension AddressModelPatterns on AddressModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _AddressModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _AddressModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _AddressModel value)  $default,){
final _that = this;
switch (_that) {
case _AddressModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _AddressModel value)?  $default,){
final _that = this;
switch (_that) {
case _AddressModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String? id, @JsonKey(name: 'user_id')  String? userId,  String label, @JsonKey(name: 'full_name')  String fullName,  String phone, @JsonKey(name: 'address_line1')  String addressLine1, @JsonKey(name: 'address_line2')  String? addressLine2,  String? landmark,  String city,  String state,  String pincode,  String country,  String? society,  double? latitude,  double? longitude, @JsonKey(name: 'is_default')  bool isDefault, @JsonKey(name: 'created_at')  String? createdAt)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _AddressModel() when $default != null:
return $default(_that.id,_that.userId,_that.label,_that.fullName,_that.phone,_that.addressLine1,_that.addressLine2,_that.landmark,_that.city,_that.state,_that.pincode,_that.country,_that.society,_that.latitude,_that.longitude,_that.isDefault,_that.createdAt);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String? id, @JsonKey(name: 'user_id')  String? userId,  String label, @JsonKey(name: 'full_name')  String fullName,  String phone, @JsonKey(name: 'address_line1')  String addressLine1, @JsonKey(name: 'address_line2')  String? addressLine2,  String? landmark,  String city,  String state,  String pincode,  String country,  String? society,  double? latitude,  double? longitude, @JsonKey(name: 'is_default')  bool isDefault, @JsonKey(name: 'created_at')  String? createdAt)  $default,) {final _that = this;
switch (_that) {
case _AddressModel():
return $default(_that.id,_that.userId,_that.label,_that.fullName,_that.phone,_that.addressLine1,_that.addressLine2,_that.landmark,_that.city,_that.state,_that.pincode,_that.country,_that.society,_that.latitude,_that.longitude,_that.isDefault,_that.createdAt);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String? id, @JsonKey(name: 'user_id')  String? userId,  String label, @JsonKey(name: 'full_name')  String fullName,  String phone, @JsonKey(name: 'address_line1')  String addressLine1, @JsonKey(name: 'address_line2')  String? addressLine2,  String? landmark,  String city,  String state,  String pincode,  String country,  String? society,  double? latitude,  double? longitude, @JsonKey(name: 'is_default')  bool isDefault, @JsonKey(name: 'created_at')  String? createdAt)?  $default,) {final _that = this;
switch (_that) {
case _AddressModel() when $default != null:
return $default(_that.id,_that.userId,_that.label,_that.fullName,_that.phone,_that.addressLine1,_that.addressLine2,_that.landmark,_that.city,_that.state,_that.pincode,_that.country,_that.society,_that.latitude,_that.longitude,_that.isDefault,_that.createdAt);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _AddressModel extends AddressModel {
  const _AddressModel({this.id, @JsonKey(name: 'user_id') this.userId, this.label = 'Home', @JsonKey(name: 'full_name') required this.fullName, required this.phone, @JsonKey(name: 'address_line1') required this.addressLine1, @JsonKey(name: 'address_line2') this.addressLine2, this.landmark, required this.city, required this.state, required this.pincode, this.country = 'India', this.society, this.latitude, this.longitude, @JsonKey(name: 'is_default') this.isDefault = false, @JsonKey(name: 'created_at') this.createdAt}): super._();
  factory _AddressModel.fromJson(Map<String, dynamic> json) => _$AddressModelFromJson(json);

@override final  String? id;
@override@JsonKey(name: 'user_id') final  String? userId;
@override@JsonKey() final  String label;
@override@JsonKey(name: 'full_name') final  String fullName;
@override final  String phone;
@override@JsonKey(name: 'address_line1') final  String addressLine1;
@override@JsonKey(name: 'address_line2') final  String? addressLine2;
@override final  String? landmark;
@override final  String city;
@override final  String state;
@override final  String pincode;
@override@JsonKey() final  String country;
@override final  String? society;
@override final  double? latitude;
@override final  double? longitude;
@override@JsonKey(name: 'is_default') final  bool isDefault;
@override@JsonKey(name: 'created_at') final  String? createdAt;

/// Create a copy of AddressModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$AddressModelCopyWith<_AddressModel> get copyWith => __$AddressModelCopyWithImpl<_AddressModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$AddressModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _AddressModel&&(identical(other.id, id) || other.id == id)&&(identical(other.userId, userId) || other.userId == userId)&&(identical(other.label, label) || other.label == label)&&(identical(other.fullName, fullName) || other.fullName == fullName)&&(identical(other.phone, phone) || other.phone == phone)&&(identical(other.addressLine1, addressLine1) || other.addressLine1 == addressLine1)&&(identical(other.addressLine2, addressLine2) || other.addressLine2 == addressLine2)&&(identical(other.landmark, landmark) || other.landmark == landmark)&&(identical(other.city, city) || other.city == city)&&(identical(other.state, state) || other.state == state)&&(identical(other.pincode, pincode) || other.pincode == pincode)&&(identical(other.country, country) || other.country == country)&&(identical(other.society, society) || other.society == society)&&(identical(other.latitude, latitude) || other.latitude == latitude)&&(identical(other.longitude, longitude) || other.longitude == longitude)&&(identical(other.isDefault, isDefault) || other.isDefault == isDefault)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,userId,label,fullName,phone,addressLine1,addressLine2,landmark,city,state,pincode,country,society,latitude,longitude,isDefault,createdAt);

@override
String toString() {
  return 'AddressModel(id: $id, userId: $userId, label: $label, fullName: $fullName, phone: $phone, addressLine1: $addressLine1, addressLine2: $addressLine2, landmark: $landmark, city: $city, state: $state, pincode: $pincode, country: $country, society: $society, latitude: $latitude, longitude: $longitude, isDefault: $isDefault, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class _$AddressModelCopyWith<$Res> implements $AddressModelCopyWith<$Res> {
  factory _$AddressModelCopyWith(_AddressModel value, $Res Function(_AddressModel) _then) = __$AddressModelCopyWithImpl;
@override @useResult
$Res call({
 String? id,@JsonKey(name: 'user_id') String? userId, String label,@JsonKey(name: 'full_name') String fullName, String phone,@JsonKey(name: 'address_line1') String addressLine1,@JsonKey(name: 'address_line2') String? addressLine2, String? landmark, String city, String state, String pincode, String country, String? society, double? latitude, double? longitude,@JsonKey(name: 'is_default') bool isDefault,@JsonKey(name: 'created_at') String? createdAt
});




}
/// @nodoc
class __$AddressModelCopyWithImpl<$Res>
    implements _$AddressModelCopyWith<$Res> {
  __$AddressModelCopyWithImpl(this._self, this._then);

  final _AddressModel _self;
  final $Res Function(_AddressModel) _then;

/// Create a copy of AddressModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = freezed,Object? userId = freezed,Object? label = null,Object? fullName = null,Object? phone = null,Object? addressLine1 = null,Object? addressLine2 = freezed,Object? landmark = freezed,Object? city = null,Object? state = null,Object? pincode = null,Object? country = null,Object? society = freezed,Object? latitude = freezed,Object? longitude = freezed,Object? isDefault = null,Object? createdAt = freezed,}) {
  return _then(_AddressModel(
id: freezed == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String?,userId: freezed == userId ? _self.userId : userId // ignore: cast_nullable_to_non_nullable
as String?,label: null == label ? _self.label : label // ignore: cast_nullable_to_non_nullable
as String,fullName: null == fullName ? _self.fullName : fullName // ignore: cast_nullable_to_non_nullable
as String,phone: null == phone ? _self.phone : phone // ignore: cast_nullable_to_non_nullable
as String,addressLine1: null == addressLine1 ? _self.addressLine1 : addressLine1 // ignore: cast_nullable_to_non_nullable
as String,addressLine2: freezed == addressLine2 ? _self.addressLine2 : addressLine2 // ignore: cast_nullable_to_non_nullable
as String?,landmark: freezed == landmark ? _self.landmark : landmark // ignore: cast_nullable_to_non_nullable
as String?,city: null == city ? _self.city : city // ignore: cast_nullable_to_non_nullable
as String,state: null == state ? _self.state : state // ignore: cast_nullable_to_non_nullable
as String,pincode: null == pincode ? _self.pincode : pincode // ignore: cast_nullable_to_non_nullable
as String,country: null == country ? _self.country : country // ignore: cast_nullable_to_non_nullable
as String,society: freezed == society ? _self.society : society // ignore: cast_nullable_to_non_nullable
as String?,latitude: freezed == latitude ? _self.latitude : latitude // ignore: cast_nullable_to_non_nullable
as double?,longitude: freezed == longitude ? _self.longitude : longitude // ignore: cast_nullable_to_non_nullable
as double?,isDefault: null == isDefault ? _self.isDefault : isDefault // ignore: cast_nullable_to_non_nullable
as bool,createdAt: freezed == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}

// dart format on
