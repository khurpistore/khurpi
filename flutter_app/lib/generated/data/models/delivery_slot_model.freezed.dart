// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of '../../../data/models/delivery_slot_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$DeliverySlotModel {

 String get id; String get name;@JsonKey(name: 'start_time') String get startTime;@JsonKey(name: 'end_time') String get endTime;@JsonKey(name: 'display_text') String? get displayText;@JsonKey(name: 'delivery_fee') double get deliveryFee;@JsonKey(name: 'max_orders') int get maxOrders;@JsonKey(name: 'display_order') int get displayOrder; bool get active;@JsonKey(name: 'available_days') List<String>? get availableDays;// Runtime fields returned by the API when querying for a specific date
 bool get available;@JsonKey(name: 'orders_count') int get ordersCount;@JsonKey(name: 'remaining_capacity') int? get remainingCapacity;
/// Create a copy of DeliverySlotModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$DeliverySlotModelCopyWith<DeliverySlotModel> get copyWith => _$DeliverySlotModelCopyWithImpl<DeliverySlotModel>(this as DeliverySlotModel, _$identity);

  /// Serializes this DeliverySlotModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is DeliverySlotModel&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.startTime, startTime) || other.startTime == startTime)&&(identical(other.endTime, endTime) || other.endTime == endTime)&&(identical(other.displayText, displayText) || other.displayText == displayText)&&(identical(other.deliveryFee, deliveryFee) || other.deliveryFee == deliveryFee)&&(identical(other.maxOrders, maxOrders) || other.maxOrders == maxOrders)&&(identical(other.displayOrder, displayOrder) || other.displayOrder == displayOrder)&&(identical(other.active, active) || other.active == active)&&const DeepCollectionEquality().equals(other.availableDays, availableDays)&&(identical(other.available, available) || other.available == available)&&(identical(other.ordersCount, ordersCount) || other.ordersCount == ordersCount)&&(identical(other.remainingCapacity, remainingCapacity) || other.remainingCapacity == remainingCapacity));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,startTime,endTime,displayText,deliveryFee,maxOrders,displayOrder,active,const DeepCollectionEquality().hash(availableDays),available,ordersCount,remainingCapacity);

@override
String toString() {
  return 'DeliverySlotModel(id: $id, name: $name, startTime: $startTime, endTime: $endTime, displayText: $displayText, deliveryFee: $deliveryFee, maxOrders: $maxOrders, displayOrder: $displayOrder, active: $active, availableDays: $availableDays, available: $available, ordersCount: $ordersCount, remainingCapacity: $remainingCapacity)';
}


}

/// @nodoc
abstract mixin class $DeliverySlotModelCopyWith<$Res>  {
  factory $DeliverySlotModelCopyWith(DeliverySlotModel value, $Res Function(DeliverySlotModel) _then) = _$DeliverySlotModelCopyWithImpl;
@useResult
$Res call({
 String id, String name,@JsonKey(name: 'start_time') String startTime,@JsonKey(name: 'end_time') String endTime,@JsonKey(name: 'display_text') String? displayText,@JsonKey(name: 'delivery_fee') double deliveryFee,@JsonKey(name: 'max_orders') int maxOrders,@JsonKey(name: 'display_order') int displayOrder, bool active,@JsonKey(name: 'available_days') List<String>? availableDays, bool available,@JsonKey(name: 'orders_count') int ordersCount,@JsonKey(name: 'remaining_capacity') int? remainingCapacity
});




}
/// @nodoc
class _$DeliverySlotModelCopyWithImpl<$Res>
    implements $DeliverySlotModelCopyWith<$Res> {
  _$DeliverySlotModelCopyWithImpl(this._self, this._then);

  final DeliverySlotModel _self;
  final $Res Function(DeliverySlotModel) _then;

/// Create a copy of DeliverySlotModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? name = null,Object? startTime = null,Object? endTime = null,Object? displayText = freezed,Object? deliveryFee = null,Object? maxOrders = null,Object? displayOrder = null,Object? active = null,Object? availableDays = freezed,Object? available = null,Object? ordersCount = null,Object? remainingCapacity = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,startTime: null == startTime ? _self.startTime : startTime // ignore: cast_nullable_to_non_nullable
as String,endTime: null == endTime ? _self.endTime : endTime // ignore: cast_nullable_to_non_nullable
as String,displayText: freezed == displayText ? _self.displayText : displayText // ignore: cast_nullable_to_non_nullable
as String?,deliveryFee: null == deliveryFee ? _self.deliveryFee : deliveryFee // ignore: cast_nullable_to_non_nullable
as double,maxOrders: null == maxOrders ? _self.maxOrders : maxOrders // ignore: cast_nullable_to_non_nullable
as int,displayOrder: null == displayOrder ? _self.displayOrder : displayOrder // ignore: cast_nullable_to_non_nullable
as int,active: null == active ? _self.active : active // ignore: cast_nullable_to_non_nullable
as bool,availableDays: freezed == availableDays ? _self.availableDays : availableDays // ignore: cast_nullable_to_non_nullable
as List<String>?,available: null == available ? _self.available : available // ignore: cast_nullable_to_non_nullable
as bool,ordersCount: null == ordersCount ? _self.ordersCount : ordersCount // ignore: cast_nullable_to_non_nullable
as int,remainingCapacity: freezed == remainingCapacity ? _self.remainingCapacity : remainingCapacity // ignore: cast_nullable_to_non_nullable
as int?,
  ));
}

}


