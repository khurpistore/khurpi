import 'package:equatable/equatable.dart';

class OrderEntity extends Equatable {
  final String id;
  final String userId;
  final String? userName;
  final String? userPhone;
  final List<OrderItemEntity> items;
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

  const OrderEntity({
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

  @override
  List<Object?> get props => [id, userId, status, total, createdAt];
}

class OrderItemEntity extends Equatable {
  final String productId;
  final String productName;
  final double price;
  final double quantity;
  final String unit;
  final double total;

  const OrderItemEntity({
    required this.productId,
    required this.productName,
    required this.price,
    required this.quantity,
    required this.unit,
    required this.total,
  });

  String get displayQuantity {
    if (unit == 'gm') {
      return '${quantity.toInt()} gm';
    }
    return '$quantity kg';
  }

  @override
  List<Object?> get props => [productId, productName, price, quantity, unit, total];
}
