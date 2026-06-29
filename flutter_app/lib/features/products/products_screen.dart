import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../core/providers/providers.dart';
import '../../core/widgets/widgets.dart';
import '../../core/widgets/search_bar.dart' as custom;
import 'product_detail_screen.dart';

class ProductsScreen extends StatefulWidget {
  final String? initialCategoryId;

  const ProductsScreen({
    super.key,
    this.initialCategoryId,
  });

  @override
  State<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends State<ProductsScreen> {
  final TextEditingController _searchController = TextEditingController();
  
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final productProvider = context.read<ProductProvider>();
      if (widget.initialCategoryId != null) {
        productProvider.setSelectedCategory(widget.initialCategoryId);
      }
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Header
            _buildHeader(),
            
            // Search Bar
            Padding(
              padding: const EdgeInsets.all(16),
              child: custom.SearchBar(
                controller: _searchController,
                autofocus: widget.initialCategoryId == null,
                onChanged: (value) {
                  context.read<ProductProvider>().setSearchQuery(value);
                },
              ),
            ),
            
            // Categories Horizontal Scroll
            _buildCategoriesFilter(),
            
            // Products Grid
            Expanded(
              child: _buildProductsGrid(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          // Back Button
          GestureDetector(
            onTap: () => Navigator.pop(context),
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(10),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                  ),
                ],
              ),
              child: const Icon(
                Icons.arrow_back_ios_new,
                size: 20,
                color: AppColors.textPrimary,
              ),
            ),
          ),
          
          const SizedBox(width: 16),
          
          // Title
          Expanded(
            child: Consumer<ProductProvider>(
              builder: (context, provider, _) {
                String title = 'All Products';
                if (provider.selectedCategoryId != null) {
                  final category = provider.categories.firstWhere(
                    (c) => c.id == provider.selectedCategoryId,
                    orElse: () => provider.categories.first,
                  );
                  title = category.name;
                }
                return Text(
                  title,
                  style: AppTextStyles.h3,
                );
              },
            ),
          ),
          
          // Filter Button
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(10),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                ),
              ],
            ),
            child: const Icon(
              Icons.tune,
              size: 20,
              color: AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoriesFilter() {
    return SizedBox(
      height: 45,
      child: Consumer<ProductProvider>(
        builder: (context, provider, _) {
          return ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            scrollDirection: Axis.horizontal,
            itemCount: provider.categories.length + 1, // +1 for "All" option
            itemBuilder: (context, index) {
              if (index == 0) {
                return _buildFilterChip(
                  'All',
                  provider.selectedCategoryId == null,
                  () => provider.setSelectedCategory(null),
                );
              }
              
              final category = provider.categories[index - 1];
              return _buildFilterChip(
                category.name,
                provider.selectedCategoryId == category.id,
                () => provider.setSelectedCategory(category.id),
              );
            },
          );
        },
      ),
    );
  }

  Widget _buildFilterChip(String label, bool isSelected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(right: 10),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : AppColors.surface,
          borderRadius: BorderRadius.circular(20),
          border: isSelected 
              ? null 
              : Border.all(color: AppColors.textHint.withOpacity(0.3)),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : AppColors.textSecondary,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
            fontSize: 14,
          ),
        ),
      ),
    );
  }

  Widget _buildProductsGrid() {
    return Consumer2<ProductProvider, AuthProvider>(
      builder: (context, productProvider, authProvider, _) {
        if (productProvider.isLoading) {
          return const Center(
            child: CircularProgressIndicator(color: AppColors.primary),
          );
        }
        
        final products = productProvider.products;
        
        if (products.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.search_off,
                  size: 64,
                  color: AppColors.textHint,
                ),
                const SizedBox(height: 16),
                Text(
                  'No products found',
                  style: AppTextStyles.bodyLarge.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Try adjusting your search or filters',
                  style: AppTextStyles.bodySmall,
                ),
              ],
            ),
          );
        }
        
        return GridView.builder(
          padding: const EdgeInsets.all(16),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            childAspectRatio: 0.75,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
          ),
          itemCount: products.length,
          itemBuilder: (context, index) {
            final product = products[index];
            return ProductCard(
              product: product,
              showWholesalePrice: authProvider.isWholesaleEnabled,
              onTap: () => _navigateToProductDetail(context, product.id),
              onAddToCart: product.isInStock
                  ? () => _addToCart(context, product)
                  : null,
            );
          },
        );
      },
    );
  }

  void _navigateToProductDetail(BuildContext context, String productId) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ProductDetailScreen(productId: productId),
      ),
    );
  }

  void _addToCart(BuildContext context, product) {
    final cartProvider = context.read<CartProvider>();
    cartProvider.addItem(product, quantity: 0.5, unit: 'kg');
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${product.name} added to cart'),
        backgroundColor: AppColors.primary,
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 2),
      ),
    );
  }
}