/// Adds pattern-matching-related methods to [DeliverySlotModel].
extension DeliverySlotModelPatterns on DeliverySlotModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _DeliverySlotModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _DeliverySlotModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _DeliverySlotModel value)  $default,){
final _that = this;
switch (_that) {
case _DeliverySlotModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _DeliverySlotModel value)?  $default,){
final _that = this;
switch (_that) {
case _DeliverySlotModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String name, @JsonKey(name: 'start_time')  String startTime, @JsonKey(name: 'end_time')  String endTime, @JsonKey(name: 'display_text')  String? displayText, @JsonKey(name: 'delivery_fee')  double deliveryFee, @JsonKey(name: 'max_orders')  int maxOrders, @JsonKey(name: 'display_order')  int displayOrder,  bool active, @JsonKey(name: 'available_days')  List<String>? availableDays,  bool available, @JsonKey(name: 'orders_count')  int ordersCount, @JsonKey(name: 'remaining_capacity')  int? remainingCapacity)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _DeliverySlotModel() when $default != null:
return $default(_that.id,_that.name,_that.startTime,_that.endTime,_that.displayText,_that.deliveryFee,_that.maxOrders,_that.displayOrder,_that.active,_that.availableDays,_that.available,_that.ordersCount,_that.remainingCapacity);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String name, @JsonKey(name: 'start_time')  String startTime, @JsonKey(name: 'end_time')  String endTime, @JsonKey(name: 'display_text')  String? displayText, @JsonKey(name: 'delivery_fee')  double deliveryFee, @JsonKey(name: 'max_orders')  int maxOrders, @JsonKey(name: 'display_order')  int displayOrder,  bool active, @JsonKey(name: 'available_days')  List<String>? availableDays,  bool available, @JsonKey(name: 'orders_count')  int ordersCount, @JsonKey(name: 'remaining_capacity')  int? remainingCapacity)  $default,) {final _that = this;
switch (_that) {
case _DeliverySlotModel():
return $default(_that.id,_that.name,_that.startTime,_that.endTime,_that.displayText,_that.deliveryFee,_that.maxOrders,_that.displayOrder,_that.active,_that.availableDays,_that.available,_that.ordersCount,_that.remainingCapacity);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String name, @JsonKey(name: 'start_time')  String startTime, @JsonKey(name: 'end_time')  String endTime, @JsonKey(name: 'display_text')  String? displayText, @JsonKey(name: 'delivery_fee')  double deliveryFee, @JsonKey(name: 'max_orders')  int maxOrders, @JsonKey(name: 'display_order')  int displayOrder,  bool active, @JsonKey(name: 'available_days')  List<String>? availableDays,  bool available, @JsonKey(name: 'orders_count')  int ordersCount, @JsonKey(name: 'remaining_capacity')  int? remainingCapacity)?  $default,) {final _that = this;
switch (_that) {
case _DeliverySlotModel() when $default != null:
return $default(_that.id,_that.name,_that.startTime,_that.endTime,_that.displayText,_that.deliveryFee,_that.maxOrders,_that.displayOrder,_that.active,_that.availableDays,_that.available,_that.ordersCount,_that.remainingCapacity);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _DeliverySlotModel implements DeliverySlotModel {
  const _DeliverySlotModel({required this.id, required this.name, @JsonKey(name: 'start_time') required this.startTime, @JsonKey(name: 'end_time') required this.endTime, @JsonKey(name: 'display_text') this.displayText, @JsonKey(name: 'delivery_fee') this.deliveryFee = 0, @JsonKey(name: 'max_orders') this.maxOrders = 50, @JsonKey(name: 'display_order') this.displayOrder = 0, this.active = true, @JsonKey(name: 'available_days') final  List<String>? availableDays, this.available = true, @JsonKey(name: 'orders_count') this.ordersCount = 0, @JsonKey(name: 'remaining_capacity') this.remainingCapacity}): _availableDays = availableDays;
  factory _DeliverySlotModel.fromJson(Map<String, dynamic> json) => _$DeliverySlotModelFromJson(json);

@override final  String id;
@override final  String name;
@override@JsonKey(name: 'start_time') final  String startTime;
@override@JsonKey(name: 'end_time') final  String endTime;
@override@JsonKey(name: 'display_text') final  String? displayText;
@override@JsonKey(name: 'delivery_fee') final  double deliveryFee;
@override@JsonKey(name: 'max_orders') final  int maxOrders;
@override@JsonKey(name: 'display_order') final  int displayOrder;
@override@JsonKey() final  bool active;
 final  List<String>? _availableDays;
@override@JsonKey(name: 'available_days') List<String>? get availableDays {
  final value = _availableDays;
  if (value == null) return null;
  if (_availableDays is EqualUnmodifiableListView) return _availableDays;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(value);
}

// Runtime fields returned by the API when querying for a specific date
@override@JsonKey() final  bool available;
@override@JsonKey(name: 'orders_count') final  int ordersCount;
@override@JsonKey(name: 'remaining_capacity') final  int? remainingCapacity;

/// Create a copy of DeliverySlotModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$DeliverySlotModelCopyWith<_DeliverySlotModel> get copyWith => __$DeliverySlotModelCopyWithImpl<_DeliverySlotModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$DeliverySlotModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _DeliverySlotModel&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.startTime, startTime) || other.startTime == startTime)&&(identical(other.endTime, endTime) || other.endTime == endTime)&&(identical(other.displayText, displayText) || other.displayText == displayText)&&(identical(other.deliveryFee, deliveryFee) || other.deliveryFee == deliveryFee)&&(identical(other.maxOrders, maxOrders) || other.maxOrders == maxOrders)&&(identical(other.displayOrder, displayOrder) || other.displayOrder == displayOrder)&&(identical(other.active, active) || other.active == active)&&const DeepCollectionEquality().equals(other._availableDays, _availableDays)&&(identical(other.available, available) || other.available == available)&&(identical(other.ordersCount, ordersCount) || other.ordersCount == ordersCount)&&(identical(other.remainingCapacity, remainingCapacity) || other.remainingCapacity == remainingCapacity));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,startTime,endTime,displayText,deliveryFee,maxOrders,displayOrder,active,const DeepCollectionEquality().hash(_availableDays),available,ordersCount,remainingCapacity);

@override
String toString() {
  return 'DeliverySlotModel(id: $id, name: $name, startTime: $startTime, endTime: $endTime, displayText: $displayText, deliveryFee: $deliveryFee, maxOrders: $maxOrders, displayOrder: $displayOrder, active: $active, availableDays: $availableDays, available: $available, ordersCount: $ordersCount, remainingCapacity: $remainingCapacity)';
}


}

/// @nodoc
abstract mixin class _$DeliverySlotModelCopyWith<$Res> implements $DeliverySlotModelCopyWith<$Res> {
  factory _$DeliverySlotModelCopyWith(_DeliverySlotModel value, $Res Function(_DeliverySlotModel) _then) = __$DeliverySlotModelCopyWithImpl;
@override @useResult
$Res call({
 String id, String name,@JsonKey(name: 'start_time') String startTime,@JsonKey(name: 'end_time') String endTime,@JsonKey(name: 'display_text') String? displayText,@JsonKey(name: 'delivery_fee') double deliveryFee,@JsonKey(name: 'max_orders') int maxOrders,@JsonKey(name: 'display_order') int displayOrder, bool active,@JsonKey(name: 'available_days') List<String>? availableDays, bool available,@JsonKey(name: 'orders_count') int ordersCount,@JsonKey(name: 'remaining_capacity') int? remainingCapacity
});




}
/// @nodoc
class __$DeliverySlotModelCopyWithImpl<$Res>
    implements _$DeliverySlotModelCopyWith<$Res> {
  __$DeliverySlotModelCopyWithImpl(this._self, this._then);

  final _DeliverySlotModel _self;
  final $Res Function(_DeliverySlotModel) _then;

/// Create a copy of DeliverySlotModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? name = null,Object? startTime = null,Object? endTime = null,Object? displayText = freezed,Object? deliveryFee = null,Object? maxOrders = null,Object? displayOrder = null,Object? active = null,Object? availableDays = freezed,Object? available = null,Object? ordersCount = null,Object? remainingCapacity = freezed,}) {
  return _then(_DeliverySlotModel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,startTime: null == startTime ? _self.startTime : startTime // ignore: cast_nullable_to_non_nullable
as String,endTime: null == endTime ? _self.endTime : endTime // ignore: cast_nullable_to_non_nullable
as String,displayText: freezed == displayText ? _self.displayText : displayText // ignore: cast_nullable_to_non_nullable
as String?,deliveryFee: null == deliveryFee ? _self.deliveryFee : deliveryFee // ignore: cast_nullable_to_non_nullable
as double,maxOrders: null == maxOrders ? _self.maxOrders : maxOrders // ignore: cast_nullable_to_non_nullable
as int,displayOrder: null == displayOrder ? _self.displayOrder : displayOrder // ignore: cast_nullable_to_non_nullable
as int,active: null == active ? _self.active : active // ignore: cast_nullable_to_non_nullable
as bool,availableDays: freezed == availableDays ? _self._availableDays : availableDays // ignore: cast_nullable_to_non_nullable
as List<String>?,available: null == available ? _self.available : available // ignore: cast_nullable_to_non_nullable
as bool,ordersCount: null == ordersCount ? _self.ordersCount : ordersCount // ignore: cast_nullable_to_non_nullable
as int,remainingCapacity: freezed == remainingCapacity ? _self.remainingCapacity : remainingCapacity // ignore: cast_nullable_to_non_nullable
as int?,
  ));
}


}

// dart format on
