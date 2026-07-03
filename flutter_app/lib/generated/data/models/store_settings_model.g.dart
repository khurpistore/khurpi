// GENERATED CODE - DO NOT MODIFY BY HAND

part of '../../../data/models/store_settings_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_StoreSettingsModel _$StoreSettingsModelFromJson(
  Map<String, dynamic> json,
) => _StoreSettingsModel(
  storeName: json['store_name'] as String? ?? 'Khurpi Fresh',
  storePhone: json['store_phone'] as String?,
  storeEmail: json['store_email'] as String?,
  storeAddress: json['store_address'] as String?,
  minOrderValue: (json['min_order_value'] as num?)?.toDouble() ?? 0,
  defaultDeliveryFee: (json['default_delivery_fee'] as num?)?.toDouble() ?? 30,
  minOrderForFreeDelivery:
      (json['min_order_for_free_delivery'] as num?)?.toDouble() ?? 500,
  instantDeliveryEnabled: json['instant_delivery_enabled'] as bool? ?? true,
  instantDeliveryFee: (json['instant_delivery_fee'] as num?)?.toDouble() ?? 30,
  instantDeliveryTimeMinutes:
      (json['instant_delivery_time_minutes'] as num?)?.toInt() ?? 60,
  slottedDeliveryEnabled: json['slotted_delivery_enabled'] as bool? ?? true,
  storeLatitude: (json['store_latitude'] as num?)?.toDouble(),
  storeLongitude: (json['store_longitude'] as num?)?.toDouble(),
  deliveryRadiusKm: (json['delivery_radius_km'] as num?)?.toDouble() ?? 10,
);

Map<String, dynamic> _$StoreSettingsModelToJson(_StoreSettingsModel instance) =>
    <String, dynamic>{
      'store_name': instance.storeName,
      'store_phone': ?instance.storePhone,
      'store_email': ?instance.storeEmail,
      'store_address': ?instance.storeAddress,
      'min_order_value': instance.minOrderValue,
      'default_delivery_fee': instance.defaultDeliveryFee,
      'min_order_for_free_delivery': instance.minOrderForFreeDelivery,
      'instant_delivery_enabled': instance.instantDeliveryEnabled,
      'instant_delivery_fee': instance.instantDeliveryFee,
      'instant_delivery_time_minutes': instance.instantDeliveryTimeMinutes,
      'slotted_delivery_enabled': instance.slottedDeliveryEnabled,
      'store_latitude': ?instance.storeLatitude,
      'store_longitude': ?instance.storeLongitude,
      'delivery_radius_km': instance.deliveryRadiusKm,
    };
