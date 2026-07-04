// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of '../../../data/models/recent_search_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$RecentSearchModel {

 String? get id;@JsonKey(name: 'user_id') String? get userId; String get query;@JsonKey(name: 'searched_at') String? get searchedAt;
/// Create a copy of RecentSearchModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$RecentSearchModelCopyWith<RecentSearchModel> get copyWith => _$RecentSearchModelCopyWithImpl<RecentSearchModel>(this as RecentSearchModel, _$identity);

  /// Serializes this RecentSearchModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is RecentSearchModel&&(identical(other.id, id) || other.id == id)&&(identical(other.userId, userId) || other.userId == userId)&&(identical(other.query, query) || other.query == query)&&(identical(other.searchedAt, searchedAt) || other.searchedAt == searchedAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,userId,query,searchedAt);

@override
String toString() {
  return 'RecentSearchModel(id: $id, userId: $userId, query: $query, searchedAt: $searchedAt)';
}


}

/// @nodoc
abstract mixin class $RecentSearchModelCopyWith<$Res>  {
  factory $RecentSearchModelCopyWith(RecentSearchModel value, $Res Function(RecentSearchModel) _then) = _$RecentSearchModelCopyWithImpl;
@useResult
$Res call({
 String? id,@JsonKey(name: 'user_id') String? userId, String query,@JsonKey(name: 'searched_at') String? searchedAt
});




}
/// @nodoc
class _$RecentSearchModelCopyWithImpl<$Res>
    implements $RecentSearchModelCopyWith<$Res> {
  _$RecentSearchModelCopyWithImpl(this._self, this._then);

  final RecentSearchModel _self;
  final $Res Function(RecentSearchModel) _then;

/// Create a copy of RecentSearchModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = freezed,Object? userId = freezed,Object? query = null,Object? searchedAt = freezed,}) {
  return _then(_self.copyWith(
id: freezed == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String?,userId: freezed == userId ? _self.userId : userId // ignore: cast_nullable_to_non_nullable
as String?,query: null == query ? _self.query : query // ignore: cast_nullable_to_non_nullable
as String,searchedAt: freezed == searchedAt ? _self.searchedAt : searchedAt // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [RecentSearchModel].
extension RecentSearchModelPatterns on RecentSearchModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _RecentSearchModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _RecentSearchModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _RecentSearchModel value)  $default,){
final _that = this;
switch (_that) {
case _RecentSearchModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _RecentSearchModel value)?  $default,){
final _that = this;
switch (_that) {
case _RecentSearchModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String? id, @JsonKey(name: 'user_id')  String? userId,  String query, @JsonKey(name: 'searched_at')  String? searchedAt)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _RecentSearchModel() when $default != null:
return $default(_that.id,_that.userId,_that.query,_that.searchedAt);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String? id, @JsonKey(name: 'user_id')  String? userId,  String query, @JsonKey(name: 'searched_at')  String? searchedAt)  $default,) {final _that = this;
switch (_that) {
case _RecentSearchModel():
return $default(_that.id,_that.userId,_that.query,_that.searchedAt);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String? id, @JsonKey(name: 'user_id')  String? userId,  String query, @JsonKey(name: 'searched_at')  String? searchedAt)?  $default,) {final _that = this;
switch (_that) {
case _RecentSearchModel() when $default != null:
return $default(_that.id,_that.userId,_that.query,_that.searchedAt);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _RecentSearchModel implements RecentSearchModel {
  const _RecentSearchModel({this.id, @JsonKey(name: 'user_id') this.userId, required this.query, @JsonKey(name: 'searched_at') this.searchedAt});
  factory _RecentSearchModel.fromJson(Map<String, dynamic> json) => _$RecentSearchModelFromJson(json);

@override final  String? id;
@override@JsonKey(name: 'user_id') final  String? userId;
@override final  String query;
@override@JsonKey(name: 'searched_at') final  String? searchedAt;

/// Create a copy of RecentSearchModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$RecentSearchModelCopyWith<_RecentSearchModel> get copyWith => __$RecentSearchModelCopyWithImpl<_RecentSearchModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$RecentSearchModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _RecentSearchModel&&(identical(other.id, id) || other.id == id)&&(identical(other.userId, userId) || other.userId == userId)&&(identical(other.query, query) || other.query == query)&&(identical(other.searchedAt, searchedAt) || other.searchedAt == searchedAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,userId,query,searchedAt);

@override
String toString() {
  return 'RecentSearchModel(id: $id, userId: $userId, query: $query, searchedAt: $searchedAt)';
}


}

/// @nodoc
abstract mixin class _$RecentSearchModelCopyWith<$Res> implements $RecentSearchModelCopyWith<$Res> {
  factory _$RecentSearchModelCopyWith(_RecentSearchModel value, $Res Function(_RecentSearchModel) _then) = __$RecentSearchModelCopyWithImpl;
@override @useResult
$Res call({
 String? id,@JsonKey(name: 'user_id') String? userId, String query,@JsonKey(name: 'searched_at') String? searchedAt
});




}
/// @nodoc
class __$RecentSearchModelCopyWithImpl<$Res>
    implements _$RecentSearchModelCopyWith<$Res> {
  __$RecentSearchModelCopyWithImpl(this._self, this._then);

  final _RecentSearchModel _self;
  final $Res Function(_RecentSearchModel) _then;

/// Create a copy of RecentSearchModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = freezed,Object? userId = freezed,Object? query = null,Object? searchedAt = freezed,}) {
  return _then(_RecentSearchModel(
id: freezed == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String?,userId: freezed == userId ? _self.userId : userId // ignore: cast_nullable_to_non_nullable
as String?,query: null == query ? _self.query : query // ignore: cast_nullable_to_non_nullable
as String,searchedAt: freezed == searchedAt ? _self.searchedAt : searchedAt // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}

// dart format on
