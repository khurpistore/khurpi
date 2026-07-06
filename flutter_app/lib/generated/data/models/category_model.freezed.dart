// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of '../../../data/models/category_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$CategoryModel {

@JsonKey(name: 'id') String? get id;@JsonKey(name: '_id') String? get mongoId; String get name; String? get slug; String? get description; String? get image; String? get icon;@JsonKey(name: 'parent_id') String? get parentId;@JsonKey(name: 'display_order') int get displayOrder; bool get active;@JsonKey(name: 'show_on_home') bool get showOnHome;@JsonKey(name: 'created_at') String? get createdAt; List<CategoryModel> get subcategories;
/// Create a copy of CategoryModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$CategoryModelCopyWith<CategoryModel> get copyWith => _$CategoryModelCopyWithImpl<CategoryModel>(this as CategoryModel, _$identity);

  /// Serializes this CategoryModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is CategoryModel&&(identical(other.id, id) || other.id == id)&&(identical(other.mongoId, mongoId) || other.mongoId == mongoId)&&(identical(other.name, name) || other.name == name)&&(identical(other.slug, slug) || other.slug == slug)&&(identical(other.description, description) || other.description == description)&&(identical(other.image, image) || other.image == image)&&(identical(other.icon, icon) || other.icon == icon)&&(identical(other.parentId, parentId) || other.parentId == parentId)&&(identical(other.displayOrder, displayOrder) || other.displayOrder == displayOrder)&&(identical(other.active, active) || other.active == active)&&(identical(other.showOnHome, showOnHome) || other.showOnHome == showOnHome)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&const DeepCollectionEquality().equals(other.subcategories, subcategories));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,mongoId,name,slug,description,image,icon,parentId,displayOrder,active,showOnHome,createdAt,const DeepCollectionEquality().hash(subcategories));

@override
String toString() {
  return 'CategoryModel(id: $id, mongoId: $mongoId, name: $name, slug: $slug, description: $description, image: $image, icon: $icon, parentId: $parentId, displayOrder: $displayOrder, active: $active, showOnHome: $showOnHome, createdAt: $createdAt, subcategories: $subcategories)';
}


}

/// @nodoc
abstract mixin class $CategoryModelCopyWith<$Res>  {
  factory $CategoryModelCopyWith(CategoryModel value, $Res Function(CategoryModel) _then) = _$CategoryModelCopyWithImpl;
@useResult
$Res call({
@JsonKey(name: 'id') String? id,@JsonKey(name: '_id') String? mongoId, String name, String? slug, String? description, String? image, String? icon,@JsonKey(name: 'parent_id') String? parentId,@JsonKey(name: 'display_order') int displayOrder, bool active,@JsonKey(name: 'show_on_home') bool showOnHome,@JsonKey(name: 'created_at') String? createdAt, List<CategoryModel> subcategories
});




}
/// @nodoc
class _$CategoryModelCopyWithImpl<$Res>
    implements $CategoryModelCopyWith<$Res> {
  _$CategoryModelCopyWithImpl(this._self, this._then);

  final CategoryModel _self;
  final $Res Function(CategoryModel) _then;

/// Create a copy of CategoryModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = freezed,Object? mongoId = freezed,Object? name = null,Object? slug = freezed,Object? description = freezed,Object? image = freezed,Object? icon = freezed,Object? parentId = freezed,Object? displayOrder = null,Object? active = null,Object? showOnHome = null,Object? createdAt = freezed,Object? subcategories = null,}) {
  return _then(_self.copyWith(
id: freezed == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String?,mongoId: freezed == mongoId ? _self.mongoId : mongoId // ignore: cast_nullable_to_non_nullable
as String?,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,slug: freezed == slug ? _self.slug : slug // ignore: cast_nullable_to_non_nullable
as String?,description: freezed == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String?,image: freezed == image ? _self.image : image // ignore: cast_nullable_to_non_nullable
as String?,icon: freezed == icon ? _self.icon : icon // ignore: cast_nullable_to_non_nullable
as String?,parentId: freezed == parentId ? _self.parentId : parentId // ignore: cast_nullable_to_non_nullable
as String?,displayOrder: null == displayOrder ? _self.displayOrder : displayOrder // ignore: cast_nullable_to_non_nullable
as int,active: null == active ? _self.active : active // ignore: cast_nullable_to_non_nullable
as bool,showOnHome: null == showOnHome ? _self.showOnHome : showOnHome // ignore: cast_nullable_to_non_nullable
as bool,createdAt: freezed == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as String?,subcategories: null == subcategories ? _self.subcategories : subcategories // ignore: cast_nullable_to_non_nullable
as List<CategoryModel>,
  ));
}

}


