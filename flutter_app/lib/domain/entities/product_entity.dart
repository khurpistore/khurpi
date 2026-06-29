import 'package:equatable/equatable.dart';

class ProductEntity extends Equatable {
  final String id;
  final String name;
  final String? description;
  final double price;
  final double? wholesalePrice;
  final String? imageUrl;
  final String? categoryId;
  final String? categoryName;
  final String stockStatus;
  final int stockQuantity;
  final String? unit;
  final double? weight;
  final bool isActive;
  final DateTime? createdAt;

  const ProductEntity({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    this.wholesalePrice,
    this.imageUrl,
    this.categoryId,
    this.categoryName,
    required this.stockStatus,
    required this.stockQuantity,
    this.unit,
    this.weight,
    this.isActive = true,
    this.createdAt,
  });

  bool get isInStock => stockStatus == 'in_stock';
  bool get isGrowing => stockStatus == 'growing';
  bool get isOutOfStock => stockStatus == 'out_of_stock';
  String get displayUnit => unit ?? 'kg';
  String get formattedPrice => '₹${price.toStringAsFixed(0)}/${displayUnit}';

  @override
  List<Object?> get props => [
        id, name, description, price, wholesalePrice, imageUrl,
        categoryId, categoryName, stockStatus, stockQuantity,
        unit, weight, isActive, createdAt,
      ];
}
