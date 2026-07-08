import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dio/dio.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/core/widgets/app_search_bar.dart';
import 'package:khurpi_fresh/core/constants/app_constants.dart';
import 'package:khurpi_fresh/data/models/product_model.dart';
import 'package:khurpi_fresh/features/products/product_detail_bottom_sheet.dart';
import 'package:khurpi_fresh/features/cart/floating_cart_button.dart';
import 'package:khurpi_fresh/features/cart/cart_providers.dart';

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

  static const String _recentSearchesKey = 'recent_searches';

  @override
  void initState() {
    super.initState();
    _loadRecentSearches();
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
      final prefs = await SharedPreferences.getInstance();
      final searches = prefs.getStringList(_recentSearchesKey) ?? [];
      setState(() {
        _recentSearches = searches.take(5).toList();
      });
    } catch (e) {
      debugPrint('Error loading recent searches: $e');
    }
  }

  Future<void> _saveRecentSearch(String query) async {
    if (query.trim().isEmpty) return;
    
    try {
      final prefs = await SharedPreferences.getInstance();
      final searches = prefs.getStringList(_recentSearchesKey) ?? [];
      
      // Remove if already exists
      searches.remove(query);
      // Add to beginning
      searches.insert(0, query);
      // Keep only 5
      final trimmed = searches.take(5).toList();
      
      await prefs.setStringList(_recentSearchesKey, trimmed);
      setState(() {
        _recentSearches = trimmed;
      });
    } catch (e) {
      debugPrint('Error saving recent search: $e');
    }
  }

  Future<void> _clearRecentSearches() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_recentSearchesKey);
      setState(() {
        _recentSearches = [];
      });
    } catch (e) {
      debugPrint('Error clearing recent searches: $e');
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

      if (query.isNotEmpty && products.isNotEmpty) {
        _saveRecentSearch(query);
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
        _hasSearched = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF1A1A2E)),
          onPressed: () => Navigator.pop(context),
        ),
        titleSpacing: 0,
        title: Padding(
          padding: const EdgeInsets.only(right: 16),
          child: AppSearchBar(
            controller: _searchController,
            focusNode: _focusNode,
            autofocus: true,
            onChanged: (value) {
              setState(() {});
              _search(value);
            },
            onClear: () {
              _searchController.clear();
              setState(() {
                _searchResults = [];
                _hasSearched = false;
              });
            },
          ),
        ),
      ),
      body: Stack(
        children: [
          _isLoading
              ? Center(
                  child: CircularProgressIndicator(
                    strokeWidth: 2.5,
                    color: AppColors.primary,
                  ),
                )
              : _buildContent(),
          const Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: FloatingCartButton(),
          ),
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
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFFF5F5F5),
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.search_rounded, size: 48, color: Colors.grey.shade400),
            ),
            const SizedBox(height: 20),
            Text(
              'Search for products',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: Colors.grey.shade700,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Find fresh vegetables, fruits & more',
              style: TextStyle(fontSize: 14, color: Colors.grey.shade500),
            ),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Recent Searches',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF1A1A2E),
                ),
              ),
              GestureDetector(
                onTap: _clearRecentSearches,
                child: Text(
                  'Clear All',
                  style: TextStyle(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                  ),
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: _recentSearches.length,
            itemBuilder: (context, index) {
              final query = _recentSearches[index];
              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE8E8E8)),
                ),
                child: ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  leading: Icon(Icons.history_rounded, color: Colors.grey.shade400, size: 22),
                  title: Text(
                    query,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  trailing: Icon(Icons.north_west_rounded, size: 18, color: Colors.grey.shade400),
                  onTap: () {
                    _searchController.text = query;
                    _search(query);
                  },
                ),
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
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: const Color(0xFFF5F5F5),
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.search_off_rounded, size: 48, color: Colors.grey.shade400),
          ),
          const SizedBox(height: 20),
          Text(
            'No products found',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Colors.grey.shade700,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Try searching with different keywords',
            style: TextStyle(fontSize: 14, color: Colors.grey.shade500),
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
              fontWeight: FontWeight.w500,
              color: Colors.grey.shade600,
            ),
          ),
        ),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
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
    final cartState = ref.watch(provideCartViewModelProvider);
    final cartNotifier = ref.read(provideCartViewModelNotifierProvider);

    double quantityInCart = 0;
    if (cartState != null) {
      for (final item in cartState.items) {
        if (item.productId == product.productId) {
          quantityInCart = item.quantity;
          break;
        }
      }
    }
    final isInCart = quantityInCart > 0;

    // Calculate MRP
    final mrpPrice = product.price * 1.15;
    final hasDiscount = mrpPrice > product.price;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: InkWell(
        onTap: () {
          showProductDetailBottomSheet(context, product.productId);
        },
        borderRadius: BorderRadius.circular(14),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              // Product image
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: product.imageUrl != null
                    ? CachedNetworkImage(
                        imageUrl: product.imageUrl!,
                        width: 70,
                        height: 70,
                        fit: BoxFit.cover,
                        placeholder: (_, __) => Container(
                          width: 70,
                          height: 70,
                          color: const Color(0xFFF5F5F5),
                          child: Icon(Icons.eco, color: AppColors.primary.withOpacity(0.3)),
                        ),
                        errorWidget: (_, __, ___) => Container(
                          width: 70,
                          height: 70,
                          color: const Color(0xFFF5F5F5),
                          child: Icon(Icons.eco, color: AppColors.primary.withOpacity(0.3)),
                        ),
                      )
                    : Container(
                        width: 70,
                        height: 70,
                        color: const Color(0xFFF5F5F5),
                        child: Icon(Icons.eco, color: AppColors.primary.withOpacity(0.3)),
                      ),
              ),
              const SizedBox(width: 14),
              
              // Product details
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product.name,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 15,
                        color: Color(0xFF1A1A2E),
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Text(
                          '₹${product.price.toStringAsFixed(0)}',
                          style: TextStyle(
                            color: AppColors.primary,
                            fontWeight: FontWeight.w700,
                            fontSize: 16,
                          ),
                        ),
                        if (hasDiscount) ...[
                          const SizedBox(width: 6),
                          Text(
                            '₹${mrpPrice.toStringAsFixed(0)}',
                            style: TextStyle(
                              color: Colors.grey.shade500,
                              fontSize: 13,
                              decoration: TextDecoration.lineThrough,
                            ),
                          ),
                        ],
                        Text(
                          '/${product.unit ?? 'kg'}',
                          style: TextStyle(
                            color: Colors.grey.shade500,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: _getStockColor(product.stockStatus).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        _getStockText(product.stockStatus),
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: _getStockColor(product.stockStatus),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              
              // Add button
              if (product.stockStatus == 'in_stock')
                isInCart
                    ? Container(
                        height: 32,
                        width: 80,
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: InkWell(
                                onTap: () => cartNotifier?.decrementQuantity(product.productId),
                                child: const Icon(Icons.remove, color: Colors.white, size: 16),
                              ),
                            ),
                            Text(
                              quantityInCart.toStringAsFixed(
                                quantityInCart == quantityInCart.toInt() ? 0 : 1,
                              ),
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w700,
                                fontSize: 12,
                              ),
                            ),
                            Expanded(
                              child: InkWell(
                                onTap: () => cartNotifier?.incrementQuantity(product.productId),
                                child: const Icon(Icons.add, color: Colors.white, size: 16),
                              ),
                            ),
                          ],
                        ),
                      )
                    : InkWell(
                        onTap: () => cartNotifier?.addToCart(product),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: AppColors.primary),
                          ),
                          child: Text(
                            'ADD',
                            style: TextStyle(
                              color: AppColors.primary,
                              fontWeight: FontWeight.w700,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ),
            ],
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
 ),
                            ),
                          ],
                        ),
                      )
                    : InkWell(
                        onTap: () => cartNotifier?.addToCart(product),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: AppColors.primary),
                          ),
                          child: Text(
                            'ADD',
                            style: TextStyle(
                              color: AppColors.primary,
                              fontWeight: FontWeight.w700,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ),
            ],
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
