import 'package:freezed_annotation/freezed_annotation.dart';

part '../../generated/data/models/category_model.freezed.dart';
part '../../generated/data/models/category_model.g.dart';


@freezed
abstract class CategoryModel with _$CategoryModel {
  const CategoryModel._(); // Add private constructor for extensions

  const factory CategoryModel({
    @JsonKey(name: 'id') String? id,
    @JsonKey(name: '_id') String? mongoId,
    required String name,
    String? slug,
    String? description,
    String? image,
    String? icon,
    @JsonKey(name: 'parent_id') String? parentId,
    @JsonKey(name: 'display_order') @Default(0) int displayOrder,
    @Default(true) bool active,
    @JsonKey(name: 'show_on_home') @Default(true) bool showOnHome,
    @JsonKey(name: 'created_at') String? createdAt,
    @Default([]) List<CategoryModel> subcategories,
  }) = _CategoryModel;

  factory CategoryModel.fromJson(Map<String, dynamic> json) =>
      _$CategoryModelFromJson(json);

  // Getter for categoryId
  String get categoryId => id ?? mongoId ?? '';
  
  // Getter for imageUrl (for backward compatibility)
  String? get imageUrl => image;

  static CategoryModel initial() {
    return const CategoryModel(
      name: '',
    );
  }
}
