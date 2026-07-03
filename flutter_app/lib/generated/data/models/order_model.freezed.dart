// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of '../../../data/models/order_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$OrderModel {

@JsonKey(name: 'id') String? get id;@JsonKey(name: '_id') String? get mongoId;@JsonKey(name: 'user_id') String get userId;@JsonKey(name: 'user_name') String? get userName;@JsonKey(name: 'user_phone') String? get userPhone; List<OrderItemModel> get items; double get subtotal;@JsonKey(name: 'delivery_fee') double get deliveryFee; double get total; String get status;@JsonKey(name: 'delivery_address') String? get deliveryAddress;@JsonKey(name: 'delivery_slot') String? get deliverySlot;@JsonKey(name: 'delivery_date') DateTime? get deliveryDate;@JsonKey(name: 'payment_method') String? get paymentMethod;@JsonKey(name: 'payment_status') String? get paymentStatus; String? get notes;@JsonKey(name: 'created_at') DateTime get createdAt;
/// Create a copy of OrderModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$OrderModelCopyWith<OrderModel> get copyWith => _$OrderModelCopyWithImpl<OrderModel>(this as OrderModel, _$identity);

  /// Serializes this OrderModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is OrderModel&&(identical(other.id, id) || other.id == id)&&(identical(other.mongoId, mongoId) || other.mongoId == mongoId)&&(identical(other.userId, userId) || other.userId == userId)&&(identical(other.userName, userName) || other.userName == userName)&&(identical(other.userPhone, userPhone) || other.userPhone == userPhone)&&const DeepCollectionEquality().equals(other.items, items)&&(identical(other.subtotal, subtotal) || other.subtotal == subtotal)&&(identical(other.deliveryFee, deliveryFee) || other.deliveryFee == deliveryFee)&&(identical(other.total, total) || other.total == total)&&(identical(other.status, status) || other.status == status)&&(identical(other.deliveryAddress, deliveryAddress) || other.deliveryAddress == deliveryAddress)&&(identical(other.deliverySlot, deliverySlot) || other.deliverySlot == deliverySlot)&&(identical(other.deliveryDate, deliveryDate) || other.deliveryDate == deliveryDate)&&(identical(other.paymentMethod, paymentMethod) || other.paymentMethod == paymentMethod)&&(identical(other.paymentStatus, paymentStatus) || other.paymentStatus == paymentStatus)&&(identical(other.notes, notes) || other.notes == notes)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,mongoId,userId,userName,userPhone,const DeepCollectionEquality().hash(items),subtotal,deliveryFee,total,status,deliveryAddress,deliverySlot,deliveryDate,paymentMethod,paymentStatus,notes,createdAt);

