import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:khurpi_fresh/data/models/cart_item_model.dart';
import 'package:khurpi_fresh/data/models/product_model.dart';
import 'package:khurpi_fresh/data/datasources/local/cart_local_datasource.dart';
import 'package:khurpi_fresh/presentation/providers/providers.dart';

part 'cart_viewmodel.freezed.dart';
part 'cart_viewmodel.g.dart';

@freezed
sealed class CartState with _$CartState {
  const factory CartState({
    @Default(false) bool isLoading,
    @Default([]) List<CartItemModel> items,
    @Default(0) double subtotal,
    @Default(40) double deliveryFee,
    String? errorMessage,
  }) = _CartState;
}

extension CartStateX on CartState {
  double get total => subtotal + deliveryFee;
  int get itemCount => items.length;
  bool get isEmpty => items.isEmpty;
  String get formattedSubtotal => '₹${subtotal.toStringAsFixed(0)}';
  String get formattedDeliveryFee => '₹${deliveryFee.toStringAsFixed(0)}';
  String get formattedTotal => '₹${total.toStringAsFixed(0)}';
}

@Riverpod(keepAlive: true)
class CartViewModel extends _$CartViewModel {
  late final CartLocalDataSource _cartLocalDataSource;

  @override
  CartState build() {
    final localDS = ref.watch(provideCartLocalDataSourceProvider);
    
    if (localDS != null) {
      _cartLocalDataSource = localDS;
    }
    
    return const CartState();
  }

  Future<void> loadCart() async {
    state = state.copyWith(isLoading: true);

    try {
      final items = await _cartLocalDataSource.getCartItems();
      final subtotal = _calculateSubtotal(items);

      state = state.copyWith(
        isLoading: false,
        items: items,
        subtotal: subtotal,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.toString(),
      );
    }
  }

  Future<void> addToCart(ProductModel product, {double quantity = 1, String unit = 'kg'}) async {
    try {
      final existingIndex = state.items.indexWhere((item) => item.productId == product.productId);

      List<CartItemModel> updatedItems;

      if (existingIndex >= 0) {
        final existingItem = state.items[existingIndex];
        final updatedItem = existingItem.copyWith(
          quantity: existingItem.quantity + quantity,
        );
        updatedItems = [...state.items];
        updatedItems[existingIndex] = updatedItem;
      } else {
        final newItem = CartItemModel(
          productId: product.productId,
          productName: product.name,
          price: product.price,
          wholesalePrice: product.wholesalePrice,
          imageUrl: product.imageUrl,
          quantity: quantity,
          unit: unit,
        );
        updatedItems = [...state.items, newItem];
      }

      await _cartLocalDataSource.saveCartItems(updatedItems);

      state = state.copyWith(
        items: updatedItems,
        subtotal: _calculateSubtotal(updatedItems),
      );
    } catch (e) {
      state = state.copyWith(errorMessage: e.toString());
    }
  }

  Future<void> updateQuantity(String productId, double quantity) async {
    try {
      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }

      final updatedItems = state.items.map((item) {
        if (item.productId == productId) {
          return item.copyWith(quantity: quantity);
        }
        return item;
      }).toList();

      await _cartLocalDataSource.saveCartItems(updatedItems);

      state = state.copyWith(
        items: updatedItems,
        subtotal: _calculateSubtotal(updatedItems),
      );
    } catch (e) {
      state = state.copyWith(errorMessage: e.toString());
    }
  }

  Future<void> incrementQuantity(String productId) async {
    final item = state.items.firstWhere((i) => i.productId == productId);
    await updateQuantity(productId, item.quantity + 0.5);
  }

  Future<void> decrementQuantity(String productId) async {
    final item = state.items.firstWhere((i) => i.productId == productId);
    await updateQuantity(productId, item.quantity - 0.5);
  }

  Future<void> removeFromCart(String productId) async {
    try {
      final updatedItems = state.items.where((item) => item.productId != productId).toList();

      await _cartLocalDataSource.saveCartItems(updatedItems);

      state = state.copyWith(
        items: updatedItems,
        subtotal: _calculateSubtotal(updatedItems),
      );
    } catch (e) {
      state = state.copyWith(errorMessage: e.toString());
    }
  }

  Future<void> clearCart() async {
    try {
      await _cartLocalDataSource.clearCart();
      
      // Reset spin eligibility when cart is cleared (order completed)
      final prefs = ref.read(sharedPreferencesProvider);
      await prefs.remove('last_spin_order_id');
      
      state = const CartState();
    } catch (e) {
      state = state.copyWith(errorMessage: e.toString());
    }
  }

  Future<void> addFreeItem({
    required String productId,
    required String productName,
    required double quantity,
    required String unit,
  }) async {
    try {
      // Check if free item already exists
      final existingIndex = state.items.indexWhere((item) => item.productId == productId);
      
      if (existingIndex >= 0) {
        // Already have this free item, don't add again
        return;
      }

      final newItem = CartItemModel(
        productId: productId,
        productName: productName,
        price: 0, // FREE!
        quantity: quantity,
        unit: unit,
      );

      final updatedItems = [...state.items, newItem];
      await _cartLocalDataSource.saveCartItems(updatedItems);

      state = state.copyWith(
        items: updatedItems,
        // Subtotal doesn't change since price is 0
      );
    } catch (e) {
      state = state.copyWith(errorMessage: e.toString());
    }
  }

  double _calculateSubtotal(List<CartItemModel> items) {
    return items.fold(0, (sum, item) => sum + (item.price * item.quantity));
  }

  void clearError() {
    state = state.copyWith(errorMessage: null);
  }
}
