// GENERATED CODE - DO NOT MODIFY BY HAND

part of '../../../data/models/order_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_OrderModel _$OrderModelFromJson(Map<String, dynamic> json) => _OrderModel(
  id: json['id'] as String?,
  mongoId: json['_id'] as String?,
  userId: json['user_id'] as String? ?? '',
  userName: json['user_name'] as String?,
  userPhone: json['user_phone'] as String?,
  items:
      (json['items'] as List<dynamic>?)
          ?.map((e) => OrderItemModel.fromJson(e as Map<String, dynamic>))
          .toList() ??
      const [],
  oneTimeItems:
      (json['one_time_items'] as List<dynamic>?)
          ?.map((e) => OrderItemModel.fromJson(e as Map<String, dynamic>))
          .toList() ??
      const [],
  subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0.0,
  deliveryFee: (json['delivery_fee'] as num?)?.toDouble() ?? 0.0,
  discount: (json['discount'] as num?)?.toDouble() ?? 0.0,
  total: (json['total'] as num?)?.toDouble() ?? 0.0,
  status: json['status'] as String? ?? 'pending',
  deliveryAddress: json['delivery_address'] as String? ?? '',
  city: json['city'] as String?,
  pincode: json['pincode'] as String?,
  phone: json['phone'] as String? ?? '',
  deliverySlot: json['delivery_slot'] as String?,
  deliveryDate: json['delivery_date'] == null
      ? null
      : DateTime.parse(json['delivery_date'] as String),
  deliveryType: json['delivery_type'] as String?,
  deliverySlotId: json['delivery_slot_id'] as String?,
  paymentMethod: json['payment_method'] as String? ?? 'cod',
  paymentStatus: json['payment_status'] as String?,
  notes: json['notes'] as String?,
  createdAt: json['created_at'] == null
      ? null
      : DateTime.parse(json['created_at'] as String),
);

Map<String, dynamic> _$OrderModelToJson(_OrderModel instance) =>
    <String, dynamic>{
      'id': ?instance.id,
      '_id': ?instance.mongoId,
      'user_id': instance.userId,
      'user_name': ?instance.userName,
      'user_phone': ?instance.userPhone,
      'items': instance.items.map((e) => e.toJson()).toList(),
      'one_time_items': instance.oneTimeItems.map((e) => e.toJson()).toList(),
      'subtotal': instance.subtotal,
      'delivery_fee': instance.deliveryFee,
      'discount': instance.discount,
      'total': instance.total,
      'status': instance.status,
      'delivery_address': instance.deliveryAddress,
      'city': ?instance.city,
      'pincode': ?instance.pincode,
      'phone': instance.phone,
      'delivery_slot': ?instance.deliverySlot,
      'delivery_date': ?instance.deliveryDate?.toIso8601String(),
      'delivery_type': ?instance.deliveryType,
      'delivery_slot_id': ?instance.deliverySlotId,
      'payment_method': instance.paymentMethod,
      'payment_status': ?instance.paymentStatus,
      'notes': ?instance.notes,
      'created_at': ?instance.createdAt?.toIso8601String(),
    };

_OrderItemModel _$OrderItemModelFromJson(Map<String, dynamic> json) =>
    _OrderItemModel(
      productId: json['product_id'] as String? ?? '',
      productName: json['product_name'] as String? ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      quantity: (json['quantity'] as num?)?.toDouble() ?? 1.0,
      unit: json['unit'] as String? ?? 'kg',
      total: (json['total'] as num?)?.toDouble() ?? 0.0,
      product: json['product'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$OrderItemModelToJson(_OrderItemModel instance) =>
    <String, dynamic>{
      'product_id': instance.productId,
      'product_name': instance.productName,
      'price': instance.price,
      'quantity': instance.quantity,
      'unit': instance.unit,
      'total': instance.total,
      'product': ?instance.product,
    };
