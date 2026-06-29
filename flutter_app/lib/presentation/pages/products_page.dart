import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/core/constants/app_text_styles.dart';
import 'package:khurpi_fresh/data/models/product_model.dart';
import 'package:khurpi_fresh/data/models/category_model.dart';
import 'package:khurpi_fresh/presentation/providers/providers.dart';
import 'package:khurpi_fresh/presentation/widgets/product_card.dart';
import 'package:khurpi_fresh/presentation/pages/product_detail_page.dart';

class ProductsPage extends ConsumerStatefulWidget {
  final String? initialCategoryId;

  const ProductsPage({super.key, this.initialCategoryId});

  @override
  ConsumerState<ProductsPage> createState() => _ProductsPageState();
}

class _ProductsPageState extends ConsumerState<ProductsPage> {
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final productsVM = ref.read(productsViewModelProvider);
      if (productsVM != null) {
        if (widget.initialCategoryId != null) {
          productsVM.setSelectedCategory(widget.initialCategoryId);
        }
        productsVM.loadProducts();
        productsVM.loadCategories();
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
    final productsVM = ref.watch(productsViewModelProvider);
    final cartVM = ref.watch(cartViewModelProvider);

    if (productsVM == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final productsState = productsVM.state;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Products'),
        backgroundColor: AppColors.surface,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search products...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          productsVM.setSearchQuery('');
                        },
                      )
                    : null,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                filled: true,
                fillColor: AppColors.surface,
              ),
              onChanged: (value) => productsVM.setSearchQuery(value),
            ),
          ),

          // Categories Filter
          if (productsState.categories.isNotEmpty)
            SizedBox(
              height: 50,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                itemCount: productsState.categories.length + 1,
                itemBuilder: (context, index) {
                  if (index == 0) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: FilterChip(
                        label: const Text('All'),
                        selected: productsState.selectedCategoryId == null,
                        onSelected: (_) => productsVM.setSelectedCategory(null),
                        selectedColor: AppColors.primary.withValues(alpha: 0.2),
                      ),
                    );
                  }
                  final category = productsState.categories[index - 1];
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: FilterChip(
                      label: Text(category.name),
                      selected: productsState.selectedCategoryId == category.categoryId,
                      onSelected: (_) => productsVM.setSelectedCategory(category.categoryId),
                      selectedColor: AppColors.primary.withValues(alpha: 0.2),
                    ),
                  );
                },
              ),
            ),

          const SizedBox(height: 8),

          // Products Grid
          Expanded(
            child: productsState.isLoading
                ? const Center(child: CircularProgressIndicator())
                : productsState.filteredProducts.isEmpty
                    ? const Center(child: Text('No products found'))
                    : GridView.builder(
                        padding: const EdgeInsets.all(16),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          childAspectRatio: 0.7,
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                        ),
                        itemCount: productsState.filteredProducts.length,
                        itemBuilder: (context, index) {
                          final product = productsState.filteredProducts[index];
                          return ProductCard(
                            product: product,
                            onTap: () => _navigateToProductDetail(product),
                            onAddToCart: () => _addToCart(product, cartVM),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }

  void _navigateToProductDetail(ProductModel product) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => ProductDetailPage(productId: product.productId),
      ),
    );
  }

  void _addToCart(ProductModel product, CartViewModel? cartVM) {
    cartVM?.addToCart(product);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('${product.name} added to cart')),
    );
  }
}
