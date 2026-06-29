import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/core/constants/app_text_styles.dart';
import 'package:khurpi_fresh/presentation/viewmodels/product_detail_viewmodel.dart';
import 'package:khurpi_fresh/presentation/viewmodels/cart_viewmodel.dart';
import 'package:khurpi_fresh/presentation/viewmodels/auth_viewmodel.dart';

class ProductDetailPage extends ConsumerStatefulWidget {
  final String productId;

  const ProductDetailPage({super.key, required this.productId});

  @override
  ConsumerState<ProductDetailPage> createState() => _ProductDetailPageState();
}

class _ProductDetailPageState extends ConsumerState<ProductDetailPage> {
  @override
  void initState() {
    super.initState();
    ref.read(productDetailViewModelProvider.notifier).loadProduct(widget.productId);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(productDetailViewModelProvider);
    final authState = ref.watch(authViewModelProvider);
    final product = state.product;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: AppColors.textPrimary),
      ),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : product == null
              ? const Center(child: Text('Product not found'))
              : SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Product Image
                      AspectRatio(
                        aspectRatio: 1,
                        child: CachedNetworkImage(
                          imageUrl: product.imageUrl ?? '',
                          fit: BoxFit.cover,
                          placeholder: (context, url) => Container(
                            color: AppColors.background,
                            child: const Center(child: CircularProgressIndicator()),
                          ),
                          errorWidget: (context, url, error) => Container(
                            color: AppColors.background,
                            child: const Icon(Icons.image_not_supported, size: 60),
                          ),
                        ),
                      ),

                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Name
                            Text(product.name, style: AppTextStyles.h2),
                            const SizedBox(height: 8),

                            // Stock Status
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: product.stockStatus == 'in_stock'
                                    ? AppColors.success.withValues(alpha: 0.1)
                                    : AppColors.error.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                product.stockStatus == 'in_stock' ? 'In Stock' : 'Out of Stock',
                                style: TextStyle(
                                  color: product.stockStatus == 'in_stock'
                                      ? AppColors.success
                                      : AppColors.error,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                            const SizedBox(height: 16),

                            // Price
                            Row(
                              children: [
                                Text(
                                  '₹${((authState.user?.wholesaleEnabled ?? false) && product.wholesalePrice != null ? product.wholesalePrice : product.price)?.toStringAsFixed(0) ?? "0"}',
                                  style: AppTextStyles.h2.copyWith(color: AppColors.primary),
                                ),
                                Text('/kg', style: AppTextStyles.body),
                                if ((authState.user?.wholesaleEnabled ?? false) && product.wholesalePrice != null)
                                  Padding(
                                    padding: const EdgeInsets.only(left: 12),
                                    child: Text(
                                      '₹${product.price.toStringAsFixed(0)}',
                                      style: AppTextStyles.body.copyWith(
                                        decoration: TextDecoration.lineThrough,
                                        color: AppColors.textHint,
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                            const SizedBox(height: 24),

                            // Description
                            if (product.description != null) ...[
                              const Text('Description', style: AppTextStyles.h4),
                              const SizedBox(height: 8),
                              Text(product.description!, style: AppTextStyles.body),
                              const SizedBox(height: 24),
                            ],

                            // Quantity Selector
                            const Text('Quantity', style: AppTextStyles.h4),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                IconButton(
                                  onPressed: () => ref.read(productDetailViewModelProvider.notifier).decrementQuantity(),
                                  icon: const Icon(Icons.remove_circle_outline),
                                  color: AppColors.primary,
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                                  decoration: BoxDecoration(
                                    border: Border.all(color: AppColors.border),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    '${state.quantity} ${state.selectedUnit}',
                                    style: AppTextStyles.body.copyWith(fontWeight: FontWeight.bold),
                                  ),
                                ),
                                IconButton(
                                  onPressed: () => ref.read(productDetailViewModelProvider.notifier).incrementQuantity(),
                                  icon: const Icon(Icons.add_circle_outline),
                                  color: AppColors.primary,
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
      bottomNavigationBar: product != null && product.stockStatus == 'in_stock'
          ? SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: ElevatedButton(
                  onPressed: () => _addToCart(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: Text(
                    'Add to Cart • ${state.formattedTotal}',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                ),
              ),
            )
          : null,
    );
  }

  void _addToCart() {
    final state = ref.read(productDetailViewModelProvider);
    final product = state.product;
    
    if (product != null) {
      ref.read(cartViewModelProvider.notifier).addToCart(
        product,
        quantity: state.quantity,
        unit: state.selectedUnit,
      );
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${product.name} added to cart')),
      );
      Navigator.pop(context);
    }
  }
}
