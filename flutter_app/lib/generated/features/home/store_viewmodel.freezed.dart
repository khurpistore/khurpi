// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of '../../../features/home/store_viewmodel.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$StoreState {

 bool get isLoading; bool get isSlotsLoading; StoreSettingsModel? get settings; List<DeliverySlotModel> get deliverySlots; String get deliveryType; String? get selectedDate; String? get selectedSlotId; String? get errorMessage;
/// Create a copy of StoreState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$StoreStateCopyWith<StoreState> get copyWith => _$StoreStateCopyWithImpl<StoreState>(this as StoreState, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is StoreState&&(identical(other.isLoading, isLoading) || other.isLoading == isLoading)&&(identical(other.isSlotsLoading, isSlotsLoading) || other.isSlotsLoading == isSlotsLoading)&&(identical(other.settings, settings) || other.settings == settings)&&const DeepCollectionEquality().equals(other.deliverySlots, deliverySlots)&&(identical(other.deliveryType, deliveryType) || other.deliveryType == deliveryType)&&(identical(other.selectedDate, selectedDate) || other.selectedDate == selectedDate)&&(identical(other.selectedSlotId, selectedSlotId) || other.selectedSlotId == selectedSlotId)&&(identical(other.errorMessage, errorMessage) || other.errorMessage == errorMessage));
}


@override
int get hashCode => Object.hash(runtimeType,isLoading,isSlotsLoading,settings,const DeepCollectionEquality().hash(deliverySlots),deliveryType,selectedDate,selectedSlotId,errorMessage);

@override
String toString() {
  return 'StoreState(isLoading: $isLoading, isSlotsLoading: $isSlotsLoading, settings: $settings, deliverySlots: $deliverySlots, deliveryType: $deliveryType, selectedDate: $selectedDate, selectedSlotId: $selectedSlotId, errorMessage: $errorMessage)';
}


}

/// @nodoc
abstract mixin class $StoreStateCopyWith<$Res>  {
  factory $StoreStateCopyWith(StoreState value, $Res Function(StoreState) _then) = _$StoreStateCopyWithImpl;
@useResult
$Res call({
 bool isLoading, bool isSlotsLoading, StoreSettingsModel? settings, List<DeliverySlotModel> deliverySlots, String deliveryType, String? selectedDate, String? selectedSlotId, String? errorMessage
});


$StoreSettingsModelCopyWith<$Res>? get settings;

}
/// @nodoc
class _$StoreStateCopyWithImpl<$Res>
    implements $StoreStateCopyWith<$Res> {
  _$StoreStateCopyWithImpl(this._self, this._then);

  final StoreState _self;
  final $Res Function(StoreState) _then;

/// Create a copy of StoreState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? isLoading = null,Object? isSlotsLoading = null,Object? settings = freezed,Object? deliverySlots = null,Object? deliveryType = null,Object? selectedDate = freezed,Object? selectedSlotId = freezed,Object? errorMessage = freezed,}) {
  return _then(_self.copyWith(
isLoading: null == isLoading ? _self.isLoading : isLoading // ignore: cast_nullable_to_non_nullable
as bool,isSlotsLoading: null == isSlotsLoading ? _self.isSlotsLoading : isSlotsLoading // ignore: cast_nullable_to_non_nullable
as bool,settings: freezed == settings ? _self.settings : settings // ignore: cast_nullable_to_non_nullable
as StoreSettingsModel?,deliverySlots: null == deliverySlots ? _self.deliverySlots : deliverySlots // ignore: cast_nullable_to_non_nullable
as List<DeliverySlotModel>,deliveryType: null == deliveryType ? _self.deliveryType : deliveryType // ignore: cast_nullable_to_non_nullable
as String,selectedDate: freezed == selectedDate ? _self.selectedDate : selectedDate // ignore: cast_nullable_to_non_nullable
as String?,selectedSlotId: freezed == selectedSlotId ? _self.selectedSlotId : selectedSlotId // ignore: cast_nullable_to_non_nullable
as String?,errorMessage: freezed == errorMessage ? _self.errorMessage : errorMessage // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}
/// Create a copy of StoreState
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$StoreSettingsModelCopyWith<$Res>? get settings {
    if (_self.settings == null) {
    return null;
  }

  return $StoreSettingsModelCopyWith<$Res>(_self.settings!, (value) {
    return _then(_self.copyWith(settings: value));
  });
}
}


/// Adds pattern-matching-related methods to [StoreState].
extension StoreStatePatterns on StoreState {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _StoreState value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _StoreState() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _StoreState value)  $default,){
final _that = this;
switch (_that) {
case _StoreState():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _StoreState value)?  $default,){
final _that = this;
switch (_that) {
case _StoreState() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( bool isLoading,  bool isSlotsLoading,  StoreSettingsModel? settings,  List<DeliverySlotModel> deliverySlots,  String deliveryType,  String? selectedDate,  String? selectedSlotId,  String? errorMessage)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _StoreState() when $default != null:
return $default(_that.isLoading,_that.isSlotsLoading,_that.settings,_that.deliverySlots,_that.deliveryType,_that.selectedDate,_that.selectedSlotId,_that.errorMessage);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( bool isLoading,  bool isSlotsLoading,  StoreSettingsModel? settings,  List<DeliverySlotModel> deliverySlots,  String deliveryType,  String? selectedDate,  String? selectedSlotId,  String? errorMessage)  $default,) {final _that = this;
switch (_that) {
case _StoreState():
return $default(_that.isLoading,_that.isSlotsLoading,_that.settings,_that.deliverySlots,_that.deliveryType,_that.selectedDate,_that.selectedSlotId,_that.errorMessage);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( bool isLoading,  bool isSlotsLoading,  StoreSettingsModel? settings,  List<DeliverySlotModel> deliverySlots,  String deliveryType,  String? selectedDate,  String? selectedSlotId,  String? errorMessage)?  $default,) {final _that = this;
switch (_that) {
case _StoreState() when $default != null:
return $default(_that.isLoading,_that.isSlotsLoading,_that.settings,_that.deliverySlots,_that.deliveryType,_that.selectedDate,_that.selectedSlotId,_that.errorMessage);case _:
  return null;

}
}

}

/// @nodoc


class _StoreState implements StoreState {
  const _StoreState({this.isLoading = false, this.isSlotsLoading = false, this.settings, final  List<DeliverySlotModel> deliverySlots = const [], this.deliveryType = 'slotted', this.selectedDate, this.selectedSlotId, this.errorMessage}): _deliverySlots = deliverySlots;
  

@override@JsonKey() final  bool isLoading;
@override@JsonKey() final  bool isSlotsLoading;
@override final  StoreSettingsModel? settings;
 final  List<DeliverySlotModel> _deliverySlots;
@override@JsonKey() List<DeliverySlotModel> get deliverySlots {
  if (_deliverySlots is EqualUnmodifiableListView) return _deliverySlots;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_deliverySlots);
}

@override@JsonKey() final  String deliveryType;
@override final  String? selectedDate;
@override final  String? selectedSlotId;
@override final  String? errorMessage;

/// Create a copy of StoreState
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$StoreStateCopyWith<_StoreState> get copyWith => __$StoreStateCopyWithImpl<_StoreState>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _StoreState&&(identical(other.isLoading, isLoading) || other.isLoading == isLoading)&&(identical(other.isSlotsLoading, isSlotsLoading) || other.isSlotsLoading == isSlotsLoading)&&(identical(other.settings, settings) || other.settings == settings)&&const DeepCollectionEquality().equals(other._deliverySlots, _deliverySlots)&&(identical(other.deliveryType, deliveryType) || other.deliveryType == deliveryType)&&(identical(other.selectedDate, selectedDate) || other.selectedDate == selectedDate)&&(identical(other.selectedSlotId, selectedSlotId) || other.selectedSlotId == selectedSlotId)&&(identical(other.errorMessage, errorMessage) || other.errorMessage == errorMessage));
}


