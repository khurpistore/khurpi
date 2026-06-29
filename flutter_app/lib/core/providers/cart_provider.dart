import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/app_constants.dart';
import '../models/product_model.dart';
import '../models/cart_item_model.dart';

class CartProvider with ChangeNotifier {
  List<CartItemModel> _items = [];
  bool _isLoading = false;

  List<CartItemModel> get items => _items;
  bool get isLoading => _isLoading;
  int get itemCount => _items.length;
  bool get isEmpty => _items.isEmpty;

  // Calculate totals
  double get subtotal {
    return _items.fold(0, (sum, item) => sum + item.totalPrice);
  }

  double get deliveryFee {
    if (subtotal >= 500) return 0; // Free delivery above ₹500
    return 40; // Standard delivery fee
  }

  double get total => subtotal + deliveryFee;

  String get formattedSubtotal => '₹${subtotal.toStringAsFixed(2)}';
  String get formattedDeliveryFee => deliveryFee == 0 ? 'FREE' : '₹${deliveryFee.toStringAsFixed(2)}';
  String get formattedTotal => '₹${total.toStringAsFixed(2)}';

  // Initialize cart from local storage
  Future<void> loadCart() async {
    _isLoading = true;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      final cartData = prefs.getString(AppConstants.cartKey);
      
      if (cartData != null) {
        final List<dynamic> decoded = jsonDecode(cartData);
        _items = decoded.map((item) => CartItemModel.fromJson(item)).toList();
      }
    } catch (e) {
      _items = [];
    }

    _isLoading = false;
    notifyListeners();
  }

  // Save cart to local storage
  Future<void> _saveCart() async {
    final prefs = await SharedPreferences.getInstance();
    final cartData = jsonEncode(_items.map((item) => item.toJson()).toList());
    await prefs.setString(AppConstants.cartKey, cartData);
  }

  // Add item to cart
  Future<void> addItem(ProductModel product, {double quantity = 1, String unit = 'kg'}) async {
    final existingIndex = _items.indexWhere((item) => item.product.id == product.id);
    
    if (existingIndex >= 0) {
      // Update existing item
      _items[existingIndex].quantity += quantity;
    } else {
      // Add new item
      _items.add(CartItemModel(
        product: product,
        quantity: quantity,
        unit: unit,
      ));
    }
    
    await _saveCart();
    notifyListeners();
  }

  // Remove item from cart
  Future<void> removeItem(String productId) async {
    _items.removeWhere((item) => item.product.id == productId);
    await _saveCart();
    notifyListeners();
  }

  // Update item quantity
  Future<void> updateQuantity(String productId, double quantity) async {
    final index = _items.indexWhere((item) => item.product.id == productId);
    
    if (index >= 0) {
      if (quantity <= 0) {
        _items.removeAt(index);
      } else {
        _items[index].quantity = quantity;
      }
      await _saveCart();
      notifyListeners();
    }
  }

  // Increment quantity
  Future<void> incrementQuantity(String productId) async {
    final index = _items.indexWhere((item) => item.product.id == productId);
    
    if (index >= 0) {
      final item = _items[index];
      if (item.unit == 'gm') {
        item.quantity += 100; // Increment by 100gm
      } else {
        item.quantity += 0.5; // Increment by 500g for kg
      }
      await _saveCart();
      notifyListeners();
    }
  }

  // Decrement quantity
  Future<void> decrementQuantity(String productId) async {
    final index = _items.indexWhere((item) => item.product.id == productId);
    
    if (index >= 0) {
      final item = _items[index];
      if (item.unit == 'gm') {
        if (item.quantity > 100) {
          item.quantity -= 100;
        } else {
          _items.removeAt(index);
        }
      } else {
        if (item.quantity > 0.5) {
          item.quantity -= 0.5;
        } else {
          _items.removeAt(index);
        }
      }
      await _saveCart();
      notifyListeners();
    }
  }

  // Check if product is in cart
  bool isInCart(String productId) {
    return _items.any((item) => item.product.id == productId);
  }

  // Get item by product id
  CartItemModel? getItem(String productId) {
    try {
      return _items.firstWhere((item) => item.product.id == productId);
    } catch (e) {
      return null;
    }
  }

  // Clear cart
  Future<void> clearCart() async {
    _items = [];
    await _saveCart();
    notifyListeners();
  }

  // Get cart items for order creation
  List<Map<String, dynamic>> getOrderItems() {
    return _items.map((item) => {
      'product_id': item.product.id,
      'product_name': item.product.name,
      'price': item.product.price,
      'quantity': item.quantity,
      'unit': item.unit,
      'total': item.totalPrice,
    }).toList();
  }
}
