import '../../domain/entities/order_entity.dart';

class OrderModel extends OrderEntity {
  const OrderModel({
    required super.id,
    required super.userId,
    super.userName,
    super.userPhone,
    required super.items,
    required super.subtotal,
    required super.deliveryFee,
    required super.total,
    required super.status,
    super.deliveryAddress,
    super.deliverySlot,
    super.deliveryDate,
    super.paymentMethod,
    super.paymentStatus,
    super.notes,
    required super.createdAt,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    return OrderModel(
      id: json['id'] ?? json['_id'] ?? '',
      userId: json['user_id'] ?? '',
      userName: json['user_name'],
      userPhone: json['user_phone'],
      items: (json['items'] as List<dynamic>?)
              ?.map((item) => OrderItemModel.fromJson(item))
              .toList() ??
          [],
      subtotal: (json['subtotal'] ?? 0).toDouble(),
      deliveryFee: (json['delivery_fee'] ?? 0).toDouble(),
      total: (json['total'] ?? 0).toDouble(),
      status: json['status'] ?? 'pending',
      deliveryAddress: json['delivery_address'],
      deliverySlot: json['delivery_slot'],
      deliveryDate: json['delivery_date'] != null
          ? DateTime.tryParse(json['delivery_date'])
          : null,
      paymentMethod: json['payment_method'],
      paymentStatus: json['payment_status'],
      notes: json['notes'],
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
    );
  }

  OrderEntity toEntity() => this;
}

class OrderItemModel extends OrderItemEntity {
  const OrderItemModel({
    required super.productId,
    required super.productName,
    required super.price,
    required super.quantity,
    required super.unit,
    required super.total,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    return OrderItemModel(
      productId: json['product_id'] ?? '',
      productName: json['product_name'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      quantity: (json['quantity'] ?? 0).toDouble(),
      unit: json['unit'] ?? 'kg',
      total: (json['total'] ?? 0).toDouble(),
    );
  }

  OrderItemEntity toEntity() => this;
}
