import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/core/constants/app_text_styles.dart';
import 'package:khurpi_fresh/data/models/product_model.dart';
import 'package:khurpi_fresh/data/models/category_model.dart';
import 'package:khurpi_fresh/features/products/products_providers.dart';
import 'package:khurpi_fresh/features/cart/cart_providers.dart';
import 'package:khurpi_fresh/features/cart/floating_cart_button.dart';
import 'package:khurpi_fresh/features/products/product_detail_bottom_sheet.dart';

class ProductsPage extends ConsumerStatefulWidget {
  final String? initialCategoryId;

  const ProductsPage({super.key, this.initialCategoryId});

  @override
  ConsumerState<ProductsPage> createState() => _ProductsPageState();
}

class _ProductsPageState extends ConsumerState<ProductsPage> {
  final _searchController = TextEditingController();
  String? _selectedCategoryId;

  @override
  void initState() {
    super.initState();
    _selectedCategoryId = widget.initialCategoryId;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (widget.initialCategoryId != null) {
        ref.read(provideProductsViewModelNotifierProvider)?.setSelectedCategory(widget.initialCategoryId);
      }
      ref.read(provideProductsViewModelNotifierProvider)?.loadProducts();
      ref.read(provideProductsViewModelNotifierProvider)?.loadCategories();
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
    final cartState = ref.watch(provideCartViewModelProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Products'),
        backgroundColor: AppColors.surface,
        elevation: 0,
      ),
      body: Stack(
        children: [
          Column(
            children: [
              // Search Bar
              Container(
                padding: const EdgeInsets.all(12),
                color: AppColors.surface,
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Search products...',
                    hintStyle: TextStyle(color: AppColors.textHint, fontSize: 14),
                    prefixIcon: Icon(Icons.search, color: AppColors.textSecondary),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: Icon(Icons.clear, color: AppColors.textSecondary),
                            onPressed: () {
                              _searchController.clear();
                              ref.read(provideProductsViewModelNotifierProvider)?.setSearchQuery('');
                              setState(() {});
                            },
                          )
                        : null,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: BorderSide.none,
                    ),
                    filled: true,
                    fillColor: AppColors.background,
                    contentPadding: const EdgeInsets.symmetric(vertical: 0),
                  ),
                  onChanged: (value) {
                    ref.read(provideProductsViewModelNotifierProvider)?.setSearchQuery(value);
                    setState(() {});
                  },
                ),
              ),

              // Main Content: Categories + Products
              Expanded(
                child: productsState?.isLoading == true
                    ? const Center(child: CircularProgressIndicator())
                    : Row(
                        children: [
                          // Left Side: Category List (Vertical Scroll)
                          _buildCategorySidebar(productsState),
                          
                          // Right Side: Products Grid
                          Expanded(
                            child: _buildProductsGrid(productsState, cartState),
                          ),
                        ],
                      ),
              ),
            ],
          ),
          // Floating Cart Button
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

  Widget _buildCategorySidebar(dynamic productsState) {
    final categories = productsState?.categories ?? <CategoryModel>[];
    
    return Container(
      width: 80,
      color: AppColors.surface,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(vertical: 8),
        itemCount: categories.length + 1, // +1 for "All" option
        itemBuilder: (context, index) {
          if (index == 0) {
            // "All" category
            final isSelected = _selectedCategoryId == null;
            return _buildCategoryItem(
              name: 'All',
              imageUrl: null,
              isSelected: isSelected,
              onTap: () {
                setState(() => _selectedCategoryId = null);
                ref.read(provideProductsViewModelNotifierProvider)?.setSelectedCategory(null);
              },
            );
          }
          
          final category = categories[index - 1];
          final isSelected = _selectedCategoryId == category.categoryId;
          
          return _buildCategoryItem(
            name: category.name,
            imageUrl: category.imageUrl,
            isSelected: isSelected,
            onTap: () {
              setState(() => _selectedCategoryId = category.categoryId);
              ref.read(provideProductsViewModelNotifierProvider)?.setSelectedCategory(category.categoryId);
            },
          );
        },
      ),
    );
  }

  Widget _buildCategoryItem({
    required String name,
    String? imageUrl,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
        margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary.withOpacity(0.1) : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
          border: isSelected ? Border.all(color: AppColors.primary, width: 2) : null,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Category Image Circle
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.background,
                border: Border.all(
                  color: isSelected ? AppColors.primary : AppColors.border,
                  width: isSelected ? 2 : 1,
                ),
              ),
              child: ClipOval(
                child: imageUrl != null && imageUrl.isNotEmpty
                    ? CachedNetworkImage(
                        imageUrl: imageUrl,
                        fit: BoxFit.cover,
                        placeholder: (_, __) => _buildCategoryPlaceholder(name),
                        errorWidget: (_, __, ___) => _buildCategoryPlaceholder(name),
                      )
                    : _buildCategoryPlaceholder(name),
              ),
            ),
            const SizedBox(height: 4),
            // Category Name
            Text(
              name,
              style: TextStyle(
                fontSize: 10,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                color: isSelected ? AppColors.primary : AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryPlaceholder(String name) {
    return Container(
      color: AppColors.primary.withOpacity(0.1),
      alignment: Alignment.center,
      child: Text(
        name.isNotEmpty ? name[0].toUpperCase() : 'A',
        style: TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.bold,
          color: AppColors.primary,
        ),
      ),
    );
  }

  Widget _buildProductsGrid(dynamic productsState, dynamic cartState) {
    final products = productsState?.filteredProducts ?? <ProductModel>[];
    
    if (products.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.inventory_2_outlined, size: 64, color: AppColors.textHint),
            const SizedBox(height: 16),
            Text('No products found', style: AppTextStyles.body.copyWith(color: AppColors.textSecondary)),
          ],
        ),
      );
    }

    return GridView.builder(
      padding: const EdgeInsets.fromLTRB(8, 8, 8, 100),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.65,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
      ),
      itemCount: products.length,
      itemBuilder: (context, index) {
        final product = products[index];
        return _buildProductCard(product, cartState);
      },
    );
  }

  Widget _buildProductCard(ProductModel product, dynamic cartState) {
    final isInStock = product.stockStatus == 'in_stock';
    
    // Get cart item quantity for this product
    final cartItems = cartState?.items ?? [];
    final cartItem = cartItems.firstWhere(
      (item) => item.productId == product.productId,
      orElse: () => null,
    );
    final quantityInCart = cartItem?.quantity ?? 0.0;
    final isInCart = quantityInCart > 0;

    return GestureDetector(
      onTap: () => showProductDetailBottomSheet(context, product.productId),
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Product Image
            Expanded(
              flex: 3,
              child: Stack(
                children: [
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                    child: CachedNetworkImage(
                      imageUrl: product.imageUrl ?? '',
                      fit: BoxFit.cover,
                      width: double.infinity,
                      height: double.infinity,
                      placeholder: (_, __) => Container(
                        color: AppColors.background,
                        child: const Center(child: CircularProgressIndicator(strokeWidth: 2)),
                      ),
                      errorWidget: (_, __, ___) => Container(
                        color: AppColors.background,
                        child: Icon(Icons.eco, color: AppColors.primary.withOpacity(0.3), size: 40),
                      ),
                    ),
                  ),
                  // Stock Status Badge
                  if (!isInStock)
                    Positioned.fill(
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.5),
                          borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                        ),
                        child: Center(
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: product.stockStatus == 'growing' ? AppColors.warning : AppColors.error,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              product.stockStatus == 'growing' ? 'Growing' : 'Out of Stock',
                              style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
                            ),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            // Product Details
            Expanded(
              flex: 2,
              child: Padding(
                padding: const EdgeInsets.all(8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Product Name
                    Text(
                      product.name,
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const Spacer(),
                    // Price
                    Text(
                      '₹${product.price.toStringAsFixed(0)}/${product.unit}',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),
                    const SizedBox(height: 6),
                    // Add to Cart Button or Quantity Controls
                    if (isInStock)
                      isInCart
                          ? _buildQuantityControls(product, quantityInCart)
                          : _buildAddButton(product),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAddButton(ProductModel product) {
    return SizedBox(
      width: double.infinity,
      height: 32,
      child: ElevatedButton(
        onPressed: () {
          final cartNotifier = ref.read(provideCartViewModelNotifierProvider);
          if (cartNotifier != null) {
            cartNotifier.addToCart(product);
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('${product.name} added to cart'),
                duration: const Duration(seconds: 1),
              ),
            );
          }
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          padding: EdgeInsets.zero,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
        child: const Text(
          'ADD',
          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.white),
        ),
      ),
    );
  }

  Widget _buildQuantityControls(ProductModel product, double quantity) {
    return Container(
      height: 32,
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.primary),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Minus Button
          GestureDetector(
            onTap: () {
              final cartNotifier = ref.read(provideCartViewModelNotifierProvider);
              cartNotifier?.decrementQuantity(product.productId);
            },
            child: Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: const BorderRadius.horizontal(left: Radius.circular(7)),
              ),
              child: const Icon(Icons.remove, color: Colors.white, size: 18),
            ),
          ),
          // Quantity Display
          Expanded(
            child: Center(
              child: Text(
                quantity.toStringAsFixed(quantity == quantity.toInt() ? 0 : 1),
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: AppColors.primary,
                ),
              ),
            ),
          ),
          // Plus Button
          GestureDetector(
            onTap: () {
              final cartNotifier = ref.read(provideCartViewModelNotifierProvider);
              cartNotifier?.incrementQuantity(product.productId);
            },
            child: Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: const BorderRadius.horizontal(right: Radius.circular(7)),
              ),
              child: const Icon(Icons.add, color: Colors.white, size: 18),
            ),
          ),
        ],
      ),
    );
  }
}
