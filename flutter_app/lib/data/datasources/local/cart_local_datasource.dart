import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:khurpi_fresh/core/constants/app_constants.dart';
import 'package:khurpi_fresh/core/error/exceptions.dart';
import 'package:khurpi_fresh/domain/entities/cart_item_entity.dart';
import 'package:khurpi_fresh/data/models/product_model.dart';

abstract class CartLocalDataSource {
  Future<List<CartItemEntity>> getCartItems();
  Future<void> saveCartItems(List<CartItemEntity> items);
  Future<void> clearCart();
}

class CartLocalDataSourceImpl implements CartLocalDataSource {
  final SharedPreferences sharedPreferences;

  CartLocalDataSourceImpl(this.sharedPreferences);

  @override
  Future<List<CartItemEntity>> getCartItems() async {
    try {
      final cartData = sharedPreferences.getString(AppConstants.cartKey);
      if (cartData == null) return [];

      final List<dynamic> decoded = jsonDecode(cartData);
      return decoded.map((item) {
        final product = ProductModel.fromJson(item['product']);
        return CartItemEntity(
          product: product,
          quantity: (item['quantity'] ?? 1).toDouble(),
          unit: item['unit'] ?? 'kg',
        );
      }).toList();
    } catch (e) {
      throw CacheException(message: 'Failed to load cart: $e');
    }
  }

  @override
  Future<void> saveCartItems(List<CartItemEntity> items) async {
    try {
      final cartData = items.map((item) {
        final productModel = item.product is ProductModel
            ? (item.product as ProductModel)
            : ProductModel(
                id: item.product.id,
                name: item.product.name,
                description: item.product.description,
                price: item.product.price,
                wholesalePrice: item.product.wholesalePrice,
                imageUrl: item.product.imageUrl,
                categoryId: item.product.categoryId,
                categoryName: item.product.categoryName,
                stockStatus: item.product.stockStatus,
                stockQuantity: item.product.stockQuantity,
                unit: item.product.unit,
                weight: item.product.weight,
              );
        return {
          'product': productModel.toJson(),
          'quantity': item.quantity,
          'unit': item.unit,
        };
      }).toList();

      await sharedPreferences.setString(AppConstants.cartKey, jsonEncode(cartData));
    } catch (e) {
      throw CacheException(message: 'Failed to save cart: $e');
    }
  }

  @override
  Future<void> clearCart() async {
    await sharedPreferences.remove(AppConstants.cartKey);
  }
}
