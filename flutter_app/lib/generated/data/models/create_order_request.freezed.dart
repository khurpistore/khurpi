// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of '../../../data/models/create_order_request.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$CreateOrderRequest {

 List<OrderItemRequest> get items;@JsonKey(name: 'delivery_address') String get deliveryAddress; String get city; String get pincode; String get phone;@JsonKey(name: 'payment_method') String get paymentMethod; String? get notes;// Delivery options
@JsonKey(name: 'delivery_type') String? get deliveryType;@JsonKey(name: 'delivery_date') String? get deliveryDate;@JsonKey(name: 'delivery_slot_id') String? get deliverySlotId;
/// Create a copy of CreateOrderRequest
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$CreateOrderRequestCopyWith<CreateOrderRequest> get copyWith => _$CreateOrderRequestCopyWithImpl<CreateOrderRequest>(this as CreateOrderRequest, _$identity);

  /// Serializes this CreateOrderRequest to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is CreateOrderRequest&&const DeepCollectionEquality().equals(other.items, items)&&(identical(other.deliveryAddress, deliveryAddress) || other.deliveryAddress == deliveryAddress)&&(identical(other.city, city) || other.city == city)&&(identical(other.pincode, pincode) || other.pincode == pincode)&&(identical(other.phone, phone) || other.phone == phone)&&(identical(other.paymentMethod, paymentMethod) || other.paymentMethod == paymentMethod)&&(identical(other.notes, notes) || other.notes == notes)&&(identical(other.deliveryType, deliveryType) || other.deliveryType == deliveryType)&&(identical(other.deliveryDate, deliveryDate) || other.deliveryDate == deliveryDate)&&(identical(other.deliverySlotId, deliverySlotId) || other.deliverySlotId == deliverySlotId));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,const DeepCollectionEquality().hash(items),deliveryAddress,city,pincode,phone,paymentMethod,notes,deliveryType,deliveryDate,deliverySlotId);

@override
String toString() {
  return 'CreateOrderRequest(items: $items, deliveryAddress: $deliveryAddress, city: $city, pincode: $pincode, phone: $phone, paymentMethod: $paymentMethod, notes: $notes, deliveryType: $deliveryType, deliveryDate: $deliveryDate, deliverySlotId: $deliverySlotId)';
}


}

