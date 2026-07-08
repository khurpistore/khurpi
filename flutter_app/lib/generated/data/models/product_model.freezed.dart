// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of '../../../data/models/product_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$ProductModel {

@JsonKey(name: 'id') String? get id;@JsonKey(name: '_id') String? get mongoId; String get name; String? get description; String? get benefit; double get price;@JsonKey(name: 'mrp') double? get mrp;@JsonKey(name: 'wholesale_price') double? get wholesalePrice;@JsonKey(name: 'image_url') String? get imageUrl;@JsonKey(name: 'category_id') String? get categoryId;@JsonKey(name: 'category_name') String? get categoryName;@JsonKey(name: 'stock_status') String get stockStatus;@JsonKey(name: 'stock_quantity') int get stockQuantity; String? get unit; double? get weight;@JsonKey(name: 'is_active') bool get isActive;@JsonKey(name: 'created_at') DateTime? get createdAt;
/// Create a copy of ProductModel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ProductModelCopyWith<ProductModel> get copyWith => _$ProductModelCopyWithImpl<ProductModel>(this as ProductModel, _$identity);

  /// Serializes this ProductModel to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is ProductModel&&(identical(other.id, id) || other.id == id)&&(identical(other.mongoId, mongoId) || other.mongoId == mongoId)&&(identical(other.name, name) || other.name == name)&&(identical(other.description, description) || other.description == description)&&(identical(other.benefit, benefit) || other.benefit == benefit)&&(identical(other.price, price) || other.price == price)&&(identical(other.wholesalePrice, wholesalePrice) || other.wholesalePrice == wholesalePrice)&&(identical(other.imageUrl, imageUrl) || other.imageUrl == imageUrl)&&(identical(other.categoryId, categoryId) || other.categoryId == categoryId)&&(identical(other.categoryName, categoryName) || other.categoryName == categoryName)&&(identical(other.stockStatus, stockStatus) || other.stockStatus == stockStatus)&&(identical(other.stockQuantity, stockQuantity) || other.stockQuantity == stockQuantity)&&(identical(other.unit, unit) || other.unit == unit)&&(identical(other.weight, weight) || other.weight == weight)&&(identical(other.isActive, isActive) || other.isActive == isActive)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,mongoId,name,description,benefit,price,wholesalePrice,imageUrl,categoryId,categoryName,stockStatus,stockQuantity,unit,weight,isActive,createdAt);

