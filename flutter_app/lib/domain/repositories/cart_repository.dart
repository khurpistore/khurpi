import 'package:dartz/dartz.dart';
import 'package:khurpi_fresh/core/error/failures.dart';
import 'package:khurpi_fresh/data/models/cart_item_model.dart';

abstract class CartRepository {
  Future<Either<Failure, List<CartItemModel>>> getCartItems();
  Future<Either<Failure, void>> addToCart(CartItemModel item);
  Future<Either<Failure, void>> updateCartItem(CartItemModel item);
  Future<Either<Failure, void>> removeFromCart(String productId);
  Future<Either<Failure, void>> clearCart();
}