@override
String toString() {
  return 'OrderModel(id: $id, mongoId: $mongoId, userId: $userId, userName: $userName, userPhone: $userPhone, items: $items, subtotal: $subtotal, deliveryFee: $deliveryFee, total: $total, status: $status, deliveryAddress: $deliveryAddress, deliverySlot: $deliverySlot, deliveryDate: $deliveryDate, paymentMethod: $paymentMethod, paymentStatus: $paymentStatus, notes: $notes, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class $OrderModelCopyWith<$Res>  {
  factory $OrderModelCopyWith(OrderModel value, $Res Function(OrderModel) _then) = _$OrderModelCopyWithImpl;
@useResult
$Res call({
@JsonKey(name: 'id') String? id,@JsonKey(name: '_id') String? mongoId,@JsonKey(name: 'user_id') String userId,@JsonKey(name: 'user_name') String? userName,@JsonKey(name: 'user_phone') String? userPhone, List<OrderItemModel> items, double subtotal,@JsonKey(name: 'delivery_fee') double deliveryFee, double total, String status,@JsonKey(name: 'delivery_address') String? deliveryAddress,@JsonKey(name: 'delivery_slot') String? deliverySlot,@JsonKey(name: 'delivery_date') DateTime? deliveryDate,@JsonKey(name: 'payment_method') String? paymentMethod,@JsonKey(name: 'payment_status') String? paymentStatus, String? notes,@JsonKey(name: 'created_at') DateTime createdAt
});




}
/// @nodoc
class _$OrderModelCopyWithImpl<$Res>
    implements $OrderModelCopyWith<$Res> {
  _$OrderModelCopyWithImpl(this._self, this._then);

  final OrderModel _self;
  final $Res Function(OrderModel) _then;

/// Create a copy of OrderModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = freezed,Object? mongoId = freezed,Object? userId = null,Object? userName = freezed,Object? userPhone = freezed,Object? items = null,Object? subtotal = null,Object? deliveryFee = null,Object? total = null,Object? status = null,Object? deliveryAddress = freezed,Object? deliverySlot = freezed,Object? deliveryDate = freezed,Object? paymentMethod = freezed,Object? paymentStatus = freezed,Object? notes = freezed,Object? createdAt = null,}) {
  return _then(_self.copyWith(
id: freezed == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String?,mongoId: freezed == mongoId ? _self.mongoId : mongoId // ignore: cast_nullable_to_non_nullable
as String?,userId: null == userId ? _self.userId : userId // ignore: cast_nullable_to_non_nullable
as String,userName: freezed == userName ? _self.userName : userName // ignore: cast_nullable_to_non_nullable
as String?,userPhone: freezed == userPhone ? _self.userPhone : userPhone // ignore: cast_nullable_to_non_nullable
as String?,items: null == items ? _self.items : items // ignore: cast_nullable_to_non_nullable
as List<OrderItemModel>,subtotal: null == subtotal ? _self.subtotal : subtotal // ignore: cast_nullable_to_non_nullable
as double,deliveryFee: null == deliveryFee ? _self.deliveryFee : deliveryFee // ignore: cast_nullable_to_non_nullable
as double,total: null == total ? _self.total : total // ignore: cast_nullable_to_non_nullable
as double,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,deliveryAddress: freezed == deliveryAddress ? _self.deliveryAddress : deliveryAddress // ignore: cast_nullable_to_non_nullable
as String?,deliverySlot: freezed == deliverySlot ? _self.deliverySlot : deliverySlot // ignore: cast_nullable_to_non_nullable
as String?,deliveryDate: freezed == deliveryDate ? _self.deliveryDate : deliveryDate // ignore: cast_nullable_to_non_nullable
as DateTime?,paymentMethod: freezed == paymentMethod ? _self.paymentMethod : paymentMethod // ignore: cast_nullable_to_non_nullable
as String?,paymentStatus: freezed == paymentStatus ? _self.paymentStatus : paymentStatus // ignore: cast_nullable_to_non_nullable
as String?,notes: freezed == notes ? _self.notes : notes // ignore: cast_nullable_to_non_nullable
as String?,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,
  ));
}

}


