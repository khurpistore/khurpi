import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/core/constants/app_text_styles.dart';
import 'package:khurpi_fresh/data/models/category_model.dart';
import 'package:khurpi_fresh/data/models/product_model.dart';
import 'package:khurpi_fresh/features/products/products_providers.dart';
import 'package:khurpi_fresh/features/products/widgets/product_card.dart';
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
                            child: _buildProductsGrid(productsState),
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
      width: 80,
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
        padding: const EdgeInsets.symmetric(vertical: 10),
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
                  width: isSelected ? 1 : 0,
                ),
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
            const SizedBox(height: 6),
            // Category Name
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: Text(
                name,
                style: TextStyle(
                  fontSize: 9,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                  color: isSelected ? AppColors.primary : const Color(0xFF000000),
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

  Widget _buildProductsGrid(dynamic productsState) {
    final products = productsState?.filteredProducts ?? <ProductModel>[];
    
    if (products.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                color: Color(0xFFF5F5F5),
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
        childAspectRatio: 0.45,
        crossAxisSpacing: 8,
      ),
      itemCount: products.length,
      itemBuilder: (context, index) {
        final product = products[index];
        return ProductCard(
          product: product,
          onTap: () => showProductDetailBottomSheet(context, product.productId),
        );
      },
    );
  }
}
