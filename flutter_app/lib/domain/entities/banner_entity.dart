import 'package:equatable/equatable.dart';

class BannerEntity extends Equatable {
  final String id;
  final String imageUrl;
  final String? title;
  final String? subtitle;
  final String? actionType;
  final String? actionValue;
  final int displayOrder;
  final bool isActive;

  const BannerEntity({
    required this.id,
    required this.imageUrl,
    this.title,
    this.subtitle,
    this.actionType,
    this.actionValue,
    this.displayOrder = 0,
    this.isActive = true,
  });

  @override
  List<Object?> get props => [id, imageUrl, title, subtitle, actionType, actionValue, displayOrder, isActive];
}
