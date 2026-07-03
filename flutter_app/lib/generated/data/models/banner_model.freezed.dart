// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of '../../../data/models/banner_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$BannerModel {

@JsonKey(name: 'id') String? get id;@JsonKey(name: '_id') String? get mongoId;@JsonKey(name: 'image_url') String get imageUrl; String? get title; String? get subtitle;@JsonKey(name: 'action_type') String? get actionType;@JsonKey(name: 'action_value') String? get actionValue;@JsonKey(name: 'display_order') int get displayOrder;@JsonKey(name: 'is_active') bool get isActive;
/// Create a copy of BannerModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$BannerModelCopyWith<BannerModel> get copyWith => _$BannerModelCopyWithImpl<BannerModel>(this as BannerModel, _$identity);

  /// Serializes this BannerModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is BannerModel&&(identical(other.id, id) || other.id == id)&&(identical(other.mongoId, mongoId) || other.mongoId == mongoId)&&(identical(other.imageUrl, imageUrl) || other.imageUrl == imageUrl)&&(identical(other.title, title) || other.title == title)&&(identical(other.subtitle, subtitle) || other.subtitle == subtitle)&&(identical(other.actionType, actionType) || other.actionType == actionType)&&(identical(other.actionValue, actionValue) || other.actionValue == actionValue)&&(identical(other.displayOrder, displayOrder) || other.displayOrder == displayOrder)&&(identical(other.isActive, isActive) || other.isActive == isActive));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,mongoId,imageUrl,title,subtitle,actionType,actionValue,displayOrder,isActive);

@override
String toString() {
  return 'BannerModel(id: $id, mongoId: $mongoId, imageUrl: $imageUrl, title: $title, subtitle: $subtitle, actionType: $actionType, actionValue: $actionValue, displayOrder: $displayOrder, isActive: $isActive)';
}


}

