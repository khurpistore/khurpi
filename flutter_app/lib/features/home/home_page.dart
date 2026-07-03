import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/core/constants/app_text_styles.dart';
import 'package:khurpi_fresh/data/models/banner_model.dart';
import 'package:khurpi_fresh/data/models/category_model.dart';
import 'package:khurpi_fresh/data/models/product_model.dart';
import 'package:khurpi_fresh/features/products/products_page.dart';
import 'package:khurpi_fresh/features/products/product_detail_page.dart';
import 'package:khurpi_fresh/features/home/home_providers.dart';
import 'package:khurpi_fresh/features/products/products_providers.dart';

class HomePage extends ConsumerStatefulWidget {
  const HomePage({super.key});

  @override
  ConsumerState<HomePage> createState() => _HomePageState();
}

class _HomePageState extends ConsumerState<HomePage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadData();
    });
  }

  Future<void> _loadData() async {
    await Future.wait([
      ref.read(provideProductsViewModelNotifierProvider)!.loadProducts(),
      ref.read(provideProductsViewModelNotifierProvider)!.loadCategories(),
      ref.read(provideBannersViewModelNotifierProvider)!.loadBanners(),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    final productsState = ref.watch(provideProductsViewModelProvider);
    final bannersState = ref.watch(provideBannersViewModelProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: RefreshIndicator(
        onRefresh: _loadData,
        child: CustomScrollView(
          slivers: [
            // Categories Section
            if (productsState?.categories.isNotEmpty == true) ...[
              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.only(top:16),
                  child: SizedBox(
                    height: 128,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: productsState!.categories.length,
                      itemBuilder: (context, index) {
                        final category = productsState.categories[index];
                        return Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 6),
                          child: _buildCategoryCircle(category),
                        );
                      },
                    ),
                  ),
                ),
              ),
            ],

            // Banners Section (horizontal)
            if (bannersState?.banners.isNotEmpty == true) ...[
              SliverToBoxAdapter(
                child: SizedBox(
                  height: 140,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    itemCount: bannersState!.banners.length,
                    itemBuilder: (context, index) {
                      final banner = bannersState.banners[index];
                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 6),
                        child: _buildHorizontalBannerCard(banner),
                      );
                    },
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActionCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withValues(alpha: 0.3)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 8),
            Text(
              title,
              style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600),
            ),
            Text(
              subtitle,
              style: AppTextStyles.caption.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHorizontalProductCard(ProductModel product) {
    return GestureDetector(
      onTap: () => _navigateToProductDetail(product),
      child: Container(
        width: 140,
        margin: const EdgeInsets.symmetric(horizontal: 4),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Product Image
            ClipRRect(
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(12),
              ),
              child: product.imageUrl != null
                  ? Image.network(
                      product.imageUrl!,
                      height: 100,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        height: 100,
                        color: AppColors.background,
                        child: const Icon(
                          Icons.image,
                          size: 40,
                          color: AppColors.textHint,
                        ),
                      ),
                    )
                  : Container(
                      height: 100,
                      color: AppColors.background,
                      child: const Icon(
                        Icons.eco,
                        size: 40,
                        color: AppColors.primary,
                      ),
                    ),
            ),
            // Product Info
            Padding(
              padding: const EdgeInsets.all(8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.name,
                    style: AppTextStyles.body.copyWith(
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Text(
                        '₹${product.price.toStringAsFixed(0)}',
                        style: AppTextStyles.body.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                      Text(
                        '/kg',
                        style: AppTextStyles.caption.copyWith(fontSize: 11),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryCircle(CategoryModel category) {
    return GestureDetector(
      onTap: () => _navigateToProducts(category.categoryId),
      child: SizedBox(
        width: 84,
        child: Column(
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.surface,
                border: Border.all(
                  color: AppColors.primary.withValues(alpha: 0.25),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: ClipOval(
                child:
                    category.imageUrl != null && category.imageUrl!.isNotEmpty
                    ? Image.network(
                        category.imageUrl!,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) =>
                            _buildCategoryFallback(category),
                      )
                    : _buildCategoryFallback(category),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              category.name,
              style: AppTextStyles.caption.copyWith(
                fontWeight: FontWeight.w600,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryFallback(CategoryModel category) {
    final letter = category.name.isNotEmpty
        ? category.name[0].toUpperCase()
        : 'C';
    return Container(
      color: AppColors.primary.withValues(alpha: 0.08),
      alignment: Alignment.center,
      child: Text(
        letter,
        style: AppTextStyles.h3.copyWith(
          color: AppColors.primary,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildHorizontalBannerCard(BannerModel banner) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(14),
      child: Container(
        width: 280,
        decoration: BoxDecoration(
          color: AppColors.surface,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Image.network(
          banner.imageUrl,
          fit: BoxFit.cover,
          errorBuilder: (_, __, ___) => Container(
            color: AppColors.background,
            alignment: Alignment.center,
            child: const Icon(Icons.image, size: 34, color: AppColors.textHint),
          ),
        ),
      ),
    );
  }

  void _navigateToProducts(String categoryId) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => ProductsPage(initialCategoryId: categoryId),
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
}
