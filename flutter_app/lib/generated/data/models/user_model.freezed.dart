// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of '../../../data/models/user_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$UserModel {

@JsonKey(name: 'id') String? get id;@JsonKey(name: '_id') String? get mongoId; String? get name; String get phone; String? get email; String? get address;@JsonKey(name: 'address_line_1') String? get addressLine1;@JsonKey(name: 'address_line_2') String? get addressLine2; String? get landmark; String? get city; String? get state; String? get country; String? get pincode; double? get latitude; double? get longitude;@JsonKey(name: 'formatted_address') String? get formattedAddress;@JsonKey(name: 'is_admin') bool get isAdmin;@JsonKey(name: 'wholesale_enabled') bool get wholesaleEnabled;@JsonKey(name: 'role') String get role;@JsonKey(name: 'created_at') DateTime? get createdAt;
/// Create a copy of UserModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$UserModelCopyWith<UserModel> get copyWith => _$UserModelCopyWithImpl<UserModel>(this as UserModel, _$identity);

  /// Serializes this UserModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is UserModel&&(identical(other.id, id) || other.id == id)&&(identical(other.mongoId, mongoId) || other.mongoId == mongoId)&&(identical(other.name, name) || other.name == name)&&(identical(other.phone, phone) || other.phone == phone)&&(identical(other.email, email) || other.email == email)&&(identical(other.address, address) || other.address == address)&&(identical(other.addressLine1, addressLine1) || other.addressLine1 == addressLine1)&&(identical(other.addressLine2, addressLine2) || other.addressLine2 == addressLine2)&&(identical(other.landmark, landmark) || other.landmark == landmark)&&(identical(other.city, city) || other.city == city)&&(identical(other.state, state) || other.state == state)&&(identical(other.country, country) || other.country == country)&&(identical(other.pincode, pincode) || other.pincode == pincode)&&(identical(other.latitude, latitude) || other.latitude == latitude)&&(identical(other.longitude, longitude) || other.longitude == longitude)&&(identical(other.formattedAddress, formattedAddress) || other.formattedAddress == formattedAddress)&&(identical(other.isAdmin, isAdmin) || other.isAdmin == isAdmin)&&(identical(other.wholesaleEnabled, wholesaleEnabled) || other.wholesaleEnabled == wholesaleEnabled)&&(identical(other.role, role) || other.role == role)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hashAll([runtimeType,id,mongoId,name,phone,email,address,addressLine1,addressLine2,landmark,city,state,country,pincode,latitude,longitude,formattedAddress,isAdmin,wholesaleEnabled,role,createdAt]);

