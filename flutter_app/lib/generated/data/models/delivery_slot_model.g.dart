// GENERATED CODE - DO NOT MODIFY BY HAND

part of '../../../data/models/delivery_slot_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_DeliverySlotModel _$DeliverySlotModelFromJson(Map<String, dynamic> json) =>
    _DeliverySlotModel(
      id: json['id'] as String,
      name: json['name'] as String,
      startTime: json['start_time'] as String,
      endTime: json['end_time'] as String,
      displayText: json['display_text'] as String?,
      deliveryFee: (json['delivery_fee'] as num?)?.toDouble() ?? 0,
      maxOrders: (json['max_orders'] as num?)?.toInt() ?? 50,
      displayOrder: (json['display_order'] as num?)?.toInt() ?? 0,
      active: json['active'] as bool? ?? true,
      availableDays: (json['available_days'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      available: json['available'] as bool? ?? true,
      ordersCount: (json['orders_count'] as num?)?.toInt() ?? 0,
      remainingCapacity: (json['remaining_capacity'] as num?)?.toInt(),
    );

Map<String, dynamic> _$DeliverySlotModelToJson(_DeliverySlotModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'start_time': instance.startTime,
      'end_time': instance.endTime,
      'display_text': ?instance.displayText,
      'delivery_fee': instance.deliveryFee,
      'max_orders': instance.maxOrders,
      'display_order': instance.displayOrder,
      'active': instance.active,
      'available_days': ?instance.availableDays,
      'available': instance.available,
      'orders_count': instance.ordersCount,
      'remaining_capacity': ?instance.remainingCapacity,
    };