@override
int get hashCode => Object.hash(runtimeType,isLoading,isSlotsLoading,settings,const DeepCollectionEquality().hash(_deliverySlots),deliveryType,selectedDate,selectedSlotId,errorMessage);

@override
String toString() {
  return 'StoreState(isLoading: $isLoading, isSlotsLoading: $isSlotsLoading, settings: $settings, deliverySlots: $deliverySlots, deliveryType: $deliveryType, selectedDate: $selectedDate, selectedSlotId: $selectedSlotId, errorMessage: $errorMessage)';
}


}

/// @nodoc
abstract mixin class _$StoreStateCopyWith<$Res> implements $StoreStateCopyWith<$Res> {
  factory _$StoreStateCopyWith(_StoreState value, $Res Function(_StoreState) _then) = __$StoreStateCopyWithImpl;
@override @useResult
$Res call({
 bool isLoading, bool isSlotsLoading, StoreSettingsModel? settings, List<DeliverySlotModel> deliverySlots, String deliveryType, String? selectedDate, String? selectedSlotId, String? errorMessage
});


@override $StoreSettingsModelCopyWith<$Res>? get settings;

}
/// @nodoc
class __$StoreStateCopyWithImpl<$Res>
    implements _$StoreStateCopyWith<$Res> {
  __$StoreStateCopyWithImpl(this._self, this._then);

  final _StoreState _self;
  final $Res Function(_StoreState) _then;

/// Create a copy of StoreState
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? isLoading = null,Object? isSlotsLoading = null,Object? settings = freezed,Object? deliverySlots = null,Object? deliveryType = null,Object? selectedDate = freezed,Object? selectedSlotId = freezed,Object? errorMessage = freezed,}) {
  return _then(_StoreState(
isLoading: null == isLoading ? _self.isLoading : isLoading // ignore: cast_nullable_to_non_nullable
as bool,isSlotsLoading: null == isSlotsLoading ? _self.isSlotsLoading : isSlotsLoading // ignore: cast_nullable_to_non_nullable
as bool,settings: freezed == settings ? _self.settings : settings // ignore: cast_nullable_to_non_nullable
as StoreSettingsModel?,deliverySlots: null == deliverySlots ? _self._deliverySlots : deliverySlots // ignore: cast_nullable_to_non_nullable
as List<DeliverySlotModel>,deliveryType: null == deliveryType ? _self.deliveryType : deliveryType // ignore: cast_nullable_to_non_nullable
as String,selectedDate: freezed == selectedDate ? _self.selectedDate : selectedDate // ignore: cast_nullable_to_non_nullable
as String?,selectedSlotId: freezed == selectedSlotId ? _self.selectedSlotId : selectedSlotId // ignore: cast_nullable_to_non_nullable
as String?,errorMessage: freezed == errorMessage ? _self.errorMessage : errorMessage // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

/// Create a copy of StoreState
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$StoreSettingsModelCopyWith<$Res>? get settings {
    if (_self.settings == null) {
    return null;
  }

  return $StoreSettingsModelCopyWith<$Res>(_self.settings!, (value) {
    return _then(_self.copyWith(settings: value));
  });
}
}

// dart format on