/// Adds pattern-matching-related methods to [OrderModel].
extension OrderModelPatterns on OrderModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _OrderModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _OrderModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _OrderModel value)  $default,){
final _that = this;
switch (_that) {
case _OrderModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _OrderModel value)?  $default,){
final _that = this;
switch (_that) {
case _OrderModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(name: 'id')  String? id, @JsonKey(name: '_id')  String? mongoId, @JsonKey(name: 'user_id')  String userId, @JsonKey(name: 'user_name')  String? userName, @JsonKey(name: 'user_phone')  String? userPhone,  List<OrderItemModel> items,  double subtotal, @JsonKey(name: 'delivery_fee')  double deliveryFee,  double total,  String status, @JsonKey(name: 'delivery_address')  String? deliveryAddress, @JsonKey(name: 'delivery_slot')  String? deliverySlot, @JsonKey(name: 'delivery_date')  DateTime? deliveryDate, @JsonKey(name: 'payment_method')  String? paymentMethod, @JsonKey(name: 'payment_status')  String? paymentStatus,  String? notes, @JsonKey(name: 'created_at')  DateTime createdAt)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _OrderModel() when $default != null:
return $default(_that.id,_that.mongoId,_that.userId,_that.userName,_that.userPhone,_that.items,_that.subtotal,_that.deliveryFee,_that.total,_that.status,_that.deliveryAddress,_that.deliverySlot,_that.deliveryDate,_that.paymentMethod,_that.paymentStatus,_that.notes,_that.createdAt);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(name: 'id')  String? id, @JsonKey(name: '_id')  String? mongoId, @JsonKey(name: 'user_id')  String userId, @JsonKey(name: 'user_name')  String? userName, @JsonKey(name: 'user_phone')  String? userPhone,  List<OrderItemModel> items,  double subtotal, @JsonKey(name: 'delivery_fee')  double deliveryFee,  double total,  String status, @JsonKey(name: 'delivery_address')  String? deliveryAddress, @JsonKey(name: 'delivery_slot')  String? deliverySlot, @JsonKey(name: 'delivery_date')  DateTime? deliveryDate, @JsonKey(name: 'payment_method')  String? paymentMethod, @JsonKey(name: 'payment_status')  String? paymentStatus,  String? notes, @JsonKey(name: 'created_at')  DateTime createdAt)  $default,) {final _that = this;
switch (_that) {
case _OrderModel():
return $default(_that.id,_that.mongoId,_that.userId,_that.userName,_that.userPhone,_that.items,_that.subtotal,_that.deliveryFee,_that.total,_that.status,_that.deliveryAddress,_that.deliverySlot,_that.deliveryDate,_that.paymentMethod,_that.paymentStatus,_that.notes,_that.createdAt);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(name: 'id')  String? id, @JsonKey(name: '_id')  String? mongoId, @JsonKey(name: 'user_id')  String userId, @JsonKey(name: 'user_name')  String? userName, @JsonKey(name: 'user_phone')  String? userPhone,  List<OrderItemModel> items,  double subtotal, @JsonKey(name: 'delivery_fee')  double deliveryFee,  double total,  String status, @JsonKey(name: 'delivery_address')  String? deliveryAddress, @JsonKey(name: 'delivery_slot')  String? deliverySlot, @JsonKey(name: 'delivery_date')  DateTime? deliveryDate, @JsonKey(name: 'payment_method')  String? paymentMethod, @JsonKey(name: 'payment_status')  String? paymentStatus,  String? notes, @JsonKey(name: 'created_at')  DateTime createdAt)?  $default,) {final _that = this;
switch (_that) {
case _OrderModel() when $default != null:
return $default(_that.id,_that.mongoId,_that.userId,_that.userName,_that.userPhone,_that.items,_that.subtotal,_that.deliveryFee,_that.total,_that.status,_that.deliveryAddress,_that.deliverySlot,_that.deliveryDate,_that.paymentMethod,_that.paymentStatus,_that.notes,_that.createdAt);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _OrderModel implements OrderModel {
  const _OrderModel({@JsonKey(name: 'id') this.id, @JsonKey(name: '_id') this.mongoId, @JsonKey(name: 'user_id') required this.userId, @JsonKey(name: 'user_name') this.userName, @JsonKey(name: 'user_phone') this.userPhone, final  List<OrderItemModel> items = const [], this.subtotal = 0, @JsonKey(name: 'delivery_fee') this.deliveryFee = 0, this.total = 0, this.status = 'pending', @JsonKey(name: 'delivery_address') this.deliveryAddress, @JsonKey(name: 'delivery_slot') this.deliverySlot, @JsonKey(name: 'delivery_date') this.deliveryDate, @JsonKey(name: 'payment_method') this.paymentMethod, @JsonKey(name: 'payment_status') this.paymentStatus, this.notes, @JsonKey(name: 'created_at') required this.createdAt}): _items = items;
  factory _OrderModel.fromJson(Map<String, dynamic> json) => _$OrderModelFromJson(json);

@override@JsonKey(name: 'id') final  String? id;
@override@JsonKey(name: '_id') final  String? mongoId;
@override@JsonKey(name: 'user_id') final  String userId;
@override@JsonKey(name: 'user_name') final  String? userName;
@override@JsonKey(name: 'user_phone') final  String? userPhone;
 final  List<OrderItemModel> _items;
@override@JsonKey() List<OrderItemModel> get items {
  if (_items is EqualUnmodifiableListView) return _items;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_items);
}

@override@JsonKey() final  double subtotal;
@override@JsonKey(name: 'delivery_fee') final  double deliveryFee;
@override@JsonKey() final  double total;
@override@JsonKey() final  String status;
@override@JsonKey(name: 'delivery_address') final  String? deliveryAddress;
@override@JsonKey(name: 'delivery_slot') final  String? deliverySlot;
@override@JsonKey(name: 'delivery_date') final  DateTime? deliveryDate;
@override@JsonKey(name: 'payment_method') final  String? paymentMethod;
@override@JsonKey(name: 'payment_status') final  String? paymentStatus;
@override final  String? notes;
@override@JsonKey(name: 'created_at') final  DateTime createdAt;

/// Create a copy of OrderModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$OrderModelCopyWith<_OrderModel> get copyWith => __$OrderModelCopyWithImpl<_OrderModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$OrderModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _OrderModel&&(identical(other.id, id) || other.id == id)&&(identical(other.mongoId, mongoId) || other.mongoId == mongoId)&&(identical(other.userId, userId) || other.userId == userId)&&(identical(other.userName, userName) || other.userName == userName)&&(identical(other.userPhone, userPhone) || other.userPhone == userPhone)&&const DeepCollectionEquality().equals(other._items, _items)&&(identical(other.subtotal, subtotal) || other.subtotal == subtotal)&&(identical(other.deliveryFee, deliveryFee) || other.deliveryFee == deliveryFee)&&(identical(other.total, total) || other.total == total)&&(identical(other.status, status) || other.status == status)&&(identical(other.deliveryAddress, deliveryAddress) || other.deliveryAddress == deliveryAddress)&&(identical(other.deliverySlot, deliverySlot) || other.deliverySlot == deliverySlot)&&(identical(other.deliveryDate, deliveryDate) || other.deliveryDate == deliveryDate)&&(identical(other.paymentMethod, paymentMethod) || other.paymentMethod == paymentMethod)&&(identical(other.paymentStatus, paymentStatus) || other.paymentStatus == paymentStatus)&&(identical(other.notes, notes) || other.notes == notes)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,mongoId,userId,userName,userPhone,const DeepCollectionEquality().hash(_items),subtotal,deliveryFee,total,status,deliveryAddress,deliverySlot,deliveryDate,paymentMethod,paymentStatus,notes,createdAt);

@override
String toString() {
  return 'OrderModel(id: $id, mongoId: $mongoId, userId: $userId, userName: $userName, userPhone: $userPhone, items: $items, subtotal: $subtotal, deliveryFee: $deliveryFee, total: $total, status: $status, deliveryAddress: $deliveryAddress, deliverySlot: $deliverySlot, deliveryDate: $deliveryDate, paymentMethod: $paymentMethod, paymentStatus: $paymentStatus, notes: $notes, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class _$OrderModelCopyWith<$Res> implements $OrderModelCopyWith<$Res> {
  factory _$OrderModelCopyWith(_OrderModel value, $Res Function(_OrderModel) _then) = __$OrderModelCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(name: 'id') String? id,@JsonKey(name: '_id') String? mongoId,@JsonKey(name: 'user_id') String userId,@JsonKey(name: 'user_name') String? userName,@JsonKey(name: 'user_phone') String? userPhone, List<OrderItemModel> items, double subtotal,@JsonKey(name: 'delivery_fee') double deliveryFee, double total, String status,@JsonKey(name: 'delivery_address') String? deliveryAddress,@JsonKey(name: 'delivery_slot') String? deliverySlot,@JsonKey(name: 'delivery_date') DateTime? deliveryDate,@JsonKey(name: 'payment_method') String? paymentMethod,@JsonKey(name: 'payment_status') String? paymentStatus, String? notes,@JsonKey(name: 'created_at') DateTime createdAt
});




}
/// @nodoc
class __$OrderModelCopyWithImpl<$Res>
    implements _$OrderModelCopyWith<$Res> {
  __$OrderModelCopyWithImpl(this._self, this._then);

  final _OrderModel _self;
  final $Res Function(_OrderModel) _then;

/// Create a copy of OrderModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = freezed,Object? mongoId = freezed,Object? userId = null,Object? userName = freezed,Object? userPhone = freezed,Object? items = null,Object? subtotal = null,Object? deliveryFee = null,Object? total = null,Object? status = null,Object? deliveryAddress = freezed,Object? deliverySlot = freezed,Object? deliveryDate = freezed,Object? paymentMethod = freezed,Object? paymentStatus = freezed,Object? notes = freezed,Object? createdAt = null,}) {
  return _then(_OrderModel(
id: freezed == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String?,mongoId: freezed == mongoId ? _self.mongoId : mongoId // ignore: cast_nullable_to_non_nullable
as String?,userId: null == userId ? _self.userId : userId // ignore: cast_nullable_to_non_nullable
as String,userName: freezed == userName ? _self.userName : userName // ignore: cast_nullable_to_non_nullable
as String?,userPhone: freezed == userPhone ? _self.userPhone : userPhone // ignore: cast_nullable_to_non_nullable
as String?,items: null == items ? _self._items : items // ignore: cast_nullable_to_non_nullable
as List<OrderItemModel>,subtotal: null == subtotal ? _self.subtotal : subtotal // ignore: cast_nullable_to_non_nullable
as double,deliveryFee: null == deliveryFee ? _self.deliveryFee : deliveryFee // ignore: cast_nullable_to_non_nullable
as double,total: null == total ? _self.total : total // ignore: cast_nullable_to_non_nullable
as double,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,deliveryAddress: freezed == deliveryAddress ? _self.deliveryAddress : deliveryAddress // ignore: cast_nullable_to_non_nullable
as String?,deliverySlot: freezed == deliverySlot ? _self.deliverySlot : deliverySlot // ignore: cast_nullable_to_non_nullable
as String?,deliveryDate: freezed == deliveryDate ? _self.deliveryDate : deliveryDate // ignore: cast_nullable_to_non_nullable
as DateTime?,paymentMethod: freezed == paymentMethod ? _self.paymentMethod : paymentMethod // ignore: cast_nullable_to_non_nullable
as String?,paymentStatus: freezed == paymentStatus ? _self.paymentStatus : paymentStatus // ignore: cast_nullable_to_non_nullable
as String?,notes: freezed == notes ? _self.notes : notes // ignore: cast_nullable_to_non_nullable
as String?,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime,
  ));
}


}


