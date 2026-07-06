// GENERATED CODE - DO NOT MODIFY BY HAND

part of '../../../data/models/banner_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_BannerModel _$BannerModelFromJson(Map<String, dynamic> json) => _BannerModel(
  id: json['id'] as String?,
  imageUrl: json['image_url'] as String? ?? '',
  title: json['title'] as String?,
  subtitle: json['subtitle'] as String?,
  linkType: json['link_type'] as String?,
  linkValue: json['link_value'] as String?,
  actionType: json['action_type'] as String?,
  actionValue: json['action_value'] as String?,
  displayOrder: (json['display_order'] as num?)?.toInt() ?? 0,
  active: json['active'] as bool? ?? true,
  startDate: json['start_date'] as String?,
  endDate: json['end_date'] as String?,
  createdAt: json['created_at'] as String?,
);

Map<String, dynamic> _$BannerModelToJson(_BannerModel instance) =>
    <String, dynamic>{
      'id': ?instance.id,
      'image_url': instance.imageUrl,
      'title': ?instance.title,
      'subtitle': ?instance.subtitle,
      'link_type': ?instance.linkType,
      'link_value': ?instance.linkValue,
      'action_type': ?instance.actionType,
      'action_value': ?instance.actionValue,
      'display_order': instance.displayOrder,
      'active': instance.active,
      'start_date': ?instance.startDate,
      'end_date': ?instance.endDate,
      'created_at': ?instance.createdAt,
    };
