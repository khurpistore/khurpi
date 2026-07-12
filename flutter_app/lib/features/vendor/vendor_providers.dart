import 'package:flutter_riverpod/legacy.dart';
import 'package:khurpi_fresh/data/models/product_model.dart';
import 'package:khurpi_fresh/data/datasources/remote/vendor_remote_datasource.dart';

class VendorProductsState {
  final bool isLoading;
  final List<ProductModel> products;
  final String? errorMessage;

  const VendorProductsState({
    this.isLoading = false,
    this.products = const [],
    this.errorMessage,
  });

  VendorProductsState copyWith({
    bool? isLoading,
    List<ProductModel>? products,
    String? errorMessage,
  }) {
    return VendorProductsState(
      isLoading: isLoading ?? this.isLoading,
      products: products ?? this.products,
      errorMessage: errorMessage,
    );
  }
}

class VendorProductsViewModel extends StateNotifier<VendorProductsState> {
  final VendorRemoteDataSource _vendorRemoteDataSource;

  VendorProductsViewModel(this._vendorRemoteDataSource)
      : super(const VendorProductsState());

  Future<void> loadProducts() async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final products = await _vendorRemoteDataSource.getProducts();
      state = state.copyWith(isLoading: false, products: products);
    } catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: e.toString());
    }
  }

  Future<bool> updateProduct(
    String id, {
    double? price,
    double? mrp,
    int? stockQuantity,
  }) async {
    try {
      final updated = await _vendorRemoteDataSource.updateProduct(
        id,
        price: price,
        mrp: mrp,
        stockQuantity: stockQuantity,
      );
      state = state.copyWith(
        products: [
          for (final p in state.products)
            if (p.productId == id) updated else p,
        ],
      );
      return true;
    } catch (e) {
      state = state.copyWith(errorMessage: e.toString());
      return false;
    }
  }
}

final vendorProductsViewModelProvider =
    StateNotifierProvider<VendorProductsViewModel, VendorProductsState>(
  (ref) => VendorProductsViewModel(VendorRemoteDataSourceImpl()),
);
