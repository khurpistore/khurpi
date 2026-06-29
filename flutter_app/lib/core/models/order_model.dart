import 'cart_item_model.dart';

class OrderModel {
  final String id;
  final String userId;
  final String? userName;
  final String? userPhone;
  final List<OrderItemModel> items;
  final double subtotal;
  final double deliveryFee;
  final double total;
  final String status;
  final String? deliveryAddress;
  final String? deliverySlot;
  final DateTime? deliveryDate;
  final String? paymentMethod;
  final String? paymentStatus;
  final String? notes;
  final DateTime createdAt;

  OrderModel({
    required this.id,
    required this.userId,
    this.userName,
    this.userPhone,
    required this.items,
    required this.subtotal,
    required this.deliveryFee,
    required this.total,
    required this.status,
    this.deliveryAddress,
    this.deliverySlot,
    this.deliveryDate,
    this.paymentMethod,
    this.paymentStatus,
    this.notes,
    required this.createdAt,
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

  String get statusDisplay {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'processing':
        return 'Processing';
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  }

  bool get canCancel => status == 'pending' || status == 'confirmed';
}

class OrderItemModel {
  final String productId;
  final String productName;
  final double price;
  final double quantity;
  final String unit;
  final double total;

  OrderItemModel({
    required this.productId,
    required this.productName,
    required this.price,
    required this.quantity,
    required this.unit,
    required this.total,
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

  String get displayQuantity {
    if (unit == 'gm') {
      return '${quantity.toInt()} gm';
    }
    return '${quantity} kg';
  }
}
