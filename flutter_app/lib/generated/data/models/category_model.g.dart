// GENERATED CODE - DO NOT MODIFY BY HAND

part of '../../../data/models/category_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_CategoryModel _$CategoryModelFromJson(Map<String, dynamic> json) =>
    _CategoryModel(
      id: json['id'] as String?,
      mongoId: json['_id'] as String?,
      name: json['name'] as String,
      slug: json['slug'] as String?,
      description: json['description'] as String?,
      image: json['image'] as String?,
      icon: json['icon'] as String?,
      parentId: json['parent_id'] as String?,
      displayOrder: (json['display_order'] as num?)?.toInt() ?? 0,
      active: json['active'] as bool? ?? true,
      showOnHome: json['show_on_home'] as bool? ?? true,
      createdAt: json['created_at'] as String?,
      subcategories:
          (json['subcategories'] as List<dynamic>?)
              ?.map((e) => CategoryModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
    );

Map<String, dynamic> _$CategoryModelToJson(_CategoryModel instance) =>
    <String, dynamic>{
      'id': ?instance.id,
      '_id': ?instance.mongoId,
      'name': instance.name,
      'slug': ?instance.slug,
      'description': ?instance.description,
      'image': ?instance.image,
      'icon': ?instance.icon,
      'parent_id': ?instance.parentId,
      'display_order': instance.displayOrder,
      'active': instance.active,
      'show_on_home': instance.showOnHome,
      'created_at': ?instance.createdAt,
      'subcategories': instance.subcategories.map((e) => e.toJson()).toList(),
    };
