class ProductModel {
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

  ProductModel({
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

  // Helper methods
  bool get isInStock => stockStatus == 'in_stock';
  bool get isGrowing => stockStatus == 'growing';
  bool get isOutOfStock => stockStatus == 'out_of_stock';
  
  String get displayUnit => unit ?? 'kg';
  
  String get formattedPrice => '₹${price.toStringAsFixed(2)}/${displayUnit}';
  
  String? get formattedWholesalePrice => 
      wholesalePrice != null ? '₹${wholesalePrice!.toStringAsFixed(2)}/${displayUnit}' : null;
}
