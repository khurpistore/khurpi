import 'package:freezed_annotation/freezed_annotation.dart';

part '../../generated/models/category_model.freezed.dart';
part '../../generated/models/category_model.g.dart';

@freezed
abstract class CategoryModel with _$CategoryModel {
  const CategoryModel._(); // Add private constructor for extensions
  
  const factory CategoryModel({
    @JsonKey(name: 'id') String? id,
    @JsonKey(name: '_id') String? mongoId,
    required String name,
    String? description,
    @JsonKey(name: 'image_url') String? imageUrl,
    @JsonKey(name: 'display_order') @Default(0) int displayOrder,
    @JsonKey(name: 'is_active') @Default(true) bool isActive,
  }) = _CategoryModel;

  factory CategoryModel.fromJson(Map<String, dynamic> json) =>
      _$CategoryModelFromJson(json);

  // Getter for categoryId
  String get categoryId => id ?? mongoId ?? '';

  static CategoryModel initial() {
    return const CategoryModel(
      name: '',
    );
  }
}
