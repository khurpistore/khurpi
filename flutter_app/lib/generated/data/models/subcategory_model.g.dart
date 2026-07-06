// GENERATED CODE - DO NOT MODIFY BY HAND

part of '../../../data/models/subcategory_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_SubcategoryModel _$SubcategoryModelFromJson(Map<String, dynamic> json) =>
    _SubcategoryModel(
      id: json['id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String?,
      description: json['description'] as String?,
      image: json['image'] as String?,
      parentCategoryId: json['parent_category_id'] as String,
      displayOrder: (json['display_order'] as num?)?.toInt() ?? 0,
      active: json['active'] as bool? ?? true,
    );

Map<String, dynamic> _$SubcategoryModelToJson(_SubcategoryModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'slug': ?instance.slug,
      'description': ?instance.description,
      'image': ?instance.image,
      'parent_category_id': instance.parentCategoryId,
      'display_order': instance.displayOrder,
      'active': instance.active,
    };