/// @nodoc
mixin _$OrderItemModel {

@JsonKey(name: 'product_id') String get productId;@JsonKey(name: 'product_name') String get productName; double get price; double get quantity; String get unit; double get total;
/// Create a copy of OrderItemModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$OrderItemModelCopyWith<OrderItemModel> get copyWith => _$OrderItemModelCopyWithImpl<OrderItemModel>(this as OrderItemModel, _$identity);

  /// Serializes this OrderItemModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is OrderItemModel&&(identical(other.productId, productId) || other.productId == productId)&&(identical(other.productName, productName) || other.productName == productName)&&(identical(other.price, price) || other.price == price)&&(identical(other.quantity, quantity) || other.quantity == quantity)&&(identical(other.unit, unit) || other.unit == unit)&&(identical(other.total, total) || other.total == total));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,productId,productName,price,quantity,unit,total);

@override
String toString() {
  return 'OrderItemModel(productId: $productId, productName: $productName, price: $price, quantity: $quantity, unit: $unit, total: $total)';
}


}

/// @nodoc
abstract mixin class $OrderItemModelCopyWith<$Res>  {
  factory $OrderItemModelCopyWith(OrderItemModel value, $Res Function(OrderItemModel) _then) = _$OrderItemModelCopyWithImpl;
@useResult
$Res call({
@JsonKey(name: 'product_id') String productId,@JsonKey(name: 'product_name') String productName, double price, double quantity, String unit, double total
});




}
/// @nodoc
class _$OrderItemModelCopyWithImpl<$Res>
    implements $OrderItemModelCopyWith<$Res> {
  _$OrderItemModelCopyWithImpl(this._self, this._then);

  final OrderItemModel _self;
  final $Res Function(OrderItemModel) _then;

/// Create a copy of OrderItemModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? productId = null,Object? productName = null,Object? price = null,Object? quantity = null,Object? unit = null,Object? total = null,}) {
  return _then(_self.copyWith(
productId: null == productId ? _self.productId : productId // ignore: cast_nullable_to_non_nullable
as String,productName: null == productName ? _self.productName : productName // ignore: cast_nullable_to_non_nullable
as String,price: null == price ? _self.price : price // ignore: cast_nullable_to_non_nullable
as double,quantity: null == quantity ? _self.quantity : quantity // ignore: cast_nullable_to_non_nullable
as double,unit: null == unit ? _self.unit : unit // ignore: cast_nullable_to_non_nullable
as String,total: null == total ? _self.total : total // ignore: cast_nullable_to_non_nullable
as double,
  ));
}

}


