import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:khurpi_fresh/data/models/product_model.dart';
import 'package:khurpi_fresh/data/models/category_model.dart';
import 'package:khurpi_fresh/data/datasources/remote/product_remote_datasource.dart';

part '../../generated/features/products/products_viewmodel.freezed.dart';
part '../../generated/features/products/products_viewmodel.g.dart';

@freezed
sealed class ProductsState with _$ProductsState {
  const factory ProductsState({
    @Default(false) bool isLoading,
    @Default([]) List<ProductModel> products,
    @Default([]) List<ProductModel> filteredProducts,
    @Default([]) List<CategoryModel> categories,
    String? selectedCategoryId,
    String? searchQuery,
    String? errorMessage,
  }) = _ProductsState;
}

@riverpod
class ProductsViewModel extends _$ProductsViewModel {
  late final ProductRemoteDataSource _productRemoteDataSource;

  @override
  ProductsState build({
    required ProductRemoteDataSource productRemoteDataSource,
  }) {
    _productRemoteDataSource = productRemoteDataSource;
    return const ProductsState();
  }

  Future<void> loadProducts() async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final products = await _productRemoteDataSource.getProducts();
      state = state.copyWith(
        isLoading: false,
        products: products,
        filteredProducts: products,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.toString(),
      );
    }
  }

  Future<void> loadCategories() async {
    try {
      final categories = await _productRemoteDataSource.getCategories();
      state = state.copyWith(categories: categories);
    } catch (e) {
      state = state.copyWith(errorMessage: e.toString());
    }
  }

  Future<void> loadProductsByCategory(String categoryId) async {
    state = state.copyWith(isLoading: true, selectedCategoryId: categoryId);

    try {
      final products = await _productRemoteDataSource.getProductsByCategory(categoryId);
      state = state.copyWith(
        isLoading: false,
        filteredProducts: products,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.toString(),
      );
    }
  }

  void setSelectedCategory(String? categoryId) {
    state = state.copyWith(selectedCategoryId: categoryId);
    _applyFilters();
  }

  void setSearchQuery(String query) {
    state = state.copyWith(searchQuery: query);
    _applyFilters();
  }

  void _applyFilters() {
    var filtered = state.products.toList();
    
    // Apply category filter
    if (state.selectedCategoryId != null) {
      filtered = filtered.where((p) => p.categoryId == state.selectedCategoryId).toList();
    }
    
    // Apply search filter
    if (state.searchQuery != null && state.searchQuery!.isNotEmpty) {
      filtered = filtered.where((p) => p.name.toLowerCase().contains(state.searchQuery!.toLowerCase())).toList();
    }
    
    state = state.copyWith(filteredProducts: filtered);
  }

  void clearFilters() {
    state = state.copyWith(
      selectedCategoryId: null,
      searchQuery: null,
      filteredProducts: state.products,
    );
  }
}
