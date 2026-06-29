import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/core/constants/app_text_styles.dart';
import 'package:khurpi_fresh/data/models/banner_model.dart';
import 'package:khurpi_fresh/data/models/product_model.dart';
import 'package:khurpi_fresh/data/models/category_model.dart';
import 'package:khurpi_fresh/presentation/viewmodels/products_viewmodel.dart';
import 'package:khurpi_fresh/presentation/viewmodels/banners_viewmodel.dart';
import 'package:khurpi_fresh/presentation/viewmodels/auth_viewmodel.dart';
import 'package:khurpi_fresh/presentation/viewmodels/cart_viewmodel.dart';
import 'package:khurpi_fresh/presentation/widgets/product_card.dart';
import 'package:khurpi_fresh/presentation/widgets/category_card.dart';
import 'package:khurpi_fresh/presentation/widgets/banner_carousel.dart';
import 'package:khurpi_fresh/presentation/pages/products_page.dart';
import 'package:khurpi_fresh/presentation/pages/product_detail_page.dart';

class HomePage extends ConsumerStatefulWidget {
  const HomePage({super.key});

  @override
  ConsumerState<HomePage> createState() => _HomePageState();
}

class _HomePageState extends ConsumerState<HomePage> {
  @override
  void initState() {
    super.initState();
    // Delay provider modification to avoid "modifying provider while building" error
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadData();
    });
  }

  Future<void> _loadData() async {
    await Future.wait([
      ref.read(productsViewModelProvider.notifier).loadProducts(),
      ref.read(productsViewModelProvider.notifier).loadCategories(),
      ref.read(bannersViewModelProvider.notifier).loadBanners(),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    final productsState = ref.watch(productsViewModelProvider);
    final bannersState = ref.watch(bannersViewModelProvider);
    final authState = ref.watch(authViewModelProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: RefreshIndicator(
        onRefresh: _loadData,
        child: CustomScrollView(
          slivers: [
            // App Bar
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    const Icon(Icons.eco, color: AppColors.primary, size: 32),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Khurpi Fresh', style: AppTextStyles.h3),
                          Text('Fresh Vegetables & Fruits', style: AppTextStyles.caption),
                        ],
                      ),
                    ),
                    // Search Icon
                    IconButton(
                      onPressed: () => Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const ProductsPage()),
                      ),
                      icon: const Icon(Icons.search, size: 28),
                    ),
                  ],
                ),
              ),
            ),

              // Banners
              if (bannersState.banners.isNotEmpty)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    child: BannerCarousel(
                      banners: bannersState.banners,
                      onBannerTap: (banner) => _handleBannerTap(banner),
                    ),
                  ),
                ),

              // Categories
              SliverToBoxAdapter(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 16),
                      child: Text('Categories', style: AppTextStyles.h4),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 100,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: productsState.categories.length,
                        itemBuilder: (context, index) {
                          final category = productsState.categories[index];
                          return CategoryCard(
                            category: category,
                            onTap: () => _navigateToProducts(category.categoryId),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),

              // Products Header
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Fresh Products', style: AppTextStyles.h4),
                      TextButton(
                        onPressed: () => _navigateToProducts(null),
                        child: const Text('See All'),
                      ),
                    ],
                  ),
                ),
              ),

              // Products Grid
              if (productsState.isLoading)
                const SliverToBoxAdapter(
                  child: Center(child: CircularProgressIndicator()),
                )
              else if (productsState.products.isEmpty)
                const SliverToBoxAdapter(
                  child: Center(child: Text('No products available')),
                )
              else
                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  sliver: SliverGrid(
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 0.7,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                    ),
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final product = productsState.products[index];
                        return ProductCard(
                          product: product,
                          showWholesalePrice: authState.user?.wholesaleEnabled ?? false,
                          onTap: () => _navigateToProductDetail(product.productId),
                          onAddToCart: product.stockStatus == 'in_stock'
                              ? () => _addToCart(product)
                              : null,
                        );
                      },
                      childCount: productsState.products.length.clamp(0, 6),
                    ),
                  ),
                ),

              const SliverToBoxAdapter(child: SizedBox(height: 20)),
            ],
          ),
        ),
      ),
    );
  }

  void _handleBannerTap(BannerModel banner) {
    if (banner.actionType == 'category' && banner.actionValue != null) {
      _navigateToProducts(banner.actionValue);
    }
  }

  void _navigateToProducts(String? categoryId) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => ProductsPage(initialCategoryId: categoryId),
      ),
    );
  }

  void _navigateToProductDetail(String productId) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => ProductDetailPage(productId: productId),
      ),
    );
  }

  void _addToCart(ProductModel product) {
    ref.read(cartViewModelProvider.notifier).addToCart(product, quantity: 0.5, unit: 'kg');
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('${product.name} added to cart')),
    );
  }
}
