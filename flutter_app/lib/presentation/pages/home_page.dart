import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../viewmodels/viewmodels.dart';
import '../widgets/widgets.dart';
import 'products_page.dart';
import 'product_detail_page.dart';
import 'cart_page.dart';

class HomePage extends ConsumerStatefulWidget {
  const HomePage({super.key});

  @override
  ConsumerState<HomePage> createState() => _HomePageState();
}

class _HomePageState extends ConsumerState<HomePage> {
  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    await Future.wait([
      ref.read(productsViewModelProvider.notifier).fetchProducts(),
      ref.read(productsViewModelProvider.notifier).fetchCategories(),
      ref.read(bannersViewModelProvider.notifier).fetchBanners(),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    final productsState = ref.watch(productsViewModelProvider);
    final bannersState = ref.watch(bannersViewModelProvider);
    final authState = ref.watch(authViewModelProvider);
    final cartState = ref.watch(cartViewModelProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadData,
          color: AppColors.primary,
          child: CustomScrollView(
            slivers: [
              // Location Header
              SliverToBoxAdapter(
                child: _buildLocationHeader(authState),
              ),

              // Search Bar
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: CustomSearchBar(
                    readOnly: true,
                    onTap: () => _navigateToProducts(context),
                  ),
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 20)),

              // Categories
              SliverToBoxAdapter(
                child: _buildCategoriesSection(productsState),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 20)),

              // Banners
              SliverToBoxAdapter(
                child: _buildBannerSection(bannersState),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 20)),

              // Featured Products Header
              SliverToBoxAdapter(
                child: _buildSectionHeader('Featured Products', () {
                  _navigateToProducts(context);
                }),
              ),

              // Products Grid
              _buildProductsGrid(productsState, authState),

              const SliverToBoxAdapter(child: SizedBox(height: 100)),
            ],
          ),
        ),
      ),
      bottomNavigationBar: _buildBottomNav(context),
      floatingActionButton: _buildCartFAB(context, cartState),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
    );
  }

  Widget _buildLocationHeader(AuthState authState) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(
              Icons.location_on,
              color: AppColors.primary,
              size: 24,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text('Deliver to', style: AppTextStyles.caption),
                    const SizedBox(width: 4),
                    const Icon(
                      Icons.keyboard_arrow_down,
                      size: 18,
                      color: AppColors.textSecondary,
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  authState.user?.address ?? 'Add your address',
                  style: AppTextStyles.bodyMedium.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          GestureDetector(
            onTap: () {
              // Navigate to profile
            },
            child: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(12),
              ),
              child: authState.isLoggedIn
                  ? Center(
                      child: Text(
                        authState.user?.displayName.substring(0, 1).toUpperCase() ?? 'U',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                    )
                  : const Icon(
                      Icons.person_outline,
                      color: Colors.white,
                      size: 22,
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoriesSection(ProductsState state) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Text('Categories', style: AppTextStyles.h4),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 100,
          child: state.isCategoriesLoading
              ? const Center(
                  child: CircularProgressIndicator(color: AppColors.primary),
                )
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  scrollDirection: Axis.horizontal,
                  itemCount: state.categories.length,
                  itemBuilder: (context, index) {
                    final category = state.categories[index];
                    return CategoryCard(
                      category: category,
                      isSelected: state.selectedCategoryId == category.id,
                      onTap: () {
                        ref.read(productsViewModelProvider.notifier)
                            .setSelectedCategory(category.id);
                        _navigateToProducts(context, categoryId: category.id);
                      },
                    );
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildBannerSection(BannersState state) {
    if (state.isLoading) {
      return const SizedBox(
        height: 160,
        child: Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
      );
    }

    return BannerCarousel(
      banners: state.banners,
      onBannerTap: (banner) {
        if (banner.actionType == 'category' && banner.actionValue != null) {
          _navigateToProducts(context, categoryId: banner.actionValue);
        }
      },
    );
  }

  Widget _buildSectionHeader(String title, VoidCallback onViewAll) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(title, style: AppTextStyles.h4),
          TextButton(
            onPressed: onViewAll,
            child: Text(
              'View All',
              style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.primary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProductsGrid(ProductsState productsState, AuthState authState) {
    if (productsState.isLoading) {
      return const SliverToBoxAdapter(
        child: SizedBox(
          height: 200,
          child: Center(
            child: CircularProgressIndicator(color: AppColors.primary),
          ),
        ),
      );
    }

    final products = productsState.products.take(6).toList();

    if (products.isEmpty) {
      return const SliverToBoxAdapter(
        child: SizedBox(
          height: 200,
          child: Center(child: Text('No products available')),
        ),
      );
    }

    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      sliver: SliverGrid(
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 0.75,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
        ),
        delegate: SliverChildBuilderDelegate(
          (context, index) {
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
          childCount: products.length,
        ),
      ),
    );
  }

  Widget _buildBottomNav(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(Icons.home, 'Home', true, () {}),
              _buildNavItem(Icons.grid_view, 'Categories', false, () {
                _navigateToProducts(context);
              }),
              const SizedBox(width: 60),
              _buildNavItem(Icons.receipt_long, 'Orders', false, () {}),
              _buildNavItem(Icons.person_outline, 'Profile', false, () {}),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(IconData icon, String label, bool isActive, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            color: isActive ? AppColors.primary : AppColors.textHint,
            size: 24,
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              color: isActive ? AppColors.primary : AppColors.textHint,
              fontSize: 12,
              fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCartFAB(BuildContext context, CartState cartState) {
    return GestureDetector(
      onTap: () => _navigateToCart(context),
      child: Container(
        width: 60,
        height: 60,
        decoration: BoxDecoration(
          gradient: AppColors.primaryGradient,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withOpacity(0.4),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Stack(
          alignment: Alignment.center,
          children: [
            const Icon(Icons.shopping_cart, color: Colors.white, size: 28),
            if (cartState.itemCount > 0)
              Positioned(
                top: 8,
                right: 8,
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: const BoxDecoration(
                    color: AppColors.secondary,
                    shape: BoxShape.circle,
                  ),
                  child: Text(
                    cartState.itemCount.toString(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  void _navigateToProducts(BuildContext context, {String? categoryId}) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ProductsPage(initialCategoryId: categoryId),
      ),
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

  void _navigateToCart(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const CartPage(),
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
        action: SnackBarAction(
          label: 'View Cart',
          textColor: Colors.white,
          onPressed: () => _navigateToCart(context),
        ),
      ),
    );
  }
}