/// @nodoc
abstract mixin class $CreateOrderRequestCopyWith<$Res>  {
  factory $CreateOrderRequestCopyWith(CreateOrderRequest value, $Res Function(CreateOrderRequest) _then) = _$CreateOrderRequestCopyWithImpl;
@useResult
$Res call({
 List<OrderItemRequest> items,@JsonKey(name: 'delivery_address') String deliveryAddress, String city, String pincode, String phone,@JsonKey(name: 'payment_method') String paymentMethod, String? notes,@JsonKey(name: 'delivery_type') String? deliveryType,@JsonKey(name: 'delivery_date') String? deliveryDate,@JsonKey(name: 'delivery_slot_id') String? deliverySlotId
});




}
/// @nodoc
class _$CreateOrderRequestCopyWithImpl<$Res>
    implements $CreateOrderRequestCopyWith<$Res> {
  _$CreateOrderRequestCopyWithImpl(this._self, this._then);

  final CreateOrderRequest _self;
  final $Res Function(CreateOrderRequest) _then;

/// Create a copy of CreateOrderRequest
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? items = null,Object? deliveryAddress = null,Object? city = null,Object? pincode = null,Object? phone = null,Object? paymentMethod = null,Object? notes = freezed,Object? deliveryType = freezed,Object? deliveryDate = freezed,Object? deliverySlotId = freezed,}) {
  return _then(_self.copyWith(
items: null == items ? _self.items : items // ignore: cast_nullable_to_non_nullable
as List<OrderItemRequest>,deliveryAddress: null == deliveryAddress ? _self.deliveryAddress : deliveryAddress // ignore: cast_nullable_to_non_nullable
as String,city: null == city ? _self.city : city // ignore: cast_nullable_to_non_nullable
as String,pincode: null == pincode ? _self.pincode : pincode // ignore: cast_nullable_to_non_nullable
as String,phone: null == phone ? _self.phone : phone // ignore: cast_nullable_to_non_nullable
as String,paymentMethod: null == paymentMethod ? _self.paymentMethod : paymentMethod // ignore: cast_nullable_to_non_nullable
as String,notes: freezed == notes ? _self.notes : notes // ignore: cast_nullable_to_non_nullable
as String?,deliveryType: freezed == deliveryType ? _self.deliveryType : deliveryType // ignore: cast_nullable_to_non_nullable
as String?,deliveryDate: freezed == deliveryDate ? _self.deliveryDate : deliveryDate // ignore: cast_nullable_to_non_nullable
as String?,deliverySlotId: freezed == deliverySlotId ? _self.deliverySlotId : deliverySlotId // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [CreateOrderRequest].
extension CreateOrderRequestPatterns on CreateOrderRequest {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _CreateOrderRequest value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _CreateOrderRequest() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _CreateOrderRequest value)  $default,){
final _that = this;
switch (_that) {
case _CreateOrderRequest():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _CreateOrderRequest value)?  $default,){
final _that = this;
switch (_that) {
case _CreateOrderRequest() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( List<OrderItemRequest> items, @JsonKey(name: 'delivery_address')  String deliveryAddress,  String city,  String pincode,  String phone, @JsonKey(name: 'payment_method')  String paymentMethod,  String? notes, @JsonKey(name: 'delivery_type')  String? deliveryType, @JsonKey(name: 'delivery_date')  String? deliveryDate, @JsonKey(name: 'delivery_slot_id')  String? deliverySlotId)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _CreateOrderRequest() when $default != null:
return $default(_that.items,_that.deliveryAddress,_that.city,_that.pincode,_that.phone,_that.paymentMethod,_that.notes,_that.deliveryType,_that.deliveryDate,_that.deliverySlotId);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( List<OrderItemRequest> items, @JsonKey(name: 'delivery_address')  String deliveryAddress,  String city,  String pincode,  String phone, @JsonKey(name: 'payment_method')  String paymentMethod,  String? notes, @JsonKey(name: 'delivery_type')  String? deliveryType, @JsonKey(name: 'delivery_date')  String? deliveryDate, @JsonKey(name: 'delivery_slot_id')  String? deliverySlotId)  $default,) {final _that = this;
switch (_that) {
case _CreateOrderRequest():
return $default(_that.items,_that.deliveryAddress,_that.city,_that.pincode,_that.phone,_that.paymentMethod,_that.notes,_that.deliveryType,_that.deliveryDate,_that.deliverySlotId);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( List<OrderItemRequest> items, @JsonKey(name: 'delivery_address')  String deliveryAddress,  String city,  String pincode,  String phone, @JsonKey(name: 'payment_method')  String paymentMethod,  String? notes, @JsonKey(name: 'delivery_type')  String? deliveryType, @JsonKey(name: 'delivery_date')  String? deliveryDate, @JsonKey(name: 'delivery_slot_id')  String? deliverySlotId)?  $default,) {final _that = this;
switch (_that) {
case _CreateOrderRequest() when $default != null:
return $default(_that.items,_that.deliveryAddress,_that.city,_that.pincode,_that.phone,_that.paymentMethod,_that.notes,_that.deliveryType,_that.deliveryDate,_that.deliverySlotId);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _CreateOrderRequest implements CreateOrderRequest {
  const _CreateOrderRequest({required final  List<OrderItemRequest> items, @JsonKey(name: 'delivery_address') required this.deliveryAddress, required this.city, required this.pincode, required this.phone, @JsonKey(name: 'payment_method') required this.paymentMethod, this.notes, @JsonKey(name: 'delivery_type') this.deliveryType, @JsonKey(name: 'delivery_date') this.deliveryDate, @JsonKey(name: 'delivery_slot_id') this.deliverySlotId}): _items = items;
  factory _CreateOrderRequest.fromJson(Map<String, dynamic> json) => _$CreateOrderRequestFromJson(json);

 final  List<OrderItemRequest> _items;
@override List<OrderItemRequest> get items {
  if (_items is EqualUnmodifiableListView) return _items;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_items);
}

@override@JsonKey(name: 'delivery_address') final  String deliveryAddress;
@override final  String city;
@override final  String pincode;
@override final  String phone;
@override@JsonKey(name: 'payment_method') final  String paymentMethod;
@override final  String? notes;
// Delivery options
@override@JsonKey(name: 'delivery_type') final  String? deliveryType;
@override@JsonKey(name: 'delivery_date') final  String? deliveryDate;
@override@JsonKey(name: 'delivery_slot_id') final  String? deliverySlotId;

/// Create a copy of CreateOrderRequest
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$CreateOrderRequestCopyWith<_CreateOrderRequest> get copyWith => __$CreateOrderRequestCopyWithImpl<_CreateOrderRequest>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$CreateOrderRequestToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _CreateOrderRequest&&const DeepCollectionEquality().equals(other._items, _items)&&(identical(other.deliveryAddress, deliveryAddress) || other.deliveryAddress == deliveryAddress)&&(identical(other.city, city) || other.city == city)&&(identical(other.pincode, pincode) || other.pincode == pincode)&&(identical(other.phone, phone) || other.phone == phone)&&(identical(other.paymentMethod, paymentMethod) || other.paymentMethod == paymentMethod)&&(identical(other.notes, notes) || other.notes == notes)&&(identical(other.deliveryType, deliveryType) || other.deliveryType == deliveryType)&&(identical(other.deliveryDate, deliveryDate) || other.deliveryDate == deliveryDate)&&(identical(other.deliverySlotId, deliverySlotId) || other.deliverySlotId == deliverySlotId));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,const DeepCollectionEquality().hash(_items),deliveryAddress,city,pincode,phone,paymentMethod,notes,deliveryType,deliveryDate,deliverySlotId);

@override
String toString() {
  return 'CreateOrderRequest(items: $items, deliveryAddress: $deliveryAddress, city: $city, pincode: $pincode, phone: $phone, paymentMethod: $paymentMethod, notes: $notes, deliveryType: $deliveryType, deliveryDate: $deliveryDate, deliverySlotId: $deliverySlotId)';
}


}

/// @nodoc
abstract mixin class _$CreateOrderRequestCopyWith<$Res> implements $CreateOrderRequestCopyWith<$Res> {
  factory _$CreateOrderRequestCopyWith(_CreateOrderRequest value, $Res Function(_CreateOrderRequest) _then) = __$CreateOrderRequestCopyWithImpl;
@override @useResult
$Res call({
 List<OrderItemRequest> items,@JsonKey(name: 'delivery_address') String deliveryAddress, String city, String pincode, String phone,@JsonKey(name: 'payment_method') String paymentMethod, String? notes,@JsonKey(name: 'delivery_type') String? deliveryType,@JsonKey(name: 'delivery_date') String? deliveryDate,@JsonKey(name: 'delivery_slot_id') String? deliverySlotId
});




}
/// @nodoc
class __$CreateOrderRequestCopyWithImpl<$Res>
    implements _$CreateOrderRequestCopyWith<$Res> {
  __$CreateOrderRequestCopyWithImpl(this._self, this._then);

  final _CreateOrderRequest _self;
  final $Res Function(_CreateOrderRequest) _then;

/// Create a copy of CreateOrderRequest
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? items = null,Object? deliveryAddress = null,Object? city = null,Object? pincode = null,Object? phone = null,Object? paymentMethod = null,Object? notes = freezed,Object? deliveryType = freezed,Object? deliveryDate = freezed,Object? deliverySlotId = freezed,}) {
  return _then(_CreateOrderRequest(
items: null == items ? _self._items : items // ignore: cast_nullable_to_non_nullable
as List<OrderItemRequest>,deliveryAddress: null == deliveryAddress ? _self.deliveryAddress : deliveryAddress // ignore: cast_nullable_to_non_nullable
as String,city: null == city ? _self.city : city // ignore: cast_nullable_to_non_nullable
as String,pincode: null == pincode ? _self.pincode : pincode // ignore: cast_nullable_to_non_nullable
as String,phone: null == phone ? _self.phone : phone // ignore: cast_nullable_to_non_nullable
as String,paymentMethod: null == paymentMethod ? _self.paymentMethod : paymentMethod // ignore: cast_nullable_to_non_nullable
as String,notes: freezed == notes ? _self.notes : notes // ignore: cast_nullable_to_non_nullable
as String?,deliveryType: freezed == deliveryType ? _self.deliveryType : deliveryType // ignore: cast_nullable_to_non_nullable
as String?,deliveryDate: freezed == deliveryDate ? _self.deliveryDate : deliveryDate // ignore: cast_nullable_to_non_nullable
as String?,deliverySlotId: freezed == deliverySlotId ? _self.deliverySlotId : deliverySlotId // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}


/// @nodoc
mixin _$OrderItemRequest {

@JsonKey(name: 'product_id') String get productId; double get quantity; String get unit;
/// Create a copy of OrderItemRequest
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$OrderItemRequestCopyWith<OrderItemRequest> get copyWith => _$OrderItemRequestCopyWithImpl<OrderItemRequest>(this as OrderItemRequest, _$identity);

  /// Serializes this OrderItemRequest to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is OrderItemRequest&&(identical(other.productId, productId) || other.productId == productId)&&(identical(other.quantity, quantity) || other.quantity == quantity)&&(identical(other.unit, unit) || other.unit == unit));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,productId,quantity,unit);

@override
String toString() {
  return 'OrderItemRequest(productId: $productId, quantity: $quantity, unit: $unit)';
}


}

/// @nodoc
abstract mixin class $OrderItemRequestCopyWith<$Res>  {
  factory $OrderItemRequestCopyWith(OrderItemRequest value, $Res Function(OrderItemRequest) _then) = _$OrderItemRequestCopyWithImpl;
@useResult
$Res call({
@JsonKey(name: 'product_id') String productId, double quantity, String unit
});




}
/// @nodoc
class _$OrderItemRequestCopyWithImpl<$Res>
    implements $OrderItemRequestCopyWith<$Res> {
  _$OrderItemRequestCopyWithImpl(this._self, this._then);

  final OrderItemRequest _self;
  final $Res Function(OrderItemRequest) _then;

/// Create a copy of OrderItemRequest
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? productId = null,Object? quantity = null,Object? unit = null,}) {
  return _then(_self.copyWith(
productId: null == productId ? _self.productId : productId // ignore: cast_nullable_to_non_nullable
as String,quantity: null == quantity ? _self.quantity : quantity // ignore: cast_nullable_to_non_nullable
as double,unit: null == unit ? _self.unit : unit // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [OrderItemRequest].
extension OrderItemRequestPatterns on OrderItemRequest {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _OrderItemRequest value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _OrderItemRequest() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _OrderItemRequest value)  $default,){
final _that = this;
switch (_that) {
case _OrderItemRequest():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _OrderItemRequest value)?  $default,){
final _that = this;
switch (_that) {
case _OrderItemRequest() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(name: 'product_id')  String productId,  double quantity,  String unit)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _OrderItemRequest() when $default != null:
return $default(_that.productId,_that.quantity,_that.unit);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(name: 'product_id')  String productId,  double quantity,  String unit)  $default,) {final _that = this;
switch (_that) {
case _OrderItemRequest():
return $default(_that.productId,_that.quantity,_that.unit);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(name: 'product_id')  String productId,  double quantity,  String unit)?  $default,) {final _that = this;
switch (_that) {
case _OrderItemRequest() when $default != null:
return $default(_that.productId,_that.quantity,_that.unit);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _OrderItemRequest implements OrderItemRequest {
  const _OrderItemRequest({@JsonKey(name: 'product_id') required this.productId, required this.quantity, required this.unit});
  factory _OrderItemRequest.fromJson(Map<String, dynamic> json) => _$OrderItemRequestFromJson(json);

@override@JsonKey(name: 'product_id') final  String productId;
@override final  double quantity;
@override final  String unit;

/// Create a copy of OrderItemRequest
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$OrderItemRequestCopyWith<_OrderItemRequest> get copyWith => __$OrderItemRequestCopyWithImpl<_OrderItemRequest>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$OrderItemRequestToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _OrderItemRequest&&(identical(other.productId, productId) || other.productId == productId)&&(identical(other.quantity, quantity) || other.quantity == quantity)&&(identical(other.unit, unit) || other.unit == unit));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,productId,quantity,unit);

@override
String toString() {
  return 'OrderItemRequest(productId: $productId, quantity: $quantity, unit: $unit)';
}


}

/// @nodoc
abstract mixin class _$OrderItemRequestCopyWith<$Res> implements $OrderItemRequestCopyWith<$Res> {
  factory _$OrderItemRequestCopyWith(_OrderItemRequest value, $Res Function(_OrderItemRequest) _then) = __$OrderItemRequestCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(name: 'product_id') String productId, double quantity, String unit
});




}
/// @nodoc
class __$OrderItemRequestCopyWithImpl<$Res>
    implements _$OrderItemRequestCopyWith<$Res> {
  __$OrderItemRequestCopyWithImpl(this._self, this._then);

  final _OrderItemRequest _self;
  final $Res Function(_OrderItemRequest) _then;

/// Create a copy of OrderItemRequest
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? productId = null,Object? quantity = null,Object? unit = null,}) {
  return _then(_OrderItemRequest(
productId: null == productId ? _self.productId : productId // ignore: cast_nullable_to_non_nullable
as String,quantity: null == quantity ? _self.quantity : quantity // ignore: cast_nullable_to_non_nullable
as double,unit: null == unit ? _self.unit : unit // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}

// dart format on
