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

  @override
  void initState() {
    super.initState();
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
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        title: const Text(
          'Products',
          style: TextStyle(
            fontWeight: FontWeight.w700,
            fontSize: 20,
            color: Color(0xFF1A1A2E),
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        shadowColor: Colors.black12,
        surfaceTintColor: Colors.transparent,
      ),
      body: Stack(
        children: [
          Column(
            children: [
              // Premium Search Bar
              Container(
                color: Colors.white,
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                child: Container(
                  height: 48,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF5F5F5),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFE8E8E8)),
                  ),
                  child: TextField(
                    controller: _searchController,
                    style: const TextStyle(fontSize: 15),
                    decoration: InputDecoration(
                      hintText: 'Search fresh products...',
                      hintStyle: TextStyle(
                        color: Colors.grey.shade500,
                        fontSize: 15,
                        fontWeight: FontWeight.w400,
                      ),
                      prefixIcon: Icon(
                        Icons.search_rounded,
                        color: Colors.grey.shade500,
                        size: 22,
                      ),
                      suffixIcon: _searchController.text.isNotEmpty
                          ? IconButton(
                              icon: Icon(Icons.close_rounded, color: Colors.grey.shade500, size: 20),
                              onPressed: () {
                                _searchController.clear();
                                ref.read(provideProductsViewModelNotifierProvider)?.setSearchQuery('');
                                setState(() {});
                              },
                            )
                          : null,
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    onChanged: (value) {
                      ref.read(provideProductsViewModelNotifierProvider)?.setSearchQuery(value);
                      setState(() {});
                    },
                  ),
                ),
              ),

              // Divider
              Container(height: 1, color: const Color(0xFFEEEEEE)),

              // Main Content: Categories + Products
              Expanded(
                child: productsState?.isLoading == true
                    ? const Center(
                        child: CircularProgressIndicator(
                          strokeWidth: 2.5,
                          color: AppColors.primary,
                        ),
                      )
                    : Row(
                        children: [
                          // Left Side: Premium Category Sidebar
                          _buildCategorySidebar(productsState),
                          
                          // Vertical Divider
                          Container(width: 1, color: const Color(0xFFEEEEEE)),
                          
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
    final selectedCategoryId = productsState?.selectedCategoryId;
    
    return Container(
      width: 88,
      color: Colors.white,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(vertical: 12),
        itemCount: categories.length + 1,
        itemBuilder: (context, index) {
          if (index == 0) {
            final isSelected = selectedCategoryId == null;
            return _buildCategoryItem(
              name: 'All',
              imageUrl: null,
              isSelected: isSelected,
              onTap: () {
                ref.read(provideProductsViewModelNotifierProvider)?.setSelectedCategory(null);
              },
            );
          }
          
          final category = categories[index - 1];
          final isSelected = selectedCategoryId == category.categoryId;
          
          return _buildCategoryItem(
            name: category.name,
            imageUrl: category.imageUrl,
            isSelected: isSelected,
            onTap: () {
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
        margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary.withOpacity(0.08) : Colors.transparent,
          borderRadius: BorderRadius.circular(14),
          border: isSelected 
              ? Border.all(color: AppColors.primary.withOpacity(0.3), width: 1.5)
              : null,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Category Image Circle
            Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isSelected ? AppColors.primary.withOpacity(0.1) : const Color(0xFFF5F5F5),
                border: Border.all(
                  color: isSelected ? AppColors.primary : const Color(0xFFE0E0E0),
                  width: isSelected ? 2 : 1,
                ),
                boxShadow: isSelected ? [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(0.2),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ] : null,
              ),
              child: ClipOval(
                child: imageUrl != null && imageUrl.isNotEmpty
                    ? CachedNetworkImage(
                        imageUrl: imageUrl,
                        fit: BoxFit.cover,
                        placeholder: (_, __) => _buildCategoryPlaceholder(name, isSelected),
                        errorWidget: (_, __, ___) => _buildCategoryPlaceholder(name, isSelected),
                      )
                    : _buildCategoryPlaceholder(name, isSelected),
              ),
            ),
            const SizedBox(height: 8),
            // Category Name
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: Text(
                name,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                  color: isSelected ? AppColors.primary : const Color(0xFF666666),
                  height: 1.2,
                ),
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryPlaceholder(String name, bool isSelected) {
    return Container(
      color: isSelected ? AppColors.primary.withOpacity(0.15) : const Color(0xFFF0F0F0),
      alignment: Alignment.center,
      child: Text(
        name.isNotEmpty ? name[0].toUpperCase() : 'A',
        style: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: isSelected ? AppColors.primary : const Color(0xFF999999),
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
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFFF5F5F5),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.inventory_2_outlined,
                size: 48,
                color: Colors.grey.shade400,
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'No products found',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: Colors.grey.shade600,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Try a different category or search',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey.shade500,
              ),
            ),
          ],
        ),
      );
    }

    return GridView.builder(
      padding: const EdgeInsets.fromLTRB(12, 12, 12, 120),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.62,
        crossAxisSpacing: 10,
        mainAxisSpacing: 12,
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
    final isGrowing = product.stockStatus == 'growing';
    
    // Get cart item quantity for this product
    final cartItems = cartState?.items ?? [];
    double quantityInCart = 0.0;
    for (final item in cartItems) {
      if (item.productId == product.productId) {
        quantityInCart = item.quantity;
        break;
      }
    }
    final isInCart = quantityInCart > 0;

    return GestureDetector(
      onTap: () => showProductDetailBottomSheet(context, product.productId),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
            BoxShadow(
              color: Colors.black.withOpacity(0.02),
              blurRadius: 4,
              offset: const Offset(0, 1),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Product Image - Fixed height
            AspectRatio(
              aspectRatio: 1.1,
              child: Stack(
                children: [
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                    child: CachedNetworkImage(
                      imageUrl: product.imageUrl ?? '',
                      fit: BoxFit.cover,
                      width: double.infinity,
                      height: double.infinity,
                      placeholder: (_, __) => Container(
                        color: const Color(0xFFF8F8F8),
                        child: Center(
                          child: SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.grey.shade300,
                            ),
                          ),
                        ),
                      ),
                      errorWidget: (_, __, ___) => Container(
                        color: const Color(0xFFF8F8F8),
                        child: Icon(
                          Icons.eco_rounded,
                          color: AppColors.primary.withOpacity(0.25),
                          size: 40,
                        ),
                      ),
                    ),
                  ),
                  // Stock Status Badge
                  if (!isInStock)
                    Positioned.fill(
                      child: Container(
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.45),
                          borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                        ),
                        child: Center(
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: isGrowing ? const Color(0xFFFFA726) : const Color(0xFFEF5350),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              isGrowing ? 'Growing' : 'Out of Stock',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                letterSpacing: 0.3,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            
            // Product Details - Fixed layout
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Product Name
                  SizedBox(
                    height: 34,
                    child: Text(
                      product.name,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF1A1A2E),
                        height: 1.3,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(height: 4),
                  // Price
                  Text(
                    '₹${product.price.toStringAsFixed(0)}/${product.unit}',
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  // Add to Cart Button or Quantity Controls
                  if (isInStock)
                    isInCart
                        ? _buildQuantityControls(product, quantityInCart)
                        : _buildAddButton(product)
                  else
                    _buildOutOfStockButton(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOutOfStockButton() {
    return Container(
      width: double.infinity,
      height: 34,
      decoration: BoxDecoration(
        color: Colors.grey.shade200,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Center(
        child: Text(
          'Unavailable',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: Colors.grey.shade500,
          ),
        ),
      ),
    );
  }

  Widget _buildAddButton(ProductModel product) {
    return SizedBox(
      width: double.infinity,
      height: 34,
      child: ElevatedButton(
        onPressed: () {
          final cartNotifier = ref.read(provideCartViewModelNotifierProvider);
          if (cartNotifier != null) {
            cartNotifier.addToCart(product);
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('${product.name} added'),
                duration: const Duration(milliseconds: 1200),
                behavior: SnackBarBehavior.floating,
                backgroundColor: AppColors.primary,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                margin: const EdgeInsets.all(16),
              ),
            );
          }
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: EdgeInsets.zero,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.add_rounded, size: 18),
            SizedBox(width: 4),
            Text(
              'ADD',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuantityControls(ProductModel product, double quantity) {
    return Container(
      height: 34,
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.08),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.primary.withOpacity(0.3)),
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
              width: 36,
              height: 34,
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: const BorderRadius.horizontal(left: Radius.circular(9)),
              ),
              child: const Icon(Icons.remove_rounded, color: Colors.white, size: 18),
            ),
          ),
          // Quantity Display
          Expanded(
            child: Center(
              child: Text(
                quantity.toStringAsFixed(quantity == quantity.toInt() ? 0 : 1),
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
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
              width: 36,
              height: 34,
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: const BorderRadius.horizontal(right: Radius.circular(9)),
              ),
              child: const Icon(Icons.add_rounded, color: Colors.white, size: 18),
            ),
          ),
        ],
      ),
    );
  }
}