/// @nodoc
abstract mixin class $BannerModelCopyWith<$Res>  {
  factory $BannerModelCopyWith(BannerModel value, $Res Function(BannerModel) _then) = _$BannerModelCopyWithImpl;
@useResult
$Res call({
@JsonKey(name: 'id') String? id,@JsonKey(name: '_id') String? mongoId,@JsonKey(name: 'image_url') String imageUrl, String? title, String? subtitle,@JsonKey(name: 'action_type') String? actionType,@JsonKey(name: 'action_value') String? actionValue,@JsonKey(name: 'display_order') int displayOrder,@JsonKey(name: 'is_active') bool isActive
});




}
/// @nodoc
class _$BannerModelCopyWithImpl<$Res>
    implements $BannerModelCopyWith<$Res> {
  _$BannerModelCopyWithImpl(this._self, this._then);

  final BannerModel _self;
  final $Res Function(BannerModel) _then;

/// Create a copy of BannerModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = freezed,Object? mongoId = freezed,Object? imageUrl = null,Object? title = freezed,Object? subtitle = freezed,Object? actionType = freezed,Object? actionValue = freezed,Object? displayOrder = null,Object? isActive = null,}) {
  return _then(_self.copyWith(
id: freezed == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String?,mongoId: freezed == mongoId ? _self.mongoId : mongoId // ignore: cast_nullable_to_non_nullable
as String?,imageUrl: null == imageUrl ? _self.imageUrl : imageUrl // ignore: cast_nullable_to_non_nullable
as String,title: freezed == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String?,subtitle: freezed == subtitle ? _self.subtitle : subtitle // ignore: cast_nullable_to_non_nullable
as String?,actionType: freezed == actionType ? _self.actionType : actionType // ignore: cast_nullable_to_non_nullable
as String?,actionValue: freezed == actionValue ? _self.actionValue : actionValue // ignore: cast_nullable_to_non_nullable
as String?,displayOrder: null == displayOrder ? _self.displayOrder : displayOrder // ignore: cast_nullable_to_non_nullable
as int,isActive: null == isActive ? _self.isActive : isActive // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

}


/// Adds pattern-matching-related methods to [BannerModel].
extension BannerModelPatterns on BannerModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _BannerModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _BannerModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _BannerModel value)  $default,){
final _that = this;
switch (_that) {
case _BannerModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _BannerModel value)?  $default,){
final _that = this;
switch (_that) {
case _BannerModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(name: 'id')  String? id, @JsonKey(name: '_id')  String? mongoId, @JsonKey(name: 'image_url')  String imageUrl,  String? title,  String? subtitle, @JsonKey(name: 'action_type')  String? actionType, @JsonKey(name: 'action_value')  String? actionValue, @JsonKey(name: 'display_order')  int displayOrder, @JsonKey(name: 'is_active')  bool isActive)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _BannerModel() when $default != null:
return $default(_that.id,_that.mongoId,_that.imageUrl,_that.title,_that.subtitle,_that.actionType,_that.actionValue,_that.displayOrder,_that.isActive);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(name: 'id')  String? id, @JsonKey(name: '_id')  String? mongoId, @JsonKey(name: 'image_url')  String imageUrl,  String? title,  String? subtitle, @JsonKey(name: 'action_type')  String? actionType, @JsonKey(name: 'action_value')  String? actionValue, @JsonKey(name: 'display_order')  int displayOrder, @JsonKey(name: 'is_active')  bool isActive)  $default,) {final _that = this;
switch (_that) {
case _BannerModel():
return $default(_that.id,_that.mongoId,_that.imageUrl,_that.title,_that.subtitle,_that.actionType,_that.actionValue,_that.displayOrder,_that.isActive);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(name: 'id')  String? id, @JsonKey(name: '_id')  String? mongoId, @JsonKey(name: 'image_url')  String imageUrl,  String? title,  String? subtitle, @JsonKey(name: 'action_type')  String? actionType, @JsonKey(name: 'action_value')  String? actionValue, @JsonKey(name: 'display_order')  int displayOrder, @JsonKey(name: 'is_active')  bool isActive)?  $default,) {final _that = this;
switch (_that) {
case _BannerModel() when $default != null:
return $default(_that.id,_that.mongoId,_that.imageUrl,_that.title,_that.subtitle,_that.actionType,_that.actionValue,_that.displayOrder,_that.isActive);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _BannerModel implements BannerModel {
  const _BannerModel({@JsonKey(name: 'id') this.id, @JsonKey(name: '_id') this.mongoId, @JsonKey(name: 'image_url') required this.imageUrl, this.title, this.subtitle, @JsonKey(name: 'action_type') this.actionType, @JsonKey(name: 'action_value') this.actionValue, @JsonKey(name: 'display_order') this.displayOrder = 0, @JsonKey(name: 'is_active') this.isActive = true});
  factory _BannerModel.fromJson(Map<String, dynamic> json) => _$BannerModelFromJson(json);

@override@JsonKey(name: 'id') final  String? id;
@override@JsonKey(name: '_id') final  String? mongoId;
@override@JsonKey(name: 'image_url') final  String imageUrl;
@override final  String? title;
@override final  String? subtitle;
@override@JsonKey(name: 'action_type') final  String? actionType;
@override@JsonKey(name: 'action_value') final  String? actionValue;
@override@JsonKey(name: 'display_order') final  int displayOrder;
@override@JsonKey(name: 'is_active') final  bool isActive;

/// Create a copy of BannerModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$BannerModelCopyWith<_BannerModel> get copyWith => __$BannerModelCopyWithImpl<_BannerModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$BannerModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _BannerModel&&(identical(other.id, id) || other.id == id)&&(identical(other.mongoId, mongoId) || other.mongoId == mongoId)&&(identical(other.imageUrl, imageUrl) || other.imageUrl == imageUrl)&&(identical(other.title, title) || other.title == title)&&(identical(other.subtitle, subtitle) || other.subtitle == subtitle)&&(identical(other.actionType, actionType) || other.actionType == actionType)&&(identical(other.actionValue, actionValue) || other.actionValue == actionValue)&&(identical(other.displayOrder, displayOrder) || other.displayOrder == displayOrder)&&(identical(other.isActive, isActive) || other.isActive == isActive));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,mongoId,imageUrl,title,subtitle,actionType,actionValue,displayOrder,isActive);

@override
String toString() {
  return 'BannerModel(id: $id, mongoId: $mongoId, imageUrl: $imageUrl, title: $title, subtitle: $subtitle, actionType: $actionType, actionValue: $actionValue, displayOrder: $displayOrder, isActive: $isActive)';
}


}

/// @nodoc
abstract mixin class _$BannerModelCopyWith<$Res> implements $BannerModelCopyWith<$Res> {
  factory _$BannerModelCopyWith(_BannerModel value, $Res Function(_BannerModel) _then) = __$BannerModelCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(name: 'id') String? id,@JsonKey(name: '_id') String? mongoId,@JsonKey(name: 'image_url') String imageUrl, String? title, String? subtitle,@JsonKey(name: 'action_type') String? actionType,@JsonKey(name: 'action_value') String? actionValue,@JsonKey(name: 'display_order') int displayOrder,@JsonKey(name: 'is_active') bool isActive
});




}
/// @nodoc
class __$BannerModelCopyWithImpl<$Res>
    implements _$BannerModelCopyWith<$Res> {
  __$BannerModelCopyWithImpl(this._self, this._then);

  final _BannerModel _self;
  final $Res Function(_BannerModel) _then;

/// Create a copy of BannerModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = freezed,Object? mongoId = freezed,Object? imageUrl = null,Object? title = freezed,Object? subtitle = freezed,Object? actionType = freezed,Object? actionValue = freezed,Object? displayOrder = null,Object? isActive = null,}) {
  return _then(_BannerModel(
id: freezed == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String?,mongoId: freezed == mongoId ? _self.mongoId : mongoId // ignore: cast_nullable_to_non_nullable
as String?,imageUrl: null == imageUrl ? _self.imageUrl : imageUrl // ignore: cast_nullable_to_non_nullable
as String,title: freezed == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String?,subtitle: freezed == subtitle ? _self.subtitle : subtitle // ignore: cast_nullable_to_non_nullable
as String?,actionType: freezed == actionType ? _self.actionType : actionType // ignore: cast_nullable_to_non_nullable
as String?,actionValue: freezed == actionValue ? _self.actionValue : actionValue // ignore: cast_nullable_to_non_nullable
as String?,displayOrder: null == displayOrder ? _self.displayOrder : displayOrder // ignore: cast_nullable_to_non_nullable
as int,isActive: null == isActive ? _self.isActive : isActive // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}


}

// dart format on
