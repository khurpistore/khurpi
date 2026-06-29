import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/core/constants/app_text_styles.dart';
import 'package:khurpi_fresh/presentation/viewmodels/viewmodels.dart';
import 'package:khurpi_fresh/presentation/widgets/widgets.dart';
import 'package:khurpi_fresh/presentation/pages/product_detail_page.dart';

class ProductsPage extends ConsumerStatefulWidget {
  final String? initialCategoryId;

  const ProductsPage({super.key, this.initialCategoryId});

  @override
  ConsumerState<ProductsPage> createState() => _ProductsPageState();
}

class _ProductsPageState extends ConsumerState<ProductsPage> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (widget.initialCategoryId != null) {
        ref.read(productsViewModelProvider.notifier)
            .setSelectedCategory(widget.initialCategoryId);
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
    final productsState = ref.watch(productsViewModelProvider);
    final authState = ref.watch(authViewModelProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(productsState),
            Padding(
              padding: const EdgeInsets.all(16),
              child: CustomSearchBar(
                controller: _searchController,
                autofocus: widget.initialCategoryId == null,
                onChanged: (value) {
                  ref.read(productsViewModelProvider.notifier).setSearchQuery(value);
                },
              ),
            ),
            _buildCategoriesFilter(productsState),
            Expanded(
              child: _buildProductsGrid(productsState, authState),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(ProductsState state) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
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
          Expanded(
            child: Text(
              _getTitle(state),
              style: AppTextStyles.h3,
            ),
          ),
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

  String _getTitle(ProductsState state) {
    if (state.selectedCategoryId != null) {
      try {
        final category = state.categories.firstWhere(
          (c) => c.id == state.selectedCategoryId,
        );
        return category.name;
      } catch (e) {
        return 'All Products';
      }
    }
    return 'All Products';
  }

  Widget _buildCategoriesFilter(ProductsState state) {
    return SizedBox(
      height: 45,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        scrollDirection: Axis.horizontal,
        itemCount: state.categories.length + 1,
        itemBuilder: (context, index) {
          if (index == 0) {
            return _buildFilterChip(
              'All',
              state.selectedCategoryId == null,
              () => ref.read(productsViewModelProvider.notifier)
                  .setSelectedCategory(null),
            );
          }

          final category = state.categories[index - 1];
          return _buildFilterChip(
            category.name,
            state.selectedCategoryId == category.id,
            () => ref.read(productsViewModelProvider.notifier)
                .setSelectedCategory(category.id),
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

  Widget _buildProductsGrid(ProductsState productsState, AuthState authState) {
    if (productsState.isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.primary),
      );
    }

    final products = productsState.displayProducts;

    if (products.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.search_off, size: 64, color: AppColors.textHint),
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
          showWholesalePrice: authState.isWholesaleEnabled,
          onTap: () => _navigateToProductDetail(context, product.id),
          onAddToCart: product.isInStock
              ? () => _addToCart(product)
              : null,
        );
      },
    );
  }

  void _navigateToProductDetail(BuildContext context, String productId) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ProductDetailPage(productId: productId),
      ),
    );
  }

  void _addToCart(product) {
    ref.read(cartViewModelProvider.notifier).addItem(product, quantity: 0.5, unit: 'kg');

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
