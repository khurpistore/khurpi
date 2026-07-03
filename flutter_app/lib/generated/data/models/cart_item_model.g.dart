// GENERATED CODE - DO NOT MODIFY BY HAND

part of '../../../data/models/cart_item_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_CartItemModel _$CartItemModelFromJson(Map<String, dynamic> json) =>
    _CartItemModel(
      productId: json['productId'] as String,
      productName: json['productName'] as String,
      price: (json['price'] as num).toDouble(),
      wholesalePrice: (json['wholesalePrice'] as num?)?.toDouble(),
      imageUrl: json['imageUrl'] as String?,
      quantity: (json['quantity'] as num).toDouble(),
      unit: json['unit'] as String? ?? 'kg',
    );

Map<String, dynamic> _$CartItemModelToJson(_CartItemModel instance) =>
    <String, dynamic>{
      'productId': instance.productId,
      'productName': instance.productName,
      'price': instance.price,
      'wholesalePrice': ?instance.wholesalePrice,
      'imageUrl': ?instance.imageUrl,
      'quantity': instance.quantity,
      'unit': instance.unit,
    };