/// Adds pattern-matching-related methods to [OrderItemModel].
extension OrderItemModelPatterns on OrderItemModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _OrderItemModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _OrderItemModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _OrderItemModel value)  $default,){
final _that = this;
switch (_that) {
case _OrderItemModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _OrderItemModel value)?  $default,){
final _that = this;
switch (_that) {
case _OrderItemModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(name: 'product_id')  String productId, @JsonKey(name: 'product_name')  String productName,  double price,  double quantity,  String unit,  double total)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _OrderItemModel() when $default != null:
return $default(_that.productId,_that.productName,_that.price,_that.quantity,_that.unit,_that.total);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(name: 'product_id')  String productId, @JsonKey(name: 'product_name')  String productName,  double price,  double quantity,  String unit,  double total)  $default,) {final _that = this;
switch (_that) {
case _OrderItemModel():
return $default(_that.productId,_that.productName,_that.price,_that.quantity,_that.unit,_that.total);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(name: 'product_id')  String productId, @JsonKey(name: 'product_name')  String productName,  double price,  double quantity,  String unit,  double total)?  $default,) {final _that = this;
switch (_that) {
case _OrderItemModel() when $default != null:
return $default(_that.productId,_that.productName,_that.price,_that.quantity,_that.unit,_that.total);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _OrderItemModel implements OrderItemModel {
  const _OrderItemModel({@JsonKey(name: 'product_id') required this.productId, @JsonKey(name: 'product_name') required this.productName, required this.price, required this.quantity, this.unit = 'kg', required this.total});
  factory _OrderItemModel.fromJson(Map<String, dynamic> json) => _$OrderItemModelFromJson(json);

@override@JsonKey(name: 'product_id') final  String productId;
@override@JsonKey(name: 'product_name') final  String productName;
@override final  double price;
@override final  double quantity;
@override@JsonKey() final  String unit;
@override final  double total;

/// Create a copy of OrderItemModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$OrderItemModelCopyWith<_OrderItemModel> get copyWith => __$OrderItemModelCopyWithImpl<_OrderItemModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$OrderItemModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _OrderItemModel&&(identical(other.productId, productId) || other.productId == productId)&&(identical(other.productName, productName) || other.productName == productName)&&(identical(other.price, price) || other.price == price)&&(identical(other.quantity, quantity) || other.quantity == quantity)&&(identical(other.unit, unit) || other.unit == unit)&&(identical(other.total, total) || other.total == total));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,productId,productName,price,quantity,unit,total);

@override
String toString() {
  return 'OrderItemModel(productId: $productId, productName: $productName, price: $price, quantity: $quantity, unit: $unit, total: $total)';
}


}

/// @nodoc
abstract mixin class _$OrderItemModelCopyWith<$Res> implements $OrderItemModelCopyWith<$Res> {
  factory _$OrderItemModelCopyWith(_OrderItemModel value, $Res Function(_OrderItemModel) _then) = __$OrderItemModelCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(name: 'product_id') String productId,@JsonKey(name: 'product_name') String productName, double price, double quantity, String unit, double total
});




}
/// @nodoc
class __$OrderItemModelCopyWithImpl<$Res>
    implements _$OrderItemModelCopyWith<$Res> {
  __$OrderItemModelCopyWithImpl(this._self, this._then);

  final _OrderItemModel _self;
  final $Res Function(_OrderItemModel) _then;

/// Create a copy of OrderItemModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? productId = null,Object? productName = null,Object? price = null,Object? quantity = null,Object? unit = null,Object? total = null,}) {
  return _then(_OrderItemModel(
productId: null == productId ? _self.productId : productId // ignore: cast_nullable_to_non_nullable
as String,productName: null == productName ? _self.productName : productName // ignore: cast_nullable_to_non_nullable
as String,price: null == price ? _self.price : price // ignore: cast_nullable_to_non_nullable
as double,quantity: null == quantity ? _self.quantity : quantity // ignore: cast_nullable_to_non_nullable
as double,unit: null == unit ? _self.unit : unit // ignore: cast_nullable_to_non_nullable
as String,total: null == total ? _self.total : total // ignore: cast_nullable_to_non_nullable
as double,
  ));
}


}

// dart format on
