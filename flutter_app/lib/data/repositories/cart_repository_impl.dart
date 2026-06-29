import 'package:dartz/dartz.dart';
import 'package:khurpi_fresh/core/error/failures.dart';
import 'package:khurpi_fresh/data/models/cart_item_model.dart';
import 'package:khurpi_fresh/domain/repositories/cart_repository.dart';
import 'package:khurpi_fresh/data/datasources/local/cart_local_datasource.dart';

class CartRepositoryImpl implements CartRepository {
  final CartLocalDataSource localDataSource;

  CartRepositoryImpl({required this.localDataSource});

  @override
  Future<Either<Failure, List<CartItemModel>>> getCartItems() async {
    try {
      final items = await localDataSource.getCartItems();
      return Right(items);
    } catch (e) {
      return Left(CacheFailure(message: 'Failed to get cart items: $e'));
    }
  }

  @override
  Future<Either<Failure, void>> addToCart(CartItemModel item) async {
    try {
      final items = await localDataSource.getCartItems();
      final existingIndex = items.indexWhere((i) => i.productId == item.productId);
      
      if (existingIndex >= 0) {
        items[existingIndex] = item.copyWith(
          quantity: items[existingIndex].quantity + item.quantity,
        );
      } else {
        items.add(item);
      }
      
      await localDataSource.saveCartItems(items);
      return const Right(null);
    } catch (e) {
      return Left(CacheFailure(message: 'Failed to add to cart: $e'));
    }
  }

  @override
  Future<Either<Failure, void>> updateCartItem(CartItemModel item) async {
    try {
      final items = await localDataSource.getCartItems();
      final index = items.indexWhere((i) => i.productId == item.productId);
      
      if (index >= 0) {
        items[index] = item;
        await localDataSource.saveCartItems(items);
      }
      
      return const Right(null);
    } catch (e) {
      return Left(CacheFailure(message: 'Failed to update cart: $e'));
    }
  }

  @override
  Future<Either<Failure, void>> removeFromCart(String productId) async {
    try {
      final items = await localDataSource.getCartItems();
      items.removeWhere((i) => i.productId == productId);
      await localDataSource.saveCartItems(items);
      return const Right(null);
    } catch (e) {
      return Left(CacheFailure(message: 'Failed to remove from cart: $e'));
    }
  }

  @override
  Future<Either<Failure, void>> clearCart() async {
    try {
      await localDataSource.clearCart();
      return const Right(null);
    } catch (e) {
      return Left(CacheFailure(message: 'Failed to clear cart: $e'));
    }
  }
}
