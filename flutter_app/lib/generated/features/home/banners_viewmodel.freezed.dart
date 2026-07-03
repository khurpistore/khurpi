// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of '../../../features/home/banners_viewmodel.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$BannersState {

 bool get isLoading; List<BannerModel> get banners; String? get errorMessage;
/// Create a copy of BannersState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$BannersStateCopyWith<BannersState> get copyWith => _$BannersStateCopyWithImpl<BannersState>(this as BannersState, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is BannersState&&(identical(other.isLoading, isLoading) || other.isLoading == isLoading)&&const DeepCollectionEquality().equals(other.banners, banners)&&(identical(other.errorMessage, errorMessage) || other.errorMessage == errorMessage));
}


@override
int get hashCode => Object.hash(runtimeType,isLoading,const DeepCollectionEquality().hash(banners),errorMessage);

@override
String toString() {
  return 'BannersState(isLoading: $isLoading, banners: $banners, errorMessage: $errorMessage)';
}


}

/// @nodoc
abstract mixin class $BannersStateCopyWith<$Res>  {
  factory $BannersStateCopyWith(BannersState value, $Res Function(BannersState) _then) = _$BannersStateCopyWithImpl;
@useResult
$Res call({
 bool isLoading, List<BannerModel> banners, String? errorMessage
});




}
/// @nodoc
class _$BannersStateCopyWithImpl<$Res>
    implements $BannersStateCopyWith<$Res> {
  _$BannersStateCopyWithImpl(this._self, this._then);

  final BannersState _self;
  final $Res Function(BannersState) _then;

/// Create a copy of BannersState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? isLoading = null,Object? banners = null,Object? errorMessage = freezed,}) {
  return _then(_self.copyWith(
isLoading: null == isLoading ? _self.isLoading : isLoading // ignore: cast_nullable_to_non_nullable
as bool,banners: null == banners ? _self.banners : banners // ignore: cast_nullable_to_non_nullable
as List<BannerModel>,errorMessage: freezed == errorMessage ? _self.errorMessage : errorMessage // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [BannersState].
extension BannersStatePatterns on BannersState {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _BannersState value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _BannersState() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _BannersState value)  $default,){
final _that = this;
switch (_that) {
case _BannersState():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _BannersState value)?  $default,){
final _that = this;
switch (_that) {
case _BannersState() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( bool isLoading,  List<BannerModel> banners,  String? errorMessage)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _BannersState() when $default != null:
return $default(_that.isLoading,_that.banners,_that.errorMessage);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( bool isLoading,  List<BannerModel> banners,  String? errorMessage)  $default,) {final _that = this;
switch (_that) {
case _BannersState():
return $default(_that.isLoading,_that.banners,_that.errorMessage);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( bool isLoading,  List<BannerModel> banners,  String? errorMessage)?  $default,) {final _that = this;
switch (_that) {
case _BannersState() when $default != null:
return $default(_that.isLoading,_that.banners,_that.errorMessage);case _:
  return null;

}
}

}

/// @nodoc


class _BannersState implements BannersState {
  const _BannersState({this.isLoading = false, final  List<BannerModel> banners = const [], this.errorMessage}): _banners = banners;
  

@override@JsonKey() final  bool isLoading;
 final  List<BannerModel> _banners;
@override@JsonKey() List<BannerModel> get banners {
  if (_banners is EqualUnmodifiableListView) return _banners;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_banners);
}

@override final  String? errorMessage;

/// Create a copy of BannersState
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$BannersStateCopyWith<_BannersState> get copyWith => __$BannersStateCopyWithImpl<_BannersState>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _BannersState&&(identical(other.isLoading, isLoading) || other.isLoading == isLoading)&&const DeepCollectionEquality().equals(other._banners, _banners)&&(identical(other.errorMessage, errorMessage) || other.errorMessage == errorMessage));
}


@override
int get hashCode => Object.hash(runtimeType,isLoading,const DeepCollectionEquality().hash(_banners),errorMessage);

@override
String toString() {
  return 'BannersState(isLoading: $isLoading, banners: $banners, errorMessage: $errorMessage)';
}


}

/// @nodoc
abstract mixin class _$BannersStateCopyWith<$Res> implements $BannersStateCopyWith<$Res> {
  factory _$BannersStateCopyWith(_BannersState value, $Res Function(_BannersState) _then) = __$BannersStateCopyWithImpl;
@override @useResult
$Res call({
 bool isLoading, List<BannerModel> banners, String? errorMessage
});




}
/// @nodoc
class __$BannersStateCopyWithImpl<$Res>
    implements _$BannersStateCopyWith<$Res> {
  __$BannersStateCopyWithImpl(this._self, this._then);

  final _BannersState _self;
  final $Res Function(_BannersState) _then;

/// Create a copy of BannersState
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? isLoading = null,Object? banners = null,Object? errorMessage = freezed,}) {
  return _then(_BannersState(
isLoading: null == isLoading ? _self.isLoading : isLoading // ignore: cast_nullable_to_non_nullable
as bool,banners: null == banners ? _self._banners : banners // ignore: cast_nullable_to_non_nullable
as List<BannerModel>,errorMessage: freezed == errorMessage ? _self.errorMessage : errorMessage // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}

// dart format on