@override
String toString() {
  return 'ProductModel(id: $id, mongoId: $mongoId, name: $name, description: $description, benefit: $benefit, price: $price, wholesalePrice: $wholesalePrice, imageUrl: $imageUrl, categoryId: $categoryId, categoryName: $categoryName, stockStatus: $stockStatus, stockQuantity: $stockQuantity, unit: $unit, weight: $weight, isActive: $isActive, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class $ProductModelCopyWith<$Res>  {
  factory $ProductModelCopyWith(ProductModel value, $Res Function(ProductModel) _then) = _$ProductModelCopyWithImpl;
@useResult
$Res call({
@JsonKey(name: 'id') String? id,@JsonKey(name: '_id') String? mongoId, String name, String? description, String? benefit, double price,@JsonKey(name: 'wholesale_price') double? wholesalePrice,@JsonKey(name: 'image_url') String? imageUrl,@JsonKey(name: 'category_id') String? categoryId,@JsonKey(name: 'category_name') String? categoryName,@JsonKey(name: 'stock_status') String stockStatus,@JsonKey(name: 'stock_quantity') int stockQuantity, String? unit, double? weight,@JsonKey(name: 'is_active') bool isActive,@JsonKey(name: 'created_at') DateTime? createdAt
});




}
/// @nodoc
class _$ProductModelCopyWithImpl<$Res>
    implements $ProductModelCopyWith<$Res> {
  _$ProductModelCopyWithImpl(this._self, this._then);

  final ProductModel _self;
  final $Res Function(ProductModel) _then;

/// Create a copy of ProductModel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = freezed,Object? mongoId = freezed,Object? name = null,Object? description = freezed,Object? benefit = freezed,Object? price = null,Object? wholesalePrice = freezed,Object? imageUrl = freezed,Object? categoryId = freezed,Object? categoryName = freezed,Object? stockStatus = null,Object? stockQuantity = null,Object? unit = freezed,Object? weight = freezed,Object? isActive = null,Object? createdAt = freezed,}) {
  return _then(_self.copyWith(
id: freezed == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String?,mongoId: freezed == mongoId ? _self.mongoId : mongoId // ignore: cast_nullable_to_non_nullable
as String?,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,description: freezed == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String?,benefit: freezed == benefit ? _self.benefit : benefit // ignore: cast_nullable_to_non_nullable
as String?,price: null == price ? _self.price : price // ignore: cast_nullable_to_non_nullable
as double,wholesalePrice: freezed == wholesalePrice ? _self.wholesalePrice : wholesalePrice // ignore: cast_nullable_to_non_nullable
as double?,imageUrl: freezed == imageUrl ? _self.imageUrl : imageUrl // ignore: cast_nullable_to_non_nullable
as String?,categoryId: freezed == categoryId ? _self.categoryId : categoryId // ignore: cast_nullable_to_non_nullable
as String?,categoryName: freezed == categoryName ? _self.categoryName : categoryName // ignore: cast_nullable_to_non_nullable
as String?,stockStatus: null == stockStatus ? _self.stockStatus : stockStatus // ignore: cast_nullable_to_non_nullable
as String,stockQuantity: null == stockQuantity ? _self.stockQuantity : stockQuantity // ignore: cast_nullable_to_non_nullable
as int,unit: freezed == unit ? _self.unit : unit // ignore: cast_nullable_to_non_nullable
as String?,weight: freezed == weight ? _self.weight : weight // ignore: cast_nullable_to_non_nullable
as double?,isActive: null == isActive ? _self.isActive : isActive // ignore: cast_nullable_to_non_nullable
as bool,createdAt: freezed == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime?,
  ));
}

}


