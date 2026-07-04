import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/core/constants/app_text_styles.dart';
import 'package:khurpi_fresh/data/models/product_model.dart';
import 'package:khurpi_fresh/features/products/products_providers.dart';
import 'package:khurpi_fresh/features/cart/cart_providers.dart';
import 'package:khurpi_fresh/features/cart/floating_cart_button.dart';
import 'package:khurpi_fresh/features/products/widgets/product_card.dart';
import 'package:khurpi_fresh/features/products/product_detail_bottom_sheet.dart';

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
        if (widget.initialCategoryId != null) {
          ref.read(provideProductsViewModelNotifierProvider)!.setSelectedCategory(widget.initialCategoryId);
        }
        ref.read(provideProductsViewModelNotifierProvider)!.loadProducts();
        ref.read(provideProductsViewModelNotifierProvider)!.loadCategories();
      });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final productsState = ref.watch(provideProductsViewModelProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Products'), backgroundColor: AppColors.surface, elevation: 0),
      body: Stack(
        children: [
          Column(
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
                              ref.read(provideProductsViewModelNotifierProvider)!.setSearchQuery('');
                            },
                          )
                        : null,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                    filled: true,
                    fillColor: AppColors.surface,
                  ),
                    onChanged: (value) => ref.read(provideProductsViewModelNotifierProvider)!.setSearchQuery(value),
                ),
              ),

              // Categories Filter
              if (productsState?.categories.isNotEmpty == true)
                SizedBox(
                  height: 50,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    itemCount: productsState!.categories.length + 1,
                    itemBuilder: (context, index) {
                      if (index == 0) {
                        return Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          child: FilterChip(
                            label: const Text('All'),
                            selected: productsState.selectedCategoryId == null,
                            onSelected: (_) => ref.read(provideProductsViewModelNotifierProvider)!.setSelectedCategory(null),
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
                          onSelected: (_) => ref.read(provideProductsViewModelNotifierProvider)!.setSelectedCategory(category.categoryId),
                          selectedColor: AppColors.primary.withValues(alpha: 0.2),
                        ),
                      );
                    },
                  ),
                ),

              const SizedBox(height: 8),

              // Products Grid
              Expanded(
                child: productsState?.isLoading == true
                    ? const Center(child: CircularProgressIndicator())
                    : productsState?.filteredProducts.isEmpty != false
                        ? const Center(child: Text('No products found'))
                        : GridView.builder(
                            padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
                            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, childAspectRatio: 0.7, crossAxisSpacing: 12, mainAxisSpacing: 12),
                            itemCount: productsState!.filteredProducts.length,
                            itemBuilder: (context, index) {
                              final product = productsState.filteredProducts[index];
                              return ProductCard(
                                product: product,
                                onTap: () => _openProductDetail(product),
                                onAddToCart: () => _addToCart(product),
                              );
                            },
                          ),
              ),
            ],
          ),
          // Floating Cart Button
          const FloatingCartButton(),
        ],
      ),
    );
  }

  void _openProductDetail(ProductModel product) {
    showProductDetailBottomSheet(context, product.productId);
  }

  void _addToCart(ProductModel product) {
    final cartNotifier = ref.read(provideCartViewModelNotifierProvider);
    if (cartNotifier != null) {
      cartNotifier.addToCart(product);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('${product.name} added to cart')));
    } else {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Unable to add to cart. Please try again.')));
    }
  }
}
