import 'package:freezed_annotation/freezed_annotation.dart';

part '../../generated/data/models/subcategory_model.freezed.dart';
part '../../generated/data/models/subcategory_model.g.dart';

@freezed
abstract class SubcategoryModel with _$SubcategoryModel {
  const SubcategoryModel._();
  
  const factory SubcategoryModel({
    required String id,
    required String name,
    String? slug,
    String? description,
    String? image,
    @JsonKey(name: 'parent_category_id') required String parentCategoryId,
    @JsonKey(name: 'display_order') @Default(0) int displayOrder,
    @Default(true) bool active,
  }) = _SubcategoryModel;

  factory SubcategoryModel.fromJson(Map<String, dynamic> json) =>
      _$SubcategoryModelFromJson(json);
}
