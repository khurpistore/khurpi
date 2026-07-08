// GENERATED CODE - DO NOT MODIFY BY HAND

part of '../../../data/models/product_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_ProductModel _$ProductModelFromJson(Map<String, dynamic> json) =>
    _ProductModel(
      id: json['id'] as String?,
      mongoId: json['_id'] as String?,
      name: json['name'] as String,
      description: json['description'] as String?,
      benefit: json['benefit'] as String?,
      price: (json['price'] as num).toDouble(),
      mrp: (json['mrp'] as num?)?.toDouble(),
      wholesalePrice: (json['wholesale_price'] as num?)?.toDouble(),
      imageUrl: json['image_url'] as String?,
      categoryId: json['category_id'] as String?,
      categoryName: json['category_name'] as String?,
      stockStatus: json['stock_status'] as String? ?? 'out_of_stock',
      stockQuantity: (json['stock_quantity'] as num?)?.toInt() ?? 0,
      unit: json['unit'] as String?,
      weight: (json['weight'] as num?)?.toDouble(),
      isActive: json['is_active'] as bool? ?? true,
      createdAt: json['created_at'] == null
          ? null
          : DateTime.parse(json['created_at'] as String),
    );

Map<String, dynamic> _$ProductModelToJson(_ProductModel instance) =>
    <String, dynamic>{
      'id': ?instance.id,
      '_id': ?instance.mongoId,
      'name': instance.name,
      'description': ?instance.description,
      'benefit': ?instance.benefit,
      'price': instance.price,
      'mrp': ?instance.mrp,
      'wholesale_price': ?instance.wholesalePrice,
      'image_url': ?instance.imageUrl,
      'category_id': ?instance.categoryId,
      'category_name': ?instance.categoryName,
      'stock_status': instance.stockStatus,
      'stock_quantity': instance.stockQuantity,
      'unit': ?instance.unit,
      'weight': ?instance.weight,
      'is_active': instance.isActive,
      'created_at': ?instance.createdAt?.toIso8601String(),
    };
