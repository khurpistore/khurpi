// GENERATED CODE - DO NOT MODIFY BY HAND

part of '../../../data/models/banner_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_BannerModel _$BannerModelFromJson(Map<String, dynamic> json) => _BannerModel(
  id: json['id'] as String?,
  mongoId: json['_id'] as String?,
  imageUrl: json['image_url'] as String,
  title: json['title'] as String?,
  subtitle: json['subtitle'] as String?,
  actionType: json['action_type'] as String?,
  actionValue: json['action_value'] as String?,
  displayOrder: (json['display_order'] as num?)?.toInt() ?? 0,
  isActive: json['is_active'] as bool? ?? true,
);

Map<String, dynamic> _$BannerModelToJson(_BannerModel instance) =>
    <String, dynamic>{
      'id': ?instance.id,
      '_id': ?instance.mongoId,
      'image_url': instance.imageUrl,
      'title': ?instance.title,
      'subtitle': ?instance.subtitle,
      'action_type': ?instance.actionType,
      'action_value': ?instance.actionValue,
      'display_order': instance.displayOrder,
      'is_active': instance.isActive,
    };
