import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../core/providers/providers.dart';
import '../../core/widgets/quantity_selector.dart';
import '../cart/cart_screen.dart';

class ProductDetailScreen extends StatefulWidget {
  final String productId;

  const ProductDetailScreen({
    super.key,
    required this.productId,
  });

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  double _quantity = 0.5;
  String _unit = 'kg';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ProductProvider>().fetchProduct(widget.productId);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Consumer2<ProductProvider, AuthProvider>(
        builder: (context, productProvider, authProvider, _) {
          if (productProvider.isLoading) {
            return const Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            );
          }

          final product = productProvider.selectedProduct;
          if (product == null) {
            return const Center(
              child: Text('Product not found'),
            );
          }

          return Stack(
            children: [
              // Content
              CustomScrollView(
                slivers: [
                  // Product Image
                  SliverToBoxAdapter(
                    child: _buildImageSection(product.imageUrl),
                  ),

                  // Product Details
                  SliverToBoxAdapter(
                    child: _buildDetailsSection(product, authProvider.isWholesaleEnabled),
                  ),

                  // Spacer for bottom button
                  const SliverToBoxAdapter(
                    child: SizedBox(height: 120),
                  ),
                ],
              ),

              // Back Button
              Positioned(
                top: MediaQuery.of(context).padding.top + 8,
                left: 16,
                child: _buildBackButton(),
              ),

              // Cart Button
              Positioned(
                top: MediaQuery.of(context).padding.top + 8,
                right: 16,
                child: _buildCartButton(),
              ),

              // Bottom Add to Cart
              if (product.isInStock)
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  child: _buildAddToCartSection(product),
                ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildBackButton() {
    return GestureDetector(
      onTap: () => Navigator.pop(context),
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 10,
            ),
          ],
        ),
        child: const Icon(
          Icons.arrow_back_ios_new,
          size: 20,
          color: AppColors.textPrimary,
        ),
      ),
    );
  }

  Widget _buildCartButton() {
    return Consumer<CartProvider>(
      builder: (context, cart, _) {
        return GestureDetector(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const CartScreen()),
            );
          },
          child: Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 10,
                ),
              ],
            ),
            child: Stack(
              children: [
                const Icon(
                  Icons.shopping_cart_outlined,
                  size: 22,
                  color: AppColors.textPrimary,
                ),
                if (cart.itemCount > 0)
                  Positioned(
                    right: -2,
                    top: -2,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                      ),
                      child: Text(
                        cart.itemCount.toString(),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 8,
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

  Widget _buildImageSection(String? imageUrl) {
    return Container(
      height: 300,
      width: double.infinity,
      color: AppColors.surface,
      child: CachedNetworkImage(
        imageUrl: imageUrl ?? '',
        fit: BoxFit.cover,
        placeholder: (context, url) => Container(
          color: AppColors.background,
          child: const Center(
            child: CircularProgressIndicator(
              color: AppColors.primary,
              strokeWidth: 2,
            ),
          ),
        ),
        errorWidget: (context, url, error) => Container(
          color: AppColors.background,
          child: const Icon(
            Icons.image_not_supported_outlined,
            color: AppColors.textHint,
            size: 60,
          ),
        ),
      ),
    );
  }

  Widget _buildDetailsSection(product, bool showWholesale) {
    final displayPrice = showWholesale && product.wholesalePrice != null
        ? product.wholesalePrice
        : product.price;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(24),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Category & Stock Status
          Row(
            children: [
              if (product.categoryName != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    product.categoryName!,
                    style: AppTextStyles.caption.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              const Spacer(),
              _buildStockBadge(product.stockStatus),
            ],
          ),

          const SizedBox(height: 16),

          // Product Name
          Text(
            product.name,
            style: AppTextStyles.h2,
          ),

          const SizedBox(height: 8),

          // Price
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '₹${displayPrice.toStringAsFixed(0)}',
                style: AppTextStyles.h2.copyWith(
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(width: 4),
              Text(
                '/${product.displayUnit}',
                style: AppTextStyles.bodyMedium.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
              if (showWholesale && product.wholesalePrice != null) ...[
                const SizedBox(width: 12),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.secondary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    'Wholesale',
                    style: AppTextStyles.caption.copyWith(
                      color: AppColors.secondary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ],
          ),

          const SizedBox(height: 20),

          // Quantity Selector
          if (product.isInStock) ...[
            Text(
              'Quantity',
              style: AppTextStyles.bodyMedium.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                // Unit Toggle
                _buildUnitToggle(),
                const SizedBox(width: 16),
                // Quantity Selector
                QuantitySelector(
                  quantity: _quantity,
                  unit: _unit,
                  onIncrement: _incrementQuantity,
                  onDecrement: _decrementQuantity,
                ),
              ],
            ),
          ],

          const SizedBox(height: 24),

          // Description
          if (product.description != null) ...[
            Text(
              'Description',
              style: AppTextStyles.bodyMedium.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              product.description!,
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.textSecondary,
                height: 1.5,
              ),
            ),
          ],

          const SizedBox(height: 24),

          // Info Cards
          Row(
            children: [
              _buildInfoCard(Icons.eco, 'Fresh', '100% Organic'),
              const SizedBox(width: 12),
              _buildInfoCard(Icons.local_shipping, 'Delivery', 'Same Day'),
              const SizedBox(width: 12),
              _buildInfoCard(Icons.verified, 'Quality', 'Guaranteed'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStockBadge(String status) {
    Color backgroundColor;
    String text;

    switch (status) {
      case 'in_stock':
        backgroundColor = AppColors.inStock;
        text = 'In Stock';
        break;
      case 'growing':
        backgroundColor = AppColors.growing;
        text = 'Growing';
        break;
      default:
        backgroundColor = AppColors.outOfStock;
        text = 'Out of Stock';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        text,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildUnitToggle() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          _buildUnitOption('kg', _unit == 'kg'),
          _buildUnitOption('gm', _unit == 'gm'),
        ],
      ),
    );
  }

  Widget _buildUnitOption(String unit, bool isSelected) {
    return GestureDetector(
      onTap: () {
        setState(() {
          _unit = unit;
          _quantity = unit == 'kg' ? 0.5 : 250;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(
          unit,
          style: TextStyle(
            color: isSelected ? Colors.white : AppColors.textSecondary,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
      ),
    );
  }

  Widget _buildInfoCard(IconData icon, String title, String subtitle) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.background,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Icon(icon, color: AppColors.primary, size: 24),
            const SizedBox(height: 4),
            Text(
              title,
              style: AppTextStyles.caption.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            Text(
              subtitle,
              style: AppTextStyles.caption.copyWith(
                fontSize: 10,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAddToCartSection(product) {
    final total = _unit == 'gm'
        ? product.price * (_quantity / 1000)
        : product.price * _quantity;

    return Container(
      padding: EdgeInsets.fromLTRB(
        20,
        16,
        20,
        MediaQuery.of(context).padding.bottom + 16,
      ),
      decoration: BoxDecoration(
        color: AppColors.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 20,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: Row(
        children: [
          // Total Price
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Total',
                  style: AppTextStyles.caption,
                ),
                Text(
                  '₹${total.toStringAsFixed(2)}',
                  style: AppTextStyles.h3.copyWith(
                    color: AppColors.primary,
                  ),
                ),
              ],
            ),
          ),

          // Add to Cart Button
          Expanded(
            flex: 2,
            child: ElevatedButton(
              onPressed: () => _addToCart(product),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.shopping_cart_outlined, color: Colors.white),
                  SizedBox(width: 8),
                  Text(
                    'Add to Cart',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _incrementQuantity() {
    setState(() {
      if (_unit == 'gm') {
        _quantity += 100;
      } else {
        _quantity += 0.5;
      }
    });
  }

  void _decrementQuantity() {
    setState(() {
      if (_unit == 'gm') {
        if (_quantity > 100) _quantity -= 100;
      } else {
        if (_quantity > 0.5) _quantity -= 0.5;
      }
    });
  }

  void _addToCart(product) {
    final cartProvider = context.read<CartProvider>();
    cartProvider.addItem(product, quantity: _quantity, unit: _unit);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${product.name} added to cart'),
        backgroundColor: AppColors.primary,
        behavior: SnackBarBehavior.floating,
        action: SnackBarAction(
          label: 'View Cart',
          textColor: Colors.white,
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const CartScreen()),
            );
          },
        ),
      ),
    );
  }
}