@override
String toString() {
  return 'UserModel(id: $id, mongoId: $mongoId, name: $name, phone: $phone, email: $email, address: $address, addressLine1: $addressLine1, addressLine2: $addressLine2, landmark: $landmark, city: $city, state: $state, country: $country, pincode: $pincode, latitude: $latitude, longitude: $longitude, formattedAddress: $formattedAddress, isAdmin: $isAdmin, wholesaleEnabled: $wholesaleEnabled, role: $role, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class $UserModelCopyWith<$Res>  {
  factory $UserModelCopyWith(UserModel value, $Res Function(UserModel) _then) = _$UserModelCopyWithImpl;
@useResult
$Res call({
@JsonKey(name: 'id') String? id,@JsonKey(name: '_id') String? mongoId, String? name, String phone, String? email, String? address,@JsonKey(name: 'address_line_1') String? addressLine1,@JsonKey(name: 'address_line_2') String? addressLine2, String? landmark, String? city, String? state, String? country, String? pincode, double? latitude, double? longitude,@JsonKey(name: 'formatted_address') String? formattedAddress,@JsonKey(name: 'is_admin') bool isAdmin,@JsonKey(name: 'wholesale_enabled') bool wholesaleEnabled,@JsonKey(name: 'role') String role,@JsonKey(name: 'created_at') DateTime? createdAt
});




}
/// @nodoc
class _$UserModelCopyWithImpl<$Res>
    implements $UserModelCopyWith<$Res> {
  _$UserModelCopyWithImpl(this._self, this._then);

  final UserModel _self;
  final $Res Function(UserModel) _then;

/// Create a copy of UserModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = freezed,Object? mongoId = freezed,Object? name = freezed,Object? phone = null,Object? email = freezed,Object? address = freezed,Object? addressLine1 = freezed,Object? addressLine2 = freezed,Object? landmark = freezed,Object? city = freezed,Object? state = freezed,Object? country = freezed,Object? pincode = freezed,Object? latitude = freezed,Object? longitude = freezed,Object? formattedAddress = freezed,Object? isAdmin = null,Object? wholesaleEnabled = null,Object? role = null,Object? createdAt = freezed,}) {
  return _then(_self.copyWith(
id: freezed == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String?,mongoId: freezed == mongoId ? _self.mongoId : mongoId // ignore: cast_nullable_to_non_nullable
as String?,name: freezed == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String?,phone: null == phone ? _self.phone : phone // ignore: cast_nullable_to_non_nullable
as String,email: freezed == email ? _self.email : email // ignore: cast_nullable_to_non_nullable
as String?,address: freezed == address ? _self.address : address // ignore: cast_nullable_to_non_nullable
as String?,addressLine1: freezed == addressLine1 ? _self.addressLine1 : addressLine1 // ignore: cast_nullable_to_non_nullable
as String?,addressLine2: freezed == addressLine2 ? _self.addressLine2 : addressLine2 // ignore: cast_nullable_to_non_nullable
as String?,landmark: freezed == landmark ? _self.landmark : landmark // ignore: cast_nullable_to_non_nullable
as String?,city: freezed == city ? _self.city : city // ignore: cast_nullable_to_non_nullable
as String?,state: freezed == state ? _self.state : state // ignore: cast_nullable_to_non_nullable
as String?,country: freezed == country ? _self.country : country // ignore: cast_nullable_to_non_nullable
as String?,pincode: freezed == pincode ? _self.pincode : pincode // ignore: cast_nullable_to_non_nullable
as String?,latitude: freezed == latitude ? _self.latitude : latitude // ignore: cast_nullable_to_non_nullable
as double?,longitude: freezed == longitude ? _self.longitude : longitude // ignore: cast_nullable_to_non_nullable
as double?,formattedAddress: freezed == formattedAddress ? _self.formattedAddress : formattedAddress // ignore: cast_nullable_to_non_nullable
as String?,isAdmin: null == isAdmin ? _self.isAdmin : isAdmin // ignore: cast_nullable_to_non_nullable
as bool,wholesaleEnabled: null == wholesaleEnabled ? _self.wholesaleEnabled : wholesaleEnabled // ignore: cast_nullable_to_non_nullable
as bool,role: null == role ? _self.role : role // ignore: cast_nullable_to_non_nullable
as String,createdAt: freezed == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime?,
  ));
}

}


