import 'package:dartz/dartz.dart';
import '../../core/error/failures.dart';
import '../entities/cart_item_entity.dart';
import '../entities/product_entity.dart';

abstract class CartRepository {
  /// Get all cart items
  Future<Either<Failure, List<CartItemEntity>>> getCartItems();

  /// Add item to cart
  Future<Either<Failure, void>> addItem(ProductEntity product, double quantity, String unit);

  /// Update item quantity
  Future<Either<Failure, void>> updateQuantity(String productId, double quantity);

  /// Remove item from cart
  Future<Either<Failure, void>> removeItem(String productId);

  /// Clear entire cart
  Future<Either<Failure, void>> clearCart();

  /// Check if product is in cart
  bool isInCart(String productId);

  /// Get cart item by product ID
  CartItemEntity? getCartItem(String productId);
}
