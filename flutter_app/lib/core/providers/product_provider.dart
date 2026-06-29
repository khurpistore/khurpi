import 'package:flutter/foundation.dart';
import '../models/product_model.dart';
import '../models/category_model.dart';
import '../services/product_service.dart';

class ProductProvider with ChangeNotifier {
  final ProductService _productService = ProductService();

  List<ProductModel> _products = [];
  List<ProductModel> _filteredProducts = [];
  List<CategoryModel> _categories = [];
  ProductModel? _selectedProduct;
  
  bool _isLoading = false;
  bool _isCategoriesLoading = false;
  String? _error;
  String _searchQuery = '';
  String? _selectedCategoryId;

  // Getters
  List<ProductModel> get products => _filteredProducts.isEmpty && _searchQuery.isEmpty && _selectedCategoryId == null
      ? _products
      : _filteredProducts;
  List<CategoryModel> get categories => _categories;
  ProductModel? get selectedProduct => _selectedProduct;
  bool get isLoading => _isLoading;
  bool get isCategoriesLoading => _isCategoriesLoading;
  String? get error => _error;
  String get searchQuery => _searchQuery;
  String? get selectedCategoryId => _selectedCategoryId;

  // Fetch all products
  Future<void> fetchProducts() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _products = await _productService.getProducts();
      _sortProductsByStock();
      _applyFilters();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  // Fetch all categories
  Future<void> fetchCategories() async {
    _isCategoriesLoading = true;
    notifyListeners();

    try {
      _categories = await _productService.getCategories();
      _categories.sort((a, b) => a.displayOrder.compareTo(b.displayOrder));
      _isCategoriesLoading = false;
      notifyListeners();
    } catch (e) {
      _isCategoriesLoading = false;
      notifyListeners();
    }
  }

  // Fetch single product
  Future<void> fetchProduct(String id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _selectedProduct = await _productService.getProduct(id);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  // Search products
  void setSearchQuery(String query) {
    _searchQuery = query.toLowerCase();
    _applyFilters();
    notifyListeners();
  }

  // Filter by category
  void setSelectedCategory(String? categoryId) {
    _selectedCategoryId = categoryId;
    _applyFilters();
    notifyListeners();
  }

  // Clear filters
  void clearFilters() {
    _searchQuery = '';
    _selectedCategoryId = null;
    _filteredProducts = [];
    notifyListeners();
  }

  // Apply filters
  void _applyFilters() {
    if (_searchQuery.isEmpty && _selectedCategoryId == null) {
      _filteredProducts = [];
      return;
    }

    _filteredProducts = _products.where((product) {
      bool matchesSearch = _searchQuery.isEmpty ||
          product.name.toLowerCase().contains(_searchQuery) ||
          (product.description?.toLowerCase().contains(_searchQuery) ?? false) ||
          (product.categoryName?.toLowerCase().contains(_searchQuery) ?? false);

      bool matchesCategory = _selectedCategoryId == null ||
          product.categoryId == _selectedCategoryId;

      return matchesSearch && matchesCategory;
    }).toList();

    _sortProductsByStock(isFiltered: true);
  }

  // Sort products by stock status (In Stock > Growing > Out of Stock)
  void _sortProductsByStock({bool isFiltered = false}) {
    final listToSort = isFiltered ? _filteredProducts : _products;
    
    listToSort.sort((a, b) {
      final stockOrder = {'in_stock': 0, 'growing': 1, 'out_of_stock': 2};
      final aOrder = stockOrder[a.stockStatus] ?? 3;
      final bOrder = stockOrder[b.stockStatus] ?? 3;
      
      if (aOrder != bOrder) {
        return aOrder.compareTo(bOrder);
      }
      return a.name.compareTo(b.name);
    });
  }

  // Get products by category
  List<ProductModel> getProductsByCategory(String categoryId) {
    return _products.where((p) => p.categoryId == categoryId).toList();
  }

  // Clear selected product
  void clearSelectedProduct() {
    _selectedProduct = null;
    notifyListeners();
  }

  // Refresh
  Future<void> refresh() async {
    await Future.wait([
      fetchProducts(),
      fetchCategories(),
    ]);
  }
}
