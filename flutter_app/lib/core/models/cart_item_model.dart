import 'product_model.dart';

class CartItemModel {
  final ProductModel product;
  double quantity;
  final String unit;

  CartItemModel({
    required this.product,
    required this.quantity,
    required this.unit,
  });

  factory CartItemModel.fromJson(Map<String, dynamic> json) {
    return CartItemModel(
      product: ProductModel.fromJson(json['product']),
      quantity: (json['quantity'] ?? 1).toDouble(),
      unit: json['unit'] ?? 'kg',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'product': product.toJson(),
      'quantity': quantity,
      'unit': unit,
    };
  }

  // Calculate item total
  double get totalPrice {
    if (unit == 'gm') {
      // Convert grams to kg for price calculation
      return product.price * (quantity / 1000);
    }
    return product.price * quantity;
  }

  String get formattedTotal => '₹${totalPrice.toStringAsFixed(2)}';
  
  String get displayQuantity {
    if (unit == 'gm') {
      return '${quantity.toInt()} gm';
    }
    return '${quantity} kg';
  }
}
