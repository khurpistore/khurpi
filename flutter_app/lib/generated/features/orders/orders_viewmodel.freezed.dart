// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of '../../../features/orders/orders_viewmodel.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$OrdersState {

 bool get isLoading; List<OrderModel> get orders; OrderModel? get currentOrder; String? get errorMessage;
/// Create a copy of OrdersState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$OrdersStateCopyWith<OrdersState> get copyWith => _$OrdersStateCopyWithImpl<OrdersState>(this as OrdersState, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is OrdersState&&(identical(other.isLoading, isLoading) || other.isLoading == isLoading)&&const DeepCollectionEquality().equals(other.orders, orders)&&(identical(other.currentOrder, currentOrder) || other.currentOrder == currentOrder)&&(identical(other.errorMessage, errorMessage) || other.errorMessage == errorMessage));
}


@override
int get hashCode => Object.hash(runtimeType,isLoading,const DeepCollectionEquality().hash(orders),currentOrder,errorMessage);

@override
String toString() {
  return 'OrdersState(isLoading: $isLoading, orders: $orders, currentOrder: $currentOrder, errorMessage: $errorMessage)';
}


}

/// @nodoc
abstract mixin class $OrdersStateCopyWith<$Res>  {
  factory $OrdersStateCopyWith(OrdersState value, $Res Function(OrdersState) _then) = _$OrdersStateCopyWithImpl;
@useResult
$Res call({
 bool isLoading, List<OrderModel> orders, OrderModel? currentOrder, String? errorMessage
});


$OrderModelCopyWith<$Res>? get currentOrder;

}
/// @nodoc
class _$OrdersStateCopyWithImpl<$Res>
    implements $OrdersStateCopyWith<$Res> {
  _$OrdersStateCopyWithImpl(this._self, this._then);

  final OrdersState _self;
  final $Res Function(OrdersState) _then;

/// Create a copy of OrdersState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? isLoading = null,Object? orders = null,Object? currentOrder = freezed,Object? errorMessage = freezed,}) {
  return _then(_self.copyWith(
isLoading: null == isLoading ? _self.isLoading : isLoading // ignore: cast_nullable_to_non_nullable
as bool,orders: null == orders ? _self.orders : orders // ignore: cast_nullable_to_non_nullable
as List<OrderModel>,currentOrder: freezed == currentOrder ? _self.currentOrder : currentOrder // ignore: cast_nullable_to_non_nullable
as OrderModel?,errorMessage: freezed == errorMessage ? _self.errorMessage : errorMessage // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}
/// Create a copy of OrdersState
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$OrderModelCopyWith<$Res>? get currentOrder {
    if (_self.currentOrder == null) {
    return null;
  }

  return $OrderModelCopyWith<$Res>(_self.currentOrder!, (value) {
    return _then(_self.copyWith(currentOrder: value));
  });
}
}


/// Adds pattern-matching-related methods to [OrdersState].
extension OrdersStatePatterns on OrdersState {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _OrdersState value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _OrdersState() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _OrdersState value)  $default,){
final _that = this;
switch (_that) {
case _OrdersState():
return $default(_that);}
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _OrdersState value)?  $default,){
final _that = this;
switch (_that) {
case _OrdersState() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( bool isLoading,  List<OrderModel> orders,  OrderModel? currentOrder,  String? errorMessage)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _OrdersState() when $default != null:
return $default(_that.isLoading,_that.orders,_that.currentOrder,_that.errorMessage);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( bool isLoading,  List<OrderModel> orders,  OrderModel? currentOrder,  String? errorMessage)  $default,) {final _that = this;
switch (_that) {
case _OrdersState():
return $default(_that.isLoading,_that.orders,_that.currentOrder,_that.errorMessage);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( bool isLoading,  List<OrderModel> orders,  OrderModel? currentOrder,  String? errorMessage)?  $default,) {final _that = this;
switch (_that) {
case _OrdersState() when $default != null:
return $default(_that.isLoading,_that.orders,_that.currentOrder,_that.errorMessage);case _:
  return null;

}
}

}

/// @nodoc


class _OrdersState implements OrdersState {
  const _OrdersState({this.isLoading = false, final  List<OrderModel> orders = const [], this.currentOrder, this.errorMessage}): _orders = orders;
  

@override@JsonKey() final  bool isLoading;
 final  List<OrderModel> _orders;
@override@JsonKey() List<OrderModel> get orders {
  if (_orders is EqualUnmodifiableListView) return _orders;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_orders);
}

@override final  OrderModel? currentOrder;
@override final  String? errorMessage;

/// Create a copy of OrdersState
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$OrdersStateCopyWith<_OrdersState> get copyWith => __$OrdersStateCopyWithImpl<_OrdersState>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _OrdersState&&(identical(other.isLoading, isLoading) || other.isLoading == isLoading)&&const DeepCollectionEquality().equals(other._orders, _orders)&&(identical(other.currentOrder, currentOrder) || other.currentOrder == currentOrder)&&(identical(other.errorMessage, errorMessage) || other.errorMessage == errorMessage));
}


@override
int get hashCode => Object.hash(runtimeType,isLoading,const DeepCollectionEquality().hash(_orders),currentOrder,errorMessage);

@override
String toString() {
  return 'OrdersState(isLoading: $isLoading, orders: $orders, currentOrder: $currentOrder, errorMessage: $errorMessage)';
}


}

/// @nodoc
abstract mixin class _$OrdersStateCopyWith<$Res> implements $OrdersStateCopyWith<$Res> {
  factory _$OrdersStateCopyWith(_OrdersState value, $Res Function(_OrdersState) _then) = __$OrdersStateCopyWithImpl;
@override @useResult
$Res call({
 bool isLoading, List<OrderModel> orders, OrderModel? currentOrder, String? errorMessage
});


@override $OrderModelCopyWith<$Res>? get currentOrder;

}
/// @nodoc
class __$OrdersStateCopyWithImpl<$Res>
    implements _$OrdersStateCopyWith<$Res> {
  __$OrdersStateCopyWithImpl(this._self, this._then);

  final _OrdersState _self;
  final $Res Function(_OrdersState) _then;

/// Create a copy of OrdersState
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? isLoading = null,Object? orders = null,Object? currentOrder = freezed,Object? errorMessage = freezed,}) {
  return _then(_OrdersState(
isLoading: null == isLoading ? _self.isLoading : isLoading // ignore: cast_nullable_to_non_nullable
as bool,orders: null == orders ? _self._orders : orders // ignore: cast_nullable_to_non_nullable
as List<OrderModel>,currentOrder: freezed == currentOrder ? _self.currentOrder : currentOrder // ignore: cast_nullable_to_non_nullable
as OrderModel?,errorMessage: freezed == errorMessage ? _self.errorMessage : errorMessage // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

/// Create a copy of OrdersState
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$OrderModelCopyWith<$Res>? get currentOrder {
    if (_self.currentOrder == null) {
    return null;
  }

  return $OrderModelCopyWith<$Res>(_self.currentOrder!, (value) {
    return _then(_self.copyWith(currentOrder: value));
  });
}
}

// dart format on
