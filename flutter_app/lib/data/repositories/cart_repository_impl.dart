import 'package:dartz/dartz.dart';
import 'package:khurpi_fresh/core/error/exceptions.dart';
import 'package:khurpi_fresh/core/error/failures.dart';
import 'package:khurpi_fresh/domain/entities/cart_item_entity.dart';
import 'package:khurpi_fresh/domain/entities/product_entity.dart';
import 'package:khurpi_fresh/domain/repositories/cart_repository.dart';
import 'package:khurpi_fresh/data/datasources/local/cart_local_datasource.dart';

class CartRepositoryImpl implements CartRepository {
  final CartLocalDataSource localDataSource;
  List<CartItemEntity> _cachedItems = [];

  CartRepositoryImpl(this.localDataSource);

  @override
  Future<Either<Failure, List<CartItemEntity>>> getCartItems() async {
    try {
      _cachedItems = await localDataSource.getCartItems();
      return Right(_cachedItems);
    } on CacheException catch (e) {
      return Left(CacheFailure(message: e.message));
    }
  }

  @override
  Future<Either<Failure, void>> addItem(ProductEntity product, double quantity, String unit) async {
    try {
      final existingIndex = _cachedItems.indexWhere((item) => item.product.id == product.id);

      if (existingIndex >= 0) {
        _cachedItems[existingIndex] = _cachedItems[existingIndex].copyWith(
          quantity: _cachedItems[existingIndex].quantity + quantity,
        );
      } else {
        _cachedItems.add(CartItemEntity(
          product: product,
          quantity: quantity,
          unit: unit,
        ));
      }

      await localDataSource.saveCartItems(_cachedItems);
      return const Right(null);
    } on CacheException catch (e) {
      return Left(CacheFailure(message: e.message));
    }
  }

  @override
  Future<Either<Failure, void>> updateQuantity(String productId, double quantity) async {
    try {
      final index = _cachedItems.indexWhere((item) => item.product.id == productId);

      if (index >= 0) {
        if (quantity <= 0) {
          _cachedItems.removeAt(index);
        } else {
          _cachedItems[index] = _cachedItems[index].copyWith(quantity: quantity);
        }
        await localDataSource.saveCartItems(_cachedItems);
      }

      return const Right(null);
    } on CacheException catch (e) {
      return Left(CacheFailure(message: e.message));
    }
  }

  @override
  Future<Either<Failure, void>> removeItem(String productId) async {
    try {
      _cachedItems.removeWhere((item) => item.product.id == productId);
      await localDataSource.saveCartItems(_cachedItems);
      return const Right(null);
    } on CacheException catch (e) {
      return Left(CacheFailure(message: e.message));
    }
  }

  @override
  Future<Either<Failure, void>> clearCart() async {
    try {
      _cachedItems = [];
      await localDataSource.clearCart();
      return const Right(null);
    } on CacheException catch (e) {
      return Left(CacheFailure(message: e.message));
    }
  }

  @override
  bool isInCart(String productId) {
    return _cachedItems.any((item) => item.product.id == productId);
  }

  @override
  CartItemEntity? getCartItem(String productId) {
    try {
      return _cachedItems.firstWhere((item) => item.product.id == productId);
    } catch (e) {
      return null;
    }
  }
}
