import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/core/constants/app_constants.dart';
import 'package:khurpi_fresh/data/models/product_model.dart';
import 'package:khurpi_fresh/features/products/product_detail_bottom_sheet.dart';
import 'package:khurpi_fresh/features/cart/floating_cart_button.dart';

class SearchPage extends ConsumerStatefulWidget {
  const SearchPage({super.key});

  @override
  ConsumerState<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends ConsumerState<SearchPage> {
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  final Dio _dio = Dio(BaseOptions(baseUrl: AppConstants.baseUrl));
  
  List<ProductModel> _searchResults = [];
  List<String> _recentSearches = [];
  bool _isLoading = false;
  bool _hasSearched = false;

  @override
  void initState() {
    super.initState();
    _loadRecentSearches();
    // Auto focus search field
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _focusNode.requestFocus();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  Future<void> _loadRecentSearches() async {
    try {
      // TODO: Get actual user_id from auth provider
      final response = await _dio.get('/search/recent', queryParameters: {'user_id': 'guest', 'limit': 5});
      if (response.data is List) {
        setState(() {
          _recentSearches = (response.data as List)
              .map((item) => item['query'] as String)
              .toList();
        });
      }
    } catch (e) {
      // Ignore errors for recent searches
    }
  }

  Future<void> _search(String query) async {
    if (query.length < 2) {
      setState(() {
        _searchResults = [];
        _hasSearched = false;
      });
      return;
    }

    setState(() => _isLoading = true);

    try {
      final response = await _dio.get('/search', queryParameters: {'q': query, 'limit': 20});
      final products = (response.data['products'] as List)
          .map((json) => ProductModel.fromJson(json))
          .toList();

      setState(() {
        _searchResults = products;
        _hasSearched = true;
        _isLoading = false;
      });

      // Save to recent searches
      if (query.isNotEmpty) {
        _saveRecentSearch(query);
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
        _hasSearched = true;
      });
    }
  }

  Future<void> _saveRecentSearch(String query) async {
    try {
      await _dio.post('/search/recent', queryParameters: {'user_id': 'guest', 'query': query});
      _loadRecentSearches();
    } catch (e) {
      // Ignore
    }
  }

  Future<void> _clearRecentSearches() async {
    try {
      await _dio.delete('/search/recent', queryParameters: {'user_id': 'guest'});
      setState(() => _recentSearches = []);
    } catch (e) {
      // Ignore
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Container(
          height: 44,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(10),
          ),
          child: TextField(
            controller: _searchController,
            focusNode: _focusNode,
            decoration: InputDecoration(
              hintText: 'Search vegetables, fruits...',
              hintStyle: TextStyle(color: AppColors.textHint, fontSize: 14),
              prefixIcon: Icon(Icons.search, color: AppColors.textSecondary),
              suffixIcon: _searchController.text.isNotEmpty
                  ? IconButton(
                      icon: Icon(Icons.close, color: AppColors.textSecondary, size: 20),
                      onPressed: () {
                        _searchController.clear();
                        setState(() {
                          _searchResults = [];
                          _hasSearched = false;
                        });
                      },
                    )
                  : null,
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(vertical: 12),
            ),
            onChanged: (value) {
              setState(() {});
              _search(value);
            },
            onSubmitted: _search,
            textInputAction: TextInputAction.search,
          ),
        ),
        actions: [
          if (_searchController.text.isNotEmpty)
            TextButton(
              onPressed: () {
                _searchController.clear();
                setState(() {
                  _searchResults = [];
                  _hasSearched = false;
                });
              },
              child: const Text('Cancel', style: TextStyle(color: Colors.white)),
            ),
        ],
      ),
      body: Stack(
        children: [
          _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _buildContent(),
          const FloatingCartButton(),
        ],
      ),
    );
  }

  Widget _buildContent() {
    // Show recent searches if no search query
    if (!_hasSearched && _searchController.text.isEmpty) {
      return _buildRecentSearches();
    }

    // Show search results or empty state
    if (_searchResults.isEmpty) {
      return _buildEmptyState();
    }

    return _buildSearchResults();
  }

  Widget _buildRecentSearches() {
    if (_recentSearches.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.search, size: 64, color: AppColors.textHint),
            const SizedBox(height: 16),
            Text(
              'Search for products',
              style: TextStyle(fontSize: 18, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 8),
            Text(
              'Find fresh vegetables, fruits & more',
              style: TextStyle(fontSize: 14, color: AppColors.textHint),
            ),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Recent Searches',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              TextButton(
                onPressed: _clearRecentSearches,
                child: Text('Clear All', style: TextStyle(color: AppColors.error)),
              ),
            ],
          ),
        ),
        Expanded(
          child: ListView.builder(
            itemCount: _recentSearches.length,
            itemBuilder: (context, index) {
              final query = _recentSearches[index];
              return ListTile(
                leading: Icon(Icons.history, color: AppColors.textSecondary),
                title: Text(query),
                trailing: Icon(Icons.north_west, size: 18, color: AppColors.textHint),
                onTap: () {
                  _searchController.text = query;
                  _search(query);
                },
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.search_off, size: 64, color: AppColors.textHint),
          const SizedBox(height: 16),
          Text(
            'No products found',
            style: TextStyle(fontSize: 18, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 8),
          Text(
            'Try searching with different keywords',
            style: TextStyle(fontSize: 14, color: AppColors.textHint),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchResults() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: Text(
            '${_searchResults.length} results found',
            style: TextStyle(
              fontSize: 14,
              color: AppColors.textSecondary,
            ),
          ),
        ),
        Expanded(
          child: ListView.builder(
            itemCount: _searchResults.length,
            itemBuilder: (context, index) {
              final product = _searchResults[index];
              return _buildProductTile(product);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildProductTile(ProductModel product) {
    return ListTile(
      onTap: () {
        showProductDetailBottomSheet(context, product.productId);
      },
      leading: ClipRRect(
        borderRadius: BorderRadius.circular(8),
        child: product.imageUrl != null
            ? Image.network(
                product.imageUrl!,
                width: 56,
                height: 56,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(
                  width: 56,
                  height: 56,
                  color: AppColors.background,
                  child: Icon(Icons.eco, color: AppColors.primary),
                ),
              )
            : Container(
                width: 56,
                height: 56,
                color: AppColors.background,
                child: Icon(Icons.eco, color: AppColors.primary),
              ),
      ),
      title: Text(
        product.name,
        style: const TextStyle(fontWeight: FontWeight.w500),
      ),
      subtitle: Text(
        '₹${product.price.toStringAsFixed(0)}/${product.unit}',
        style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600),
      ),
      trailing: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: _getStockColor(product.stockStatus).withOpacity(0.1),
          borderRadius: BorderRadius.circular(4),
        ),
        child: Text(
          _getStockText(product.stockStatus),
          style: TextStyle(
            fontSize: 12,
            color: _getStockColor(product.stockStatus),
          ),
        ),
      ),
    );
  }

  Color _getStockColor(String? status) {
    switch (status) {
      case 'in_stock':
        return AppColors.success;
      case 'growing':
        return AppColors.warning;
      default:
        return AppColors.error;
    }
  }

  String _getStockText(String? status) {
    switch (status) {
      case 'in_stock':
        return 'In Stock';
      case 'growing':
        return 'Growing';
      default:
        return 'Out of Stock';
    }
  }
}
