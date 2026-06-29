import '../../domain/entities/banner_entity.dart';

class BannerModel extends BannerEntity {
  const BannerModel({
    required super.id,
    required super.imageUrl,
    super.title,
    super.subtitle,
    super.actionType,
    super.actionValue,
    super.displayOrder,
    super.isActive,
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

  BannerEntity toEntity() => this;
}
