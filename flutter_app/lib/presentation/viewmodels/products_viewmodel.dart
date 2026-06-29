import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:khurpi_fresh/data/models/product_model.dart';
import 'package:khurpi_fresh/data/models/category_model.dart';
import 'package:khurpi_fresh/data/datasources/remote/product_remote_datasource.dart';

part 'products_viewmodel.freezed.dart';

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

class ProductsViewModel extends StateNotifier<ProductsState> {
  final ProductRemoteDataSource _productRemoteDataSource;

  ProductsViewModel({
    required ProductRemoteDataSource productRemoteDataSource,
  })  : _productRemoteDataSource = productRemoteDataSource,
        super(const ProductsState());

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

    if (categoryId == null) {
      state = state.copyWith(filteredProducts: state.products);
    } else {
      final filtered = state.products
          .where((p) => p.categoryId == categoryId)
          .toList();
      state = state.copyWith(filteredProducts: filtered);
    }
  }

  void setSearchQuery(String query) {
    state = state.copyWith(searchQuery: query);

    if (query.isEmpty) {
      state = state.copyWith(filteredProducts: state.products);
    } else {
      final filtered = state.products
          .where((p) => p.name.toLowerCase().contains(query.toLowerCase()))
          .toList();
      state = state.copyWith(filteredProducts: filtered);
    }
  }

  void clearFilters() {
    state = state.copyWith(
      selectedCategoryId: null,
      searchQuery: null,
      filteredProducts: state.products,
    );
  }
}
