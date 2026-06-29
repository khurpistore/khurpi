import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:khurpi_fresh/core/constants/app_constants.dart';
import 'package:khurpi_fresh/data/models/cart_item_model.dart';

abstract class CartLocalDataSource {
  Future<List<CartItemModel>> getCartItems();
  Future<void> saveCartItems(List<CartItemModel> items);
  Future<void> clearCart();
}

class CartLocalDataSourceImpl implements CartLocalDataSource {
  final SharedPreferences sharedPreferences;

  CartLocalDataSourceImpl(this.sharedPreferences);

  @override
  Future<List<CartItemModel>> getCartItems() async {
    final cartData = sharedPreferences.getString(AppConstants.cartKey);
    if (cartData == null) return [];
    
    final List<dynamic> jsonList = jsonDecode(cartData);
    return jsonList.map((json) => CartItemModel.fromJson(json)).toList();
  }

  @override
  Future<void> saveCartItems(List<CartItemModel> items) async {
    final jsonList = items.map((item) => item.toJson()).toList();
    await sharedPreferences.setString(AppConstants.cartKey, jsonEncode(jsonList));
  }

  @override
  Future<void> clearCart() async {
    await sharedPreferences.remove(AppConstants.cartKey);
  }
}
