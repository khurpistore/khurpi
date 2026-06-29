import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/core/constants/app_text_styles.dart';
import 'package:khurpi_fresh/data/models/banner_model.dart';
import 'package:khurpi_fresh/data/models/product_model.dart';
import 'package:khurpi_fresh/data/models/category_model.dart';
import 'package:khurpi_fresh/presentation/providers/providers.dart';
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

            // Banner Carousel
            if (bannersState.banners.isNotEmpty)
              SliverToBoxAdapter(
                child: BannerCarousel(banners: bannersState.banners),
              ),

            // Categories Section
            if (productsState.categories.isNotEmpty) ...[
              const SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.fromLTRB(16, 24, 16, 12),
                  child: Text('Categories', style: AppTextStyles.h4),
                ),
              ),
              SliverToBoxAdapter(
                child: SizedBox(
                  height: 120,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    itemCount: productsState.categories.length,
                    itemBuilder: (context, index) {
                      final category = productsState.categories[index];
                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: CategoryCard(
                          category: category,
                          onTap: () => _navigateToProducts(category.categoryId),
                        ),
                      );
                    },
                  ),
                ),
              ),
            ],

            // Featured Products Section
            const SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.fromLTRB(16, 24, 16, 12),
                child: Text('Featured Products', style: AppTextStyles.h4),
              ),
            ),

            // Products Grid
            if (productsState.isLoading)
              const SliverToBoxAdapter(
                child: Center(
                  child: Padding(
                    padding: EdgeInsets.all(32),
                    child: CircularProgressIndicator(),
                  ),
                ),
              )
            else if (productsState.products.isEmpty)
              const SliverToBoxAdapter(
                child: Center(
                  child: Padding(
                    padding: EdgeInsets.all(32),
                    child: Text('No products available'),
                  ),
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.all(16),
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
                        onTap: () => _navigateToProductDetail(product),
                        onAddToCart: () => _addToCart(product),
                      );
                    },
                    childCount: productsState.products.length > 6 ? 6 : productsState.products.length,
                  ),
                ),
              ),

            // View All Products Button
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: OutlinedButton(
                  onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const ProductsPage()),
                  ),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    side: const BorderSide(color: AppColors.primary),
                  ),
                  child: const Text('View All Products'),
                ),
              ),
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 20)),
          ],
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

  void _addToCart(ProductModel product) {
    ref.read(cartViewModelProvider.notifier).addToCart(product);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('${product.name} added to cart')),
    );
  }
}