/// Adds pattern-matching-related methods to [CategoryModel].
extension CategoryModelPatterns on CategoryModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _CategoryModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _CategoryModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _CategoryModel value)  $default,){
final _that = this;
switch (_that) {
case _CategoryModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _CategoryModel value)?  $default,){
final _that = this;
switch (_that) {
case _CategoryModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(name: 'id')  String? id, @JsonKey(name: '_id')  String? mongoId,  String name,  String? slug,  String? description,  String? image,  String? icon, @JsonKey(name: 'parent_id')  String? parentId, @JsonKey(name: 'display_order')  int displayOrder,  bool active, @JsonKey(name: 'show_on_home')  bool showOnHome, @JsonKey(name: 'created_at')  String? createdAt,  List<CategoryModel> subcategories)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _CategoryModel() when $default != null:
return $default(_that.id,_that.mongoId,_that.name,_that.slug,_that.description,_that.image,_that.icon,_that.parentId,_that.displayOrder,_that.active,_that.showOnHome,_that.createdAt,_that.subcategories);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(name: 'id')  String? id, @JsonKey(name: '_id')  String? mongoId,  String name,  String? slug,  String? description,  String? image,  String? icon, @JsonKey(name: 'parent_id')  String? parentId, @JsonKey(name: 'display_order')  int displayOrder,  bool active, @JsonKey(name: 'show_on_home')  bool showOnHome, @JsonKey(name: 'created_at')  String? createdAt,  List<CategoryModel> subcategories)  $default,) {final _that = this;
switch (_that) {
case _CategoryModel():
return $default(_that.id,_that.mongoId,_that.name,_that.slug,_that.description,_that.image,_that.icon,_that.parentId,_that.displayOrder,_that.active,_that.showOnHome,_that.createdAt,_that.subcategories);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(name: 'id')  String? id, @JsonKey(name: '_id')  String? mongoId,  String name,  String? slug,  String? description,  String? image,  String? icon, @JsonKey(name: 'parent_id')  String? parentId, @JsonKey(name: 'display_order')  int displayOrder,  bool active, @JsonKey(name: 'show_on_home')  bool showOnHome, @JsonKey(name: 'created_at')  String? createdAt,  List<CategoryModel> subcategories)?  $default,) {final _that = this;
switch (_that) {
case _CategoryModel() when $default != null:
return $default(_that.id,_that.mongoId,_that.name,_that.slug,_that.description,_that.image,_that.icon,_that.parentId,_that.displayOrder,_that.active,_that.showOnHome,_that.createdAt,_that.subcategories);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _CategoryModel extends CategoryModel {
  const _CategoryModel({@JsonKey(name: 'id') this.id, @JsonKey(name: '_id') this.mongoId, required this.name, this.slug, this.description, this.image, this.icon, @JsonKey(name: 'parent_id') this.parentId, @JsonKey(name: 'display_order') this.displayOrder = 0, this.active = true, @JsonKey(name: 'show_on_home') this.showOnHome = true, @JsonKey(name: 'created_at') this.createdAt, final  List<CategoryModel> subcategories = const []}): _subcategories = subcategories,super._();
  factory _CategoryModel.fromJson(Map<String, dynamic> json) => _$CategoryModelFromJson(json);

@override@JsonKey(name: 'id') final  String? id;
@override@JsonKey(name: '_id') final  String? mongoId;
@override final  String name;
@override final  String? slug;
@override final  String? description;
@override final  String? image;
@override final  String? icon;
@override@JsonKey(name: 'parent_id') final  String? parentId;
@override@JsonKey(name: 'display_order') final  int displayOrder;
@override@JsonKey() final  bool active;
@override@JsonKey(name: 'show_on_home') final  bool showOnHome;
@override@JsonKey(name: 'created_at') final  String? createdAt;
 final  List<CategoryModel> _subcategories;
@override@JsonKey() List<CategoryModel> get subcategories {
  if (_subcategories is EqualUnmodifiableListView) return _subcategories;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_subcategories);
}


/// Create a copy of CategoryModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$CategoryModelCopyWith<_CategoryModel> get copyWith => __$CategoryModelCopyWithImpl<_CategoryModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$CategoryModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _CategoryModel&&(identical(other.id, id) || other.id == id)&&(identical(other.mongoId, mongoId) || other.mongoId == mongoId)&&(identical(other.name, name) || other.name == name)&&(identical(other.slug, slug) || other.slug == slug)&&(identical(other.description, description) || other.description == description)&&(identical(other.image, image) || other.image == image)&&(identical(other.icon, icon) || other.icon == icon)&&(identical(other.parentId, parentId) || other.parentId == parentId)&&(identical(other.displayOrder, displayOrder) || other.displayOrder == displayOrder)&&(identical(other.active, active) || other.active == active)&&(identical(other.showOnHome, showOnHome) || other.showOnHome == showOnHome)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&const DeepCollectionEquality().equals(other._subcategories, _subcategories));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,mongoId,name,slug,description,image,icon,parentId,displayOrder,active,showOnHome,createdAt,const DeepCollectionEquality().hash(_subcategories));

@override
String toString() {
  return 'CategoryModel(id: $id, mongoId: $mongoId, name: $name, slug: $slug, description: $description, image: $image, icon: $icon, parentId: $parentId, displayOrder: $displayOrder, active: $active, showOnHome: $showOnHome, createdAt: $createdAt, subcategories: $subcategories)';
}


}

/// @nodoc
abstract mixin class _$CategoryModelCopyWith<$Res> implements $CategoryModelCopyWith<$Res> {
  factory _$CategoryModelCopyWith(_CategoryModel value, $Res Function(_CategoryModel) _then) = __$CategoryModelCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(name: 'id') String? id,@JsonKey(name: '_id') String? mongoId, String name, String? slug, String? description, String? image, String? icon,@JsonKey(name: 'parent_id') String? parentId,@JsonKey(name: 'display_order') int displayOrder, bool active,@JsonKey(name: 'show_on_home') bool showOnHome,@JsonKey(name: 'created_at') String? createdAt, List<CategoryModel> subcategories
});




}
/// @nodoc
class __$CategoryModelCopyWithImpl<$Res>
    implements _$CategoryModelCopyWith<$Res> {
  __$CategoryModelCopyWithImpl(this._self, this._then);

  final _CategoryModel _self;
  final $Res Function(_CategoryModel) _then;

/// Create a copy of CategoryModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = freezed,Object? mongoId = freezed,Object? name = null,Object? slug = freezed,Object? description = freezed,Object? image = freezed,Object? icon = freezed,Object? parentId = freezed,Object? displayOrder = null,Object? active = null,Object? showOnHome = null,Object? createdAt = freezed,Object? subcategories = null,}) {
  return _then(_CategoryModel(
id: freezed == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String?,mongoId: freezed == mongoId ? _self.mongoId : mongoId // ignore: cast_nullable_to_non_nullable
as String?,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,slug: freezed == slug ? _self.slug : slug // ignore: cast_nullable_to_non_nullable
as String?,description: freezed == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String?,image: freezed == image ? _self.image : image // ignore: cast_nullable_to_non_nullable
as String?,icon: freezed == icon ? _self.icon : icon // ignore: cast_nullable_to_non_nullable
as String?,parentId: freezed == parentId ? _self.parentId : parentId // ignore: cast_nullable_to_non_nullable
as String?,displayOrder: null == displayOrder ? _self.displayOrder : displayOrder // ignore: cast_nullable_to_non_nullable
as int,active: null == active ? _self.active : active // ignore: cast_nullable_to_non_nullable
as bool,showOnHome: null == showOnHome ? _self.showOnHome : showOnHome // ignore: cast_nullable_to_non_nullable
as bool,createdAt: freezed == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as String?,subcategories: null == subcategories ? _self._subcategories : subcategories // ignore: cast_nullable_to_non_nullable
as List<CategoryModel>,
  ));
}


}

// dart format on
