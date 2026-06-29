import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_constants.dart';
import '../../domain/entities/cart_item_entity.dart';
import '../../domain/entities/product_entity.dart';
import '../../domain/repositories/cart_repository.dart';
import '../providers/providers.dart';

// ==================== State Classes ====================

class CartState {
  final List<CartItemEntity> items;
  final bool isLoading;
  final String? error;

  const CartState({
    this.items = const [],
    this.isLoading = false,
    this.error,
  });

  CartState copyWith({
    List<CartItemEntity>? items,
    bool? isLoading,
    String? error,
    bool clearError = false,
  }) {
    return CartState(
      items: items ?? this.items,
      isLoading: isLoading ?? this.isLoading,
      error: clearError ? null : (error ?? this.error),
    );
  }

  int get itemCount => items.length;
  bool get isEmpty => items.isEmpty;

  double get subtotal {
    return items.fold(0, (sum, item) => sum + item.totalPrice);
  }

  double get deliveryFee {
    if (subtotal >= AppConstants.freeDeliveryThreshold) return 0;
    return AppConstants.standardDeliveryFee;
  }

  double get total => subtotal + deliveryFee;

  String get formattedSubtotal => '₹${subtotal.toStringAsFixed(2)}';
  String get formattedDeliveryFee => deliveryFee == 0 ? 'FREE' : '₹${deliveryFee.toStringAsFixed(2)}';
  String get formattedTotal => '₹${total.toStringAsFixed(2)}';
}

// ==================== ViewModel ====================

class CartViewModel extends StateNotifier<CartState> {
  final CartRepository _cartRepository;

  CartViewModel({required CartRepository cartRepository})
      : _cartRepository = cartRepository,
        super(const CartState());

  Future<void> loadCart() async {
    state = state.copyWith(isLoading: true, clearError: true);

    final result = await _cartRepository.getCartItems();

    result.fold(
      (failure) => state = state.copyWith(
        isLoading: false,
        error: failure.message,
      ),
      (items) => state = state.copyWith(
        isLoading: false,
        items: items,
      ),
    );
  }

  Future<void> addItem(ProductEntity product, {double quantity = 0.5, String unit = 'kg'}) async {
    final result = await _cartRepository.addItem(product, quantity, unit);

    result.fold(
      (failure) => state = state.copyWith(error: failure.message),
      (_) => loadCart(),
    );
  }

  Future<void> updateQuantity(String productId, double quantity) async {
    final result = await _cartRepository.updateQuantity(productId, quantity);

    result.fold(
      (failure) => state = state.copyWith(error: failure.message),
      (_) => loadCart(),
    );
  }

  Future<void> incrementQuantity(String productId) async {
    final item = state.items.firstWhere(
      (item) => item.product.id == productId,
      orElse: () => throw Exception('Item not found'),
    );

    double newQuantity;
    if (item.unit == 'gm') {
      newQuantity = item.quantity + 100;
    } else {
      newQuantity = item.quantity + 0.5;
    }

    await updateQuantity(productId, newQuantity);
  }

  Future<void> decrementQuantity(String productId) async {
    final item = state.items.firstWhere(
      (item) => item.product.id == productId,
      orElse: () => throw Exception('Item not found'),
    );

    double newQuantity;
    if (item.unit == 'gm') {
      newQuantity = item.quantity > 100 ? item.quantity - 100 : 0;
    } else {
      newQuantity = item.quantity > 0.5 ? item.quantity - 0.5 : 0;
    }

    await updateQuantity(productId, newQuantity);
  }

  Future<void> removeItem(String productId) async {
    final result = await _cartRepository.removeItem(productId);

    result.fold(
      (failure) => state = state.copyWith(error: failure.message),
      (_) => loadCart(),
    );
  }

  Future<void> clearCart() async {
    final result = await _cartRepository.clearCart();

    result.fold(
      (failure) => state = state.copyWith(error: failure.message),
      (_) => state = state.copyWith(items: []),
    );
  }

  bool isInCart(String productId) {
    return state.items.any((item) => item.product.id == productId);
  }

  CartItemEntity? getCartItem(String productId) {
    try {
      return state.items.firstWhere((item) => item.product.id == productId);
    } catch (e) {
      return null;
    }
  }

  List<Map<String, dynamic>> getOrderItems() {
    return state.items.map((item) => {
      'product_id': item.product.id,
      'product_name': item.product.name,
      'price': item.product.price,
      'quantity': item.quantity,
      'unit': item.unit,
      'total': item.totalPrice,
    }).toList();
  }
}

// ==================== Provider ====================

final cartViewModelProvider =
    StateNotifierProvider<CartViewModel, CartState>((ref) {
  return CartViewModel(
    cartRepository: ref.watch(cartRepositoryProvider),
  );
});
