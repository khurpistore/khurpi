import '../../domain/entities/product_entity.dart';

class ProductModel extends ProductEntity {
  const ProductModel({
    required super.id,
    required super.name,
    super.description,
    required super.price,
    super.wholesalePrice,
    super.imageUrl,
    super.categoryId,
    super.categoryName,
    required super.stockStatus,
    required super.stockQuantity,
    super.unit,
    super.weight,
    super.isActive,
    super.createdAt,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['id'] ?? json['_id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'],
      price: (json['price'] ?? 0).toDouble(),
      wholesalePrice: json['wholesale_price']?.toDouble(),
      imageUrl: json['image_url'],
      categoryId: json['category_id'],
      categoryName: json['category_name'],
      stockStatus: json['stock_status'] ?? 'out_of_stock',
      stockQuantity: json['stock_quantity'] ?? 0,
      unit: json['unit'],
      weight: json['weight']?.toDouble(),
      isActive: json['is_active'] ?? true,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'price': price,
      'wholesale_price': wholesalePrice,
      'image_url': imageUrl,
      'category_id': categoryId,
      'category_name': categoryName,
      'stock_status': stockStatus,
      'stock_quantity': stockQuantity,
      'unit': unit,
      'weight': weight,
      'is_active': isActive,
    };
  }

  ProductEntity toEntity() => this;
}
