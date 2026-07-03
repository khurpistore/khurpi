// GENERATED CODE - DO NOT MODIFY BY HAND

part of '../../../data/models/create_order_request.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_CreateOrderRequest _$CreateOrderRequestFromJson(Map<String, dynamic> json) =>
    _CreateOrderRequest(
      items: (json['items'] as List<dynamic>)
          .map((e) => OrderItemRequest.fromJson(e as Map<String, dynamic>))
          .toList(),
      deliveryAddress: json['delivery_address'] as String,
      city: json['city'] as String,
      pincode: json['pincode'] as String,
      phone: json['phone'] as String,
      paymentMethod: json['payment_method'] as String,
      notes: json['notes'] as String?,
      deliveryType: json['delivery_type'] as String?,
      deliveryDate: json['delivery_date'] as String?,
      deliverySlotId: json['delivery_slot_id'] as String?,
    );

Map<String, dynamic> _$CreateOrderRequestToJson(_CreateOrderRequest instance) =>
    <String, dynamic>{
      'items': instance.items.map((e) => e.toJson()).toList(),
      'delivery_address': instance.deliveryAddress,
      'city': instance.city,
      'pincode': instance.pincode,
      'phone': instance.phone,
      'payment_method': instance.paymentMethod,
      'notes': ?instance.notes,
      'delivery_type': ?instance.deliveryType,
      'delivery_date': ?instance.deliveryDate,
      'delivery_slot_id': ?instance.deliverySlotId,
    };

_OrderItemRequest _$OrderItemRequestFromJson(Map<String, dynamic> json) =>
    _OrderItemRequest(
      productId: json['product_id'] as String,
      quantity: (json['quantity'] as num).toDouble(),
      unit: json['unit'] as String,
    );

Map<String, dynamic> _$OrderItemRequestToJson(_OrderItemRequest instance) =>
    <String, dynamic>{
      'product_id': instance.productId,
      'quantity': instance.quantity,
      'unit': instance.unit,
    };
