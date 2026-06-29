import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../core/providers/providers.dart';
import '../../core/widgets/widgets.dart';
import '../../core/widgets/search_bar.dart' as custom;
import '../products/products_screen.dart';
import '../products/product_detail_screen.dart';
import '../cart/cart_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final productProvider = context.read<ProductProvider>();
    final bannerProvider = context.read<BannerProvider>();
    final cartProvider = context.read<CartProvider>();
    
    await Future.wait([
      productProvider.fetchProducts(),
      productProvider.fetchCategories(),
      bannerProvider.fetchBanners(),
      cartProvider.loadCart(),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadData,
          color: AppColors.primary,
          child: CustomScrollView(
            slivers: [
              // App Bar with Location
              SliverToBoxAdapter(
                child: _buildLocationHeader(),
              ),
              
              // Search Bar
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: custom.SearchBar(
                    readOnly: true,
                    onTap: () => _navigateToProducts(context),
                  ),
                ),
              ),
              
              const SliverToBoxAdapter(
                child: SizedBox(height: 20),
              ),
              
              // Categories
              SliverToBoxAdapter(
                child: _buildCategoriesSection(),
              ),
              
              const SliverToBoxAdapter(
                child: SizedBox(height: 20),
              ),
              
              // Banner Carousel
              SliverToBoxAdapter(
                child: _buildBannerSection(),
              ),
              
              const SliverToBoxAdapter(
                child: SizedBox(height: 20),
              ),
              
              // Featured Products Section
              SliverToBoxAdapter(
                child: _buildSectionHeader('Featured Products', () {
                  _navigateToProducts(context);
                }),
              ),
              
              // Featured Products Grid
              _buildProductsGrid(),
              
              const SliverToBoxAdapter(
                child: SizedBox(height: 100),
              ),
            ],
          ),
        ),
      ),
      
      // Bottom Navigation
      bottomNavigationBar: _buildBottomNav(context),
      
      // Floating Cart Button
      floatingActionButton: _buildCartFAB(context),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
    );
  }

  Widget _buildLocationHeader() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          // Location Icon
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
          
          // Location Details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      'Deliver to',
                      style: AppTextStyles.caption,
                    ),
                    const SizedBox(width: 4),
                    const Icon(
                      Icons.keyboard_arrow_down,
                      size: 18,
                      color: AppColors.textSecondary,
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Consumer<AuthProvider>(
                  builder: (context, auth, _) {
                    final address = auth.user?.address ?? 'Add your address';
                    return Text(
                      address,
                      style: AppTextStyles.bodyMedium.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    );
                  },
                ),
              ],
            ),
          ),
          
          // Profile Icon
          Consumer<AuthProvider>(
            builder: (context, auth, _) {
              return GestureDetector(
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
                  child: auth.isLoggedIn
                      ? Center(
                          child: Text(
                            auth.user?.displayName.substring(0, 1).toUpperCase() ?? 'U',
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
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildCategoriesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            'Categories',
            style: AppTextStyles.h4,
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 100,
          child: Consumer<ProductProvider>(
            builder: (context, provider, _) {
              if (provider.isCategoriesLoading) {
                return const Center(
                  child: CircularProgressIndicator(color: AppColors.primary),
                );
              }
              
              return ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                scrollDirection: Axis.horizontal,
                itemCount: provider.categories.length,
                itemBuilder: (context, index) {
                  final category = provider.categories[index];
                  return CategoryCard(
                    category: category,
                    isSelected: provider.selectedCategoryId == category.id,
                    onTap: () {
                      provider.setSelectedCategory(category.id);
                      _navigateToProducts(context, categoryId: category.id);
                    },
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildBannerSection() {
    return Consumer<BannerProvider>(
      builder: (context, provider, _) {
        if (provider.isLoading) {
          return const SizedBox(
            height: 160,
            child: Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            ),
          );
        }
        
        return BannerCarousel(
          banners: provider.banners,
          onBannerTap: (banner) {
            // Handle banner tap
            if (banner.actionType == 'category' && banner.actionValue != null) {
              _navigateToProducts(context, categoryId: banner.actionValue);
            }
          },
        );
      },
    );
  }

  Widget _buildSectionHeader(String title, VoidCallback onViewAll) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: AppTextStyles.h4,
          ),
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

  Widget _buildProductsGrid() {
    return Consumer2<ProductProvider, AuthProvider>(
      builder: (context, productProvider, authProvider, _) {
        if (productProvider.isLoading) {
          return const SliverToBoxAdapter(
            child: SizedBox(
              height: 200,
              child: Center(
                child: CircularProgressIndicator(color: AppColors.primary),
              ),
            ),
          );
        }
        
        final products = productProvider.products.take(6).toList();
        
        if (products.isEmpty) {
          return const SliverToBoxAdapter(
            child: SizedBox(
              height: 200,
              child: Center(
                child: Text('No products available'),
              ),
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
                  showWholesalePrice: authProvider.isWholesaleEnabled,
                  onTap: () => _navigateToProductDetail(context, product.id),
                  onAddToCart: product.isInStock
                      ? () => _addToCart(context, product)
                      : null,
                );
              },
              childCount: products.length,
            ),
          ),
        );
      },
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
              const SizedBox(width: 60), // Space for FAB
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

  Widget _buildCartFAB(BuildContext context) {
    return Consumer<CartProvider>(
      builder: (context, cart, _) {
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
                const Icon(
                  Icons.shopping_cart,
                  color: Colors.white,
                  size: 28,
                ),
                if (cart.itemCount > 0)
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
                        cart.itemCount.toString(),
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
      },
    );
  }

  void _navigateToProducts(BuildContext context, {String? categoryId}) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ProductsScreen(initialCategoryId: categoryId),
      ),
    );
  }

  void _navigateToProductDetail(BuildContext context, String productId) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ProductDetailScreen(productId: productId),
      ),
    );
  }

  void _navigateToCart(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const CartScreen(),
      ),
    );
  }

  void _addToCart(BuildContext context, product) {
    final cartProvider = context.read<CartProvider>();
    cartProvider.addItem(product, quantity: 0.5, unit: 'kg');
    
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