/// Adds pattern-matching-related methods to [ProductModel].
extension ProductModelPatterns on ProductModel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _ProductModel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _ProductModel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _ProductModel value)  $default,){
final _that = this;
switch (_that) {
case _ProductModel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _ProductModel value)?  $default,){
final _that = this;
switch (_that) {
case _ProductModel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(name: 'id')  String? id, @JsonKey(name: '_id')  String? mongoId,  String name,  String? description,  String? benefit,  double price, @JsonKey(name: 'wholesale_price')  double? wholesalePrice, @JsonKey(name: 'image_url')  String? imageUrl, @JsonKey(name: 'category_id')  String? categoryId, @JsonKey(name: 'category_name')  String? categoryName, @JsonKey(name: 'stock_status')  String stockStatus, @JsonKey(name: 'stock_quantity')  int stockQuantity,  String? unit,  double? weight, @JsonKey(name: 'is_active')  bool isActive, @JsonKey(name: 'created_at')  DateTime? createdAt)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _ProductModel() when $default != null:
return $default(_that.id,_that.mongoId,_that.name,_that.description,_that.benefit,_that.price,_that.wholesalePrice,_that.imageUrl,_that.categoryId,_that.categoryName,_that.stockStatus,_that.stockQuantity,_that.unit,_that.weight,_that.isActive,_that.createdAt);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(name: 'id')  String? id, @JsonKey(name: '_id')  String? mongoId,  String name,  String? description,  String? benefit,  double price, @JsonKey(name: 'wholesale_price')  double? wholesalePrice, @JsonKey(name: 'image_url')  String? imageUrl, @JsonKey(name: 'category_id')  String? categoryId, @JsonKey(name: 'category_name')  String? categoryName, @JsonKey(name: 'stock_status')  String stockStatus, @JsonKey(name: 'stock_quantity')  int stockQuantity,  String? unit,  double? weight, @JsonKey(name: 'is_active')  bool isActive, @JsonKey(name: 'created_at')  DateTime? createdAt)  $default,) {final _that = this;
switch (_that) {
case _ProductModel():
return $default(_that.id,_that.mongoId,_that.name,_that.description,_that.benefit,_that.price,_that.wholesalePrice,_that.imageUrl,_that.categoryId,_that.categoryName,_that.stockStatus,_that.stockQuantity,_that.unit,_that.weight,_that.isActive,_that.createdAt);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(name: 'id')  String? id, @JsonKey(name: '_id')  String? mongoId,  String name,  String? description,  String? benefit,  double price, @JsonKey(name: 'wholesale_price')  double? wholesalePrice, @JsonKey(name: 'image_url')  String? imageUrl, @JsonKey(name: 'category_id')  String? categoryId, @JsonKey(name: 'category_name')  String? categoryName, @JsonKey(name: 'stock_status')  String stockStatus, @JsonKey(name: 'stock_quantity')  int stockQuantity,  String? unit,  double? weight, @JsonKey(name: 'is_active')  bool isActive, @JsonKey(name: 'created_at')  DateTime? createdAt)?  $default,) {final _that = this;
switch (_that) {
case _ProductModel() when $default != null:
return $default(_that.id,_that.mongoId,_that.name,_that.description,_that.benefit,_that.price,_that.wholesalePrice,_that.imageUrl,_that.categoryId,_that.categoryName,_that.stockStatus,_that.stockQuantity,_that.unit,_that.weight,_that.isActive,_that.createdAt);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _ProductModel extends ProductModel {
  const _ProductModel({@JsonKey(name: 'id') this.id, @JsonKey(name: '_id') this.mongoId, required this.name, this.description, this.benefit, required this.price, @JsonKey(name: 'mrp') this.mrp, @JsonKey(name: 'wholesale_price') this.wholesalePrice, @JsonKey(name: 'image_url') this.imageUrl, @JsonKey(name: 'category_id') this.categoryId, @JsonKey(name: 'category_name') this.categoryName, @JsonKey(name: 'stock_status') this.stockStatus = 'out_of_stock', @JsonKey(name: 'stock_quantity') this.stockQuantity = 0, this.unit, this.weight, @JsonKey(name: 'is_active') this.isActive = true, @JsonKey(name: 'created_at') this.createdAt}): super._();
  factory _ProductModel.fromJson(Map<String, dynamic> json) => _$ProductModelFromJson(json);

@override@JsonKey(name: 'id') final  String? id;
@override@JsonKey(name: '_id') final  String? mongoId;
@override final  String name;
@override final  String? description;
@override final  String? benefit;
@override final  double price;
@override@JsonKey(name: 'mrp') final  double? mrp;
@override@JsonKey(name: 'wholesale_price') final  double? wholesalePrice;
@override@JsonKey(name: 'image_url') final  String? imageUrl;
@override@JsonKey(name: 'category_id') final  String? categoryId;
@override@JsonKey(name: 'category_name') final  String? categoryName;
@override@JsonKey(name: 'stock_status') final  String stockStatus;
@override@JsonKey(name: 'stock_quantity') final  int stockQuantity;
@override final  String? unit;
@override final  double? weight;
@override@JsonKey(name: 'is_active') final  bool isActive;
@override@JsonKey(name: 'created_at') final  DateTime? createdAt;

/// Create a copy of ProductModel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ProductModelCopyWith<_ProductModel> get copyWith => __$ProductModelCopyWithImpl<_ProductModel>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$ProductModelToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _ProductModel&&(identical(other.id, id) || other.id == id)&&(identical(other.mongoId, mongoId) || other.mongoId == mongoId)&&(identical(other.name, name) || other.name == name)&&(identical(other.description, description) || other.description == description)&&(identical(other.benefit, benefit) || other.benefit == benefit)&&(identical(other.price, price) || other.price == price)&&(identical(other.wholesalePrice, wholesalePrice) || other.wholesalePrice == wholesalePrice)&&(identical(other.imageUrl, imageUrl) || other.imageUrl == imageUrl)&&(identical(other.categoryId, categoryId) || other.categoryId == categoryId)&&(identical(other.categoryName, categoryName) || other.categoryName == categoryName)&&(identical(other.stockStatus, stockStatus) || other.stockStatus == stockStatus)&&(identical(other.stockQuantity, stockQuantity) || other.stockQuantity == stockQuantity)&&(identical(other.unit, unit) || other.unit == unit)&&(identical(other.weight, weight) || other.weight == weight)&&(identical(other.isActive, isActive) || other.isActive == isActive)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,mongoId,name,description,benefit,price,wholesalePrice,imageUrl,categoryId,categoryName,stockStatus,stockQuantity,unit,weight,isActive,createdAt);

@override
String toString() {
  return 'ProductModel(id: $id, mongoId: $mongoId, name: $name, description: $description, benefit: $benefit, price: $price, wholesalePrice: $wholesalePrice, imageUrl: $imageUrl, categoryId: $categoryId, categoryName: $categoryName, stockStatus: $stockStatus, stockQuantity: $stockQuantity, unit: $unit, weight: $weight, isActive: $isActive, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class _$ProductModelCopyWith<$Res> implements $ProductModelCopyWith<$Res> {
  factory _$ProductModelCopyWith(_ProductModel value, $Res Function(_ProductModel) _then) = __$ProductModelCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(name: 'id') String? id,@JsonKey(name: '_id') String? mongoId, String name, String? description, String? benefit, double price,@JsonKey(name: 'wholesale_price') double? wholesalePrice,@JsonKey(name: 'image_url') String? imageUrl,@JsonKey(name: 'category_id') String? categoryId,@JsonKey(name: 'category_name') String? categoryName,@JsonKey(name: 'stock_status') String stockStatus,@JsonKey(name: 'stock_quantity') int stockQuantity, String? unit, double? weight,@JsonKey(name: 'is_active') bool isActive,@JsonKey(name: 'created_at') DateTime? createdAt
});




}
/// @nodoc
class __$ProductModelCopyWithImpl<$Res>
    implements _$ProductModelCopyWith<$Res> {
  __$ProductModelCopyWithImpl(this._self, this._then);

  final _ProductModel _self;
  final $Res Function(_ProductModel) _then;

/// Create a copy of ProductModel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = freezed,Object? mongoId = freezed,Object? name = null,Object? description = freezed,Object? benefit = freezed,Object? price = null,Object? wholesalePrice = freezed,Object? imageUrl = freezed,Object? categoryId = freezed,Object? categoryName = freezed,Object? stockStatus = null,Object? stockQuantity = null,Object? unit = freezed,Object? weight = freezed,Object? isActive = null,Object? createdAt = freezed,}) {
  return _then(_ProductModel(
mrp: _self.mrp,
id: freezed == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String?,mongoId: freezed == mongoId ? _self.mongoId : mongoId // ignore: cast_nullable_to_non_nullable
as String?,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,description: freezed == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String?,benefit: freezed == benefit ? _self.benefit : benefit // ignore: cast_nullable_to_non_nullable
as String?,price: null == price ? _self.price : price // ignore: cast_nullable_to_non_nullable
as double,wholesalePrice: freezed == wholesalePrice ? _self.wholesalePrice : wholesalePrice // ignore: cast_nullable_to_non_nullable
as double?,imageUrl: freezed == imageUrl ? _self.imageUrl : imageUrl // ignore: cast_nullable_to_non_nullable
as String?,categoryId: freezed == categoryId ? _self.categoryId : categoryId // ignore: cast_nullable_to_non_nullable
as String?,categoryName: freezed == categoryName ? _self.categoryName : categoryName // ignore: cast_nullable_to_non_nullable
as String?,stockStatus: null == stockStatus ? _self.stockStatus : stockStatus // ignore: cast_nullable_to_non_nullable
as String,stockQuantity: null == stockQuantity ? _self.stockQuantity : stockQuantity // ignore: cast_nullable_to_non_nullable
as int,unit: freezed == unit ? _self.unit : unit // ignore: cast_nullable_to_non_nullable
as String?,weight: freezed == weight ? _self.weight : weight // ignore: cast_nullable_to_non_nullable
as double?,isActive: null == isActive ? _self.isActive : isActive // ignore: cast_nullable_to_non_nullable
as bool,createdAt: freezed == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as DateTime?,
  ));
}


}

// dart format on
