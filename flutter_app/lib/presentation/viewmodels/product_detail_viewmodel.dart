import 'package:flutter_riverpod/legacy.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:khurpi_fresh/data/models/product_model.dart';
import 'package:khurpi_fresh/data/datasources/remote/product_remote_datasource.dart';

part 'product_detail_viewmodel.freezed.dart';

@freezed
sealed class ProductDetailState with _$ProductDetailState {
  const factory ProductDetailState({
    @Default(false) bool isLoading,
    ProductModel? product,
    @Default([]) List<ProductModel> relatedProducts,
    @Default(1.0) double quantity,
    @Default('kg') String selectedUnit,
    String? errorMessage,
  }) = _ProductDetailState;
}

extension ProductDetailStateX on ProductDetailState {
  String get formattedTotal {
    if (product == null) return '₹0';
    return '₹${(product!.price * quantity).toStringAsFixed(0)}';
  }
}

class ProductDetailViewModel extends StateNotifier<ProductDetailState> {
  final ProductRemoteDataSource _productRemoteDataSource;

  ProductDetailViewModel({
    required ProductRemoteDataSource productRemoteDataSource,
  })  : _productRemoteDataSource = productRemoteDataSource,
        super(const ProductDetailState());

  Future<void> loadProduct(String productId) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final product = await _productRemoteDataSource.getProductById(productId);
      state = state.copyWith(
        isLoading: false,
        product: product,
      );

      if (product.categoryId != null) {
        _loadRelatedProducts(product.categoryId!, product.productId);
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.toString(),
      );
    }
  }

  Future<void> _loadRelatedProducts(String categoryId, String excludeProductId) async {
    try {
      final products = await _productRemoteDataSource.getProductsByCategory(categoryId);
      final related = products.where((p) => p.productId != excludeProductId).take(4).toList();
      state = state.copyWith(relatedProducts: related);
    } catch (e) {
      // Silently fail for related products
    }
  }

  void setQuantity(double quantity) {
    if (quantity > 0) {
      state = state.copyWith(quantity: quantity);
    }
  }

  void incrementQuantity() {
    state = state.copyWith(quantity: state.quantity + 0.5);
  }

  void decrementQuantity() {
    if (state.quantity > 0.5) {
      state = state.copyWith(quantity: state.quantity - 0.5);
    }
  }

  void setUnit(String unit) {
    state = state.copyWith(selectedUnit: unit);
  }

  void clearError() {
    state = state.copyWith(errorMessage: null);
  }

  void reset() {
    state = const ProductDetailState();
  }
}
