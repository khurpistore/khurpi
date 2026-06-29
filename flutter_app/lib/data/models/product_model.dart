import 'package:freezed_annotation/freezed_annotation.dart';

part 'product_model.freezed.dart';
part 'product_model.g.dart';

@freezed
abstract class ProductModel with _$ProductModel {
  const ProductModel._(); // Add private constructor for extensions
  
  const factory ProductModel({
    @JsonKey(name: 'id') String? id,
    @JsonKey(name: '_id') String? mongoId,
    required String name,
    String? description,
    String? benefit,
    required double price,
    @JsonKey(name: 'wholesale_price') double? wholesalePrice,
    @JsonKey(name: 'image_url') String? imageUrl,
    @JsonKey(name: 'category_id') String? categoryId,
    @JsonKey(name: 'category_name') String? categoryName,
    @JsonKey(name: 'stock_status') @Default('out_of_stock') String stockStatus,
    @JsonKey(name: 'stock_quantity') @Default(0) int stockQuantity,
    String? unit,
    double? weight,
    @JsonKey(name: 'is_active') @Default(true) bool isActive,
    @JsonKey(name: 'created_at') DateTime? createdAt,
  }) = _ProductModel;

  factory ProductModel.fromJson(Map<String, dynamic> json) =>
      _$ProductModelFromJson(json);

  // Getter for productId
  String get productId => id ?? mongoId ?? '';
  
  // Getter for display benefit/description
  String get displayBenefit => benefit ?? description ?? '';

  static ProductModel initial() {
    return const ProductModel(
      name: '',
      price: 0,
      stockStatus: 'out_of_stock',
      stockQuantity: 0,
    );
  }
}
