import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/product_entity.dart';
import '../../domain/usecases/product_usecases.dart';
import '../providers/providers.dart';

// ==================== State Classes ====================

class ProductDetailState {
  final ProductEntity? product;
  final bool isLoading;
  final String? error;
  final double quantity;
  final String unit;

  const ProductDetailState({
    this.product,
    this.isLoading = false,
    this.error,
    this.quantity = 0.5,
    this.unit = 'kg',
  });

  ProductDetailState copyWith({
    ProductEntity? product,
    bool? isLoading,
    String? error,
    double? quantity,
    String? unit,
    bool clearError = false,
  }) {
    return ProductDetailState(
      product: product ?? this.product,
      isLoading: isLoading ?? this.isLoading,
      error: clearError ? null : (error ?? this.error),
      quantity: quantity ?? this.quantity,
      unit: unit ?? this.unit,
    );
  }

  double get totalPrice {
    if (product == null) return 0;
    if (unit == 'gm') {
      return product!.price * (quantity / 1000);
    }
    return product!.price * quantity;
  }

  String get formattedTotal => '₹${totalPrice.toStringAsFixed(2)}';
}

// ==================== ViewModel ====================

class ProductDetailViewModel extends StateNotifier<ProductDetailState> {
  final GetProductByIdUseCase _getProductByIdUseCase;

  ProductDetailViewModel({
    required GetProductByIdUseCase getProductByIdUseCase,
  })  : _getProductByIdUseCase = getProductByIdUseCase,
        super(const ProductDetailState());

  Future<void> fetchProduct(String id) async {
    state = state.copyWith(isLoading: true, clearError: true);

    final result = await _getProductByIdUseCase(id);

    result.fold(
      (failure) => state = state.copyWith(
        isLoading: false,
        error: failure.message,
      ),
      (product) => state = state.copyWith(
        isLoading: false,
        product: product,
      ),
    );
  }

  void setUnit(String unit) {
    double newQuantity = unit == 'kg' ? 0.5 : 250;
    state = state.copyWith(unit: unit, quantity: newQuantity);
  }

  void incrementQuantity() {
    if (state.unit == 'gm') {
      state = state.copyWith(quantity: state.quantity + 100);
    } else {
      state = state.copyWith(quantity: state.quantity + 0.5);
    }
  }

  void decrementQuantity() {
    if (state.unit == 'gm') {
      if (state.quantity > 100) {
        state = state.copyWith(quantity: state.quantity - 100);
      }
    } else {
      if (state.quantity > 0.5) {
        state = state.copyWith(quantity: state.quantity - 0.5);
      }
    }
  }

  void setQuantity(double quantity) {
    state = state.copyWith(quantity: quantity);
  }

  void reset() {
    state = const ProductDetailState();
  }
}

// ==================== Provider ====================

final productDetailViewModelProvider =
    StateNotifierProvider.autoDispose<ProductDetailViewModel, ProductDetailState>((ref) {
  return ProductDetailViewModel(
    getProductByIdUseCase: ref.watch(getProductByIdUseCaseProvider),
  );
});
