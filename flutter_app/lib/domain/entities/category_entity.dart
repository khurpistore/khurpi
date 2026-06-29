import 'package:equatable/equatable.dart';

class CategoryEntity extends Equatable {
  final String id;
  final String name;
  final String? description;
  final String? imageUrl;
  final int displayOrder;
  final bool isActive;

  const CategoryEntity({
    required this.id,
    required this.name,
    this.description,
    this.imageUrl,
    this.displayOrder = 0,
    this.isActive = true,
  });

  @override
  List<Object?> get props => [id, name, description, imageUrl, displayOrder, isActive];
}
