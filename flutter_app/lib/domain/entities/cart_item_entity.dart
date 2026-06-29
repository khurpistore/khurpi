import 'package:equatable/equatable.dart';
import 'package:khurpi_fresh/domain/entities/product_entity.dart';

class CartItemEntity extends Equatable {
  final ProductEntity product;
  final double quantity;
  final String unit;

  const CartItemEntity({
    required this.product,
    required this.quantity,
    required this.unit,
  });

  double get totalPrice {
    if (unit == 'gm') {
      return product.price * (quantity / 1000);
    }
    return product.price * quantity;
  }

  String get formattedTotal => '₹${totalPrice.toStringAsFixed(2)}';

  String get displayQuantity {
    if (unit == 'gm') {
      return '${quantity.toInt()} gm';
    }
    return '$quantity kg';
  }

  CartItemEntity copyWith({
    ProductEntity? product,
    double? quantity,
    String? unit,
  }) {
    return CartItemEntity(
      product: product ?? this.product,
      quantity: quantity ?? this.quantity,
      unit: unit ?? this.unit,
    );
  }

  @override
  List<Object?> get props => [product.id, quantity, unit];
}
