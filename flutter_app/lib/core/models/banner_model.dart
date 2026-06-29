class BannerModel {
  final String id;
  final String imageUrl;
  final String? title;
  final String? subtitle;
  final String? actionType;
  final String? actionValue;
  final int displayOrder;
  final bool isActive;

  BannerModel({
    required this.id,
    required this.imageUrl,
    this.title,
    this.subtitle,
    this.actionType,
    this.actionValue,
    this.displayOrder = 0,
    this.isActive = true,
  });

  factory BannerModel.fromJson(Map<String, dynamic> json) {
    return BannerModel(
      id: json['id'] ?? json['_id'] ?? '',
      imageUrl: json['image_url'] ?? '',
      title: json['title'],
      subtitle: json['subtitle'],
      actionType: json['action_type'],
      actionValue: json['action_value'],
      displayOrder: json['display_order'] ?? 0,
      isActive: json['is_active'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'image_url': imageUrl,
      'title': title,
      'subtitle': subtitle,
      'action_type': actionType,
      'action_value': actionValue,
      'display_order': displayOrder,
      'is_active': isActive,
    };
  }
}
