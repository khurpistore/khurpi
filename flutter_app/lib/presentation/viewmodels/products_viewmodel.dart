import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:khurpi_fresh/domain/entities/product_entity.dart';
import 'package:khurpi_fresh/domain/entities/category_entity.dart';
import 'package:khurpi_fresh/domain/usecases/product_usecases.dart';
import 'package:khurpi_fresh/presentation/providers/providers.dart';

// ==================== State Classes ====================

class ProductsState {
  final List<ProductEntity> products;
  final List<ProductEntity> filteredProducts;
  final List<CategoryEntity> categories;
  final bool isLoading;
  final bool isCategoriesLoading;
  final String? error;
  final String searchQuery;
  final String? selectedCategoryId;

  const ProductsState({
    this.products = const [],
    this.filteredProducts = const [],
    this.categories = const [],
    this.isLoading = false,
    this.isCategoriesLoading = false,
    this.error,
    this.searchQuery = '',
    this.selectedCategoryId,
  });

  ProductsState copyWith({
    List<ProductEntity>? products,
    List<ProductEntity>? filteredProducts,
    List<CategoryEntity>? categories,
    bool? isLoading,
    bool? isCategoriesLoading,
    String? error,
    String? searchQuery,
    String? selectedCategoryId,
    bool clearError = false,
    bool clearCategory = false,
  }) {
    return ProductsState(
      products: products ?? this.products,
      filteredProducts: filteredProducts ?? this.filteredProducts,
      categories: categories ?? this.categories,
      isLoading: isLoading ?? this.isLoading,
      isCategoriesLoading: isCategoriesLoading ?? this.isCategoriesLoading,
      error: clearError ? null : (error ?? this.error),
      searchQuery: searchQuery ?? this.searchQuery,
      selectedCategoryId: clearCategory ? null : (selectedCategoryId ?? this.selectedCategoryId),
    );
  }

  List<ProductEntity> get displayProducts {
    if (filteredProducts.isNotEmpty || searchQuery.isNotEmpty || selectedCategoryId != null) {
      return filteredProducts;
    }
    return products;
  }
}

// ==================== ViewModel ====================

class ProductsViewModel extends StateNotifier<ProductsState> {
  final GetProductsUseCase _getProductsUseCase;
  final GetCategoriesUseCase _getCategoriesUseCase;

  ProductsViewModel({
    required GetProductsUseCase getProductsUseCase,
    required GetCategoriesUseCase getCategoriesUseCase,
  })  : _getProductsUseCase = getProductsUseCase,
        _getCategoriesUseCase = getCategoriesUseCase,
        super(const ProductsState());

  Future<void> fetchProducts() async {
    state = state.copyWith(isLoading: true, clearError: true);

    final result = await _getProductsUseCase(GetProductsParams());

    result.fold(
      (failure) => state = state.copyWith(
        isLoading: false,
        error: failure.message,
      ),
      (products) {
        final sortedProducts = _sortByStockStatus(products);
        state = state.copyWith(
          isLoading: false,
          products: sortedProducts,
        );
        _applyFilters();
      },
    );
  }

  Future<void> fetchCategories() async {
    state = state.copyWith(isCategoriesLoading: true);

    final result = await _getCategoriesUseCase();

    result.fold(
      (failure) => state = state.copyWith(isCategoriesLoading: false),
      (categories) {
        final sorted = List<CategoryEntity>.from(categories)
          ..sort((a, b) => a.displayOrder.compareTo(b.displayOrder));
        state = state.copyWith(
          isCategoriesLoading: false,
          categories: sorted,
        );
      },
    );
  }

  void setSearchQuery(String query) {
    state = state.copyWith(searchQuery: query.toLowerCase());
    _applyFilters();
  }

  void setSelectedCategory(String? categoryId) {
    if (categoryId == null) {
      state = state.copyWith(clearCategory: true);
    } else {
      state = state.copyWith(selectedCategoryId: categoryId);
    }
    _applyFilters();
  }

  void clearFilters() {
    state = state.copyWith(
      searchQuery: '',
      clearCategory: true,
      filteredProducts: [],
    );
  }

  void _applyFilters() {
    if (state.searchQuery.isEmpty && state.selectedCategoryId == null) {
      state = state.copyWith(filteredProducts: []);
      return;
    }

    final filtered = state.products.where((product) {
      bool matchesSearch = state.searchQuery.isEmpty ||
          product.name.toLowerCase().contains(state.searchQuery) ||
          (product.description?.toLowerCase().contains(state.searchQuery) ?? false) ||
          (product.categoryName?.toLowerCase().contains(state.searchQuery) ?? false);

      bool matchesCategory = state.selectedCategoryId == null ||
          product.categoryId == state.selectedCategoryId;

      return matchesSearch && matchesCategory;
    }).toList();

    state = state.copyWith(filteredProducts: _sortByStockStatus(filtered));
  }

  List<ProductEntity> _sortByStockStatus(List<ProductEntity> products) {
    final list = List<ProductEntity>.from(products);
    list.sort((a, b) {
      final stockOrder = {'in_stock': 0, 'growing': 1, 'out_of_stock': 2};
      final aOrder = stockOrder[a.stockStatus] ?? 3;
      final bOrder = stockOrder[b.stockStatus] ?? 3;

      if (aOrder != bOrder) return aOrder.compareTo(bOrder);
      return a.name.compareTo(b.name);
    });
    return list;
  }

  Future<void> refresh() async {
    await Future.wait([
      fetchProducts(),
      fetchCategories(),
    ]);
  }
}

// ==================== Provider ====================

final productsViewModelProvider =
    StateNotifierProvider<ProductsViewModel, ProductsState>((ref) {
  return ProductsViewModel(
    getProductsUseCase: ref.watch(getProductsUseCaseProvider),
    getCategoriesUseCase: ref.watch(getCategoriesUseCaseProvider),
  );
});
