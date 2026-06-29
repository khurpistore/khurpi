class CategoryModel {
  final String id;
  final String name;
  final String? description;
  final String? imageUrl;
  final int displayOrder;
  final bool isActive;

  CategoryModel({
    required this.id,
    required this.name,
    this.description,
    this.imageUrl,
    this.displayOrder = 0,
    this.isActive = true,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['id'] ?? json['_id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'],
      imageUrl: json['image_url'],
      displayOrder: json['display_order'] ?? 0,
      isActive: json['is_active'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'image_url': imageUrl,
      'display_order': displayOrder,
      'is_active': isActive,
    };
  }

  // Category icon mapping
  String get iconName {
    switch (name.toLowerCase()) {
      case 'vegetables':
        return 'vegetables';
      case 'fruits':
        return 'fruits';
      case 'leafy greens':
        return 'leafy';
      case 'root vegetables':
        return 'root';
      case 'exotic & imported':
        return 'exotic';
      case 'microgreens':
        return 'microgreens';
      default:
        return 'default';
    }
  }
}