/// Adds pattern-matching-related methods to [UserModel].
extension UserModelPatterns on UserModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _UserModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _UserModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _UserModel value)  $default,){
final _that = this;
switch (_that) {
case _UserModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _UserModel value)?  $default,){
final _that = this;
switch (_that) {
case _UserModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(name: 'id')  String? id, @JsonKey(name: '_id')  String? mongoId,  String? name,  String phone,  String? email,  String? address, @JsonKey(name: 'address_line_1')  String? addressLine1, @JsonKey(name: 'address_line_2')  String? addressLine2,  String? landmark,  String? city,  String? state,  String? country,  String? pincode,  double? latitude,  double? longitude, @JsonKey(name: 'formatted_address')  String? formattedAddress, @JsonKey(name: 'is_admin')  bool isAdmin, @JsonKey(name: 'wholesale_enabled')  bool wholesaleEnabled, @JsonKey(name: 'role')  String role, @JsonKey(name: 'created_at')  DateTime? createdAt)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _UserModel() when $default != null:
return $default(_that.id,_that.mongoId,_that.name,_that.phone,_that.email,_that.address,_that.addressLine1,_that.addressLine2,_that.landmark,_that.city,_that.state,_that.country,_that.pincode,_that.latitude,_that.longitude,_that.formattedAddress,_that.isAdmin,_that.wholesaleEnabled,_that.role,_that.createdAt);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(name: 'id')  String? id, @JsonKey(name: '_id')  String? mongoId,  String? name,  String phone,  String? email,  String? address, @JsonKey(name: 'address_line_1')  String? addressLine1, @JsonKey(name: 'address_line_2')  String? addressLine2,  String? landmark,  String? city,  String? state,  String? country,  String? pincode,  double? latitude,  double? longitude, @JsonKey(name: 'formatted_address')  String? formattedAddress, @JsonKey(name: 'is_admin')  bool isAdmin, @JsonKey(name: 'wholesale_enabled')  bool wholesaleEnabled, @JsonKey(name: 'role')  String role, @JsonKey(name: 'created_at')  DateTime? createdAt)  $default,) {final _that = this;
switch (_that) {
case _UserModel():
return $default(_that.id,_that.mongoId,_that.name,_that.phone,_that.email,_that.address,_that.addressLine1,_that.addressLine2,_that.landmark,_that.city,_that.state,_that.country,_that.pincode,_that.latitude,_that.longitude,_that.formattedAddress,_that.isAdmin,_that.wholesaleEnabled,_that.role,_that.createdAt);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(name: 'id')  String? id, @JsonKey(name: '_id')  String? mongoId,  String? name,  String phone,  String? email,  String? address, @JsonKey(name: 'address_line_1')  String? addressLine1, @JsonKey(name: 'address_line_2')  String? addressLine2,  String? landmark,  String? city,  String? state,  String? country,  String? pincode,  double? latitude,  double? longitude, @JsonKey(name: 'formatted_address')  String? formattedAddress, @JsonKey(name: 'is_admin')  bool isAdmin, @JsonKey(name: 'wholesale_enabled')  bool wholesaleEnabled, @JsonKey(name: 'role')  String role, @JsonKey(name: 'created_at')  DateTime? createdAt)?  $default,) {final _that = this;
switch (_that) {
case _UserModel() when $default != null:
return $default(_that.id,_that.mongoId,_that.name,_that.phone,_that.email,_that.address,_that.addressLine1,_that.addressLine2,_that.landmark,_that.city,_that.state,_that.country,_that.pincode,_that.latitude,_that.longitude,_that.formattedAddress,_that.isAdmin,_that.wholesaleEnabled,_that.role,_that.createdAt);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _UserModel implements UserModel {
  const _UserModel({@JsonKey(name: 'id') this.id, @JsonKey(name: '_id') this.mongoId, this.name, required this.phone, this.email, this.address, @JsonKey(name: 'address_line_1') this.addressLine1, @JsonKey(name: 'address_line_2') this.addressLine2, this.landmark, this.city, this.state, this.country, this.pincode, this.latitude, this.longitude, @JsonKey(name: 'formatted_address') this.formattedAddress, @JsonKey(name: 'is_admin') this.isAdmin = false, @JsonKey(name: 'wholesale_enabled') this.wholesaleEnabled = false, @JsonKey(name: 'role') this.role = 'customer', @JsonKey(name: 'created_at') this.createdAt});
  factory _UserModel.fromJson(Map<String, dynamic> json) => _$UserModelFromJson(json);

@override@JsonKey(name: 'id') final  String? id;
@override@JsonKey(name: '_id') final  String? mongoId;
@override final  String? name;
@override final  String phone;
@override final  String? email;
@override final  String? address;
@override@JsonKey(name: 'address_line_1') final  String? addressLine1;
@override@JsonKey(name: 'address_line_2') final  String? addressLine2;
@override final  String? landmark;
@override final  String? city;
@override final  String? state;
@override final  String? country;
@override final  String? pincode;
@override final  double? latitude;
@override final  double? longitude;
@override@JsonKey(name: 'formatted_address') final  String? formattedAddress;
@override@JsonKey(name: 'is_admin') final  bool isAdmin;
@override@JsonKey(name: 'wholesale_enabled') final  bool wholesaleEnabled;
@override@JsonKey(name: 'role') final  String role;
@override@JsonKey(name: 'created_at') final  DateTime? createdAt;

/// Create a copy of UserModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$UserModelCopyWith<_UserModel> get copyWith => __$UserModelCopyWithImpl<_UserModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$UserModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _UserModel&&(identical(other.id, id) || other.id == id)&&(identical(other.mongoId, mongoId) || other.mongoId == mongoId)&&(identical(other.name, name) || other.name == name)&&(identical(other.phone, phone) || other.phone == phone)&&(identical(other.email, email) || other.email == email)&&(identical(other.address, address) || other.address == address)&&(identical(other.addressLine1, addressLine1) || other.addressLine1 == addressLine1)&&(identical(other.addressLine2, addressLine2) || other.addressLine2 == addressLine2)&&(identical(other.landmark, landmark) || other.landmark == landmark)&&(identical(other.city, city) || other.city == city)&&(identical(other.state, state) || other.state == state)&&(identical(other.country, country) || other.country == country)&&(identical(other.pincode, pincode) || other.pincode == pincode)&&(identical(other.latitude, latitude) || other.latitude == latitude)&&(identical(other.longitude, longitude) || other.longitude == longitude)&&(identical(other.formattedAddress, formattedAddress) || other.formattedAddress == formattedAddress)&&(identical(other.isAdmin, isAdmin) || other.isAdmin == isAdmin)&&(identical(other.wholesaleEnabled, wholesaleEnabled) || other.wholesaleEnabled == wholesaleEnabled)&&(identical(other.role, role) || other.role == role)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hashAll([runtimeType,id,mongoId,name,phone,email,address,addressLine1,addressLine2,landmark,city,state,country,pincode,latitude,longitude,formattedAddress,isAdmin,wholesaleEnabled,role,createdAt]);

@override
String toString() {
  return 'UserModel(id: $id, mongoId: $mongoId, name: $name, phone: $phone, email: $email, address: $address, addressLine1: $addressLine1, addressLine2: $addressLine2, landmark: $landmark, city: $city, state: $state, country: $country, pincode: $pincode, latitude: $latitude, longitude: $longitude, formattedAddress: $formattedAddress, isAdmin: $isAdmin, wholesaleEnabled: $wholesaleEnabled, role: $role, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class _$UserModelCopyWith<$Res> implements $UserModelCopyWith<$Res> {
  factory _$UserModelCopyWith(_UserModel value, $Res Function(_UserModel) _then) = __$UserModelCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(name: 'id') String? id,@JsonKey(name: '_id') String? mongoId, String? name, String phone, String? email, String? address,@JsonKey(name: 'address_line_1') String? addressLine1,@JsonKey(name: 'address_line_2') String? addressLine2, String? landmark, String? city, String? state, String? country, String? pincode, double? latitude, double? longitude,@JsonKey(name: 'formatted_address') String? formattedAddress,@JsonKey(name: 'is_admin') bool isAdmin,@JsonKey(name: 'wholesale_enabled') bool wholesaleEnabled,@JsonKey(name: 'role') String role,@JsonKey(name: 'created_at') DateTime? createdAt
});




}
/// @nodoc
class __$UserModelCopyWithImpl<$Res>
    implements _$UserModelCopyWith<$Res> {
  __$UserModelCopyWithImpl(this._self, this._then);

  final _UserModel _self;
  final $Res Function(_UserModel) _then;

/// Create a copy of UserModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = freezed,Object? mongoId = freezed,Object? name = freezed,Object? phone = null,Object? email = freezed,Object? address = freezed,Object? addressLine1 = freezed,Object? addressLine2 = freezed,Object? landmark = freezed,Object? city = freezed,Object? state = freezed,Object? country = freezed,Object? pincode = freezed,Object? latitude = freezed,Object? longitude = freezed,Object? formattedAddress = freezed,Object? isAdmin = null,Object? wholesaleEnabled = null,Object? role = null,Object? createdAt = freezed,}) {
  return _then(_UserModel(
id: freezed == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String?,mongoId: freezed == mongoId ? _self.mongoId : mongoId // ignore: cast_nullable_to_non_nullable
as String?,name: freezed == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String?,phone: null == phone ? _self.phone : phone // ignore: cast_nullable_to_non_nullable
as String,email: freezed == email ? _self.email : email // ignore: cast_nullable_to_non_nullable
as String?,address: freezed == address ? _self.address : address // ignore: cast_nullable_to_non_nullable
as String?,addressLine1: freezed == addressLine1 ? _self.addressLine1 : addressLine1 // ignore: cast_nullable_to_non_nullable
as String?,addressLine2: freezed == addressLine2 ? _self.addressLine2 : addressLine2 // ignore: cast_nullable_to_non_nullable
as String?,landmark: freezed == landmark ? _self.landmark : landmark // ignore: cast_nullable_to_non_nullable
as String?,city: freezed == city ? _self.city : city // ignore: cast_nullable_to_non_nullable
as String?,state: freezed == state ? _self.state : state // ignore: cast_nullable_to_non_nullable
as String?,country: freezed == country ? _self.country : country // ignore: cast_nullable_to_non_nullable
as String?,pincode: freezed == pincode ? _self.pincode : pincode // ignore: cast_nullable_to_non_nullable
as String?,latitude: freezed == latitude ? _self.latitude : latitude // ignore: cast_nullable_to_non_nullable
as double?,longitude: freezed == longitude ? _self.longitude : longitude // ignore: cast_nullable_to_non_nullable
as double?,formattedAddress: freezed == formattedAddress ? _self.formattedAddress : formattedAddress // ignore: cast_nullable_to_non_nullable
as String?,isAdmin: null == isAdmin ? _self.isAdmin : isAdmin // ignore: cast_nullable_to_non_nullable
as bool,wholesaleEnabled: null == wholesaleEnabled ? _self.wholesaleEnabled : wholesaleEnabled // ignore: cast_nullable_to_non_nullable
as bool,role: null == role ? _self.role : role // ignore: cast_nullable_to_non_nullable
as String,createdAt: freezed == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime?,
  ));
}


}

// dart format on
