import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/core/constants/app_text_styles.dart';
import 'package:khurpi_fresh/features/cart/cart_providers.dart';
import 'package:khurpi_fresh/features/products/products_providers.dart';

/// Shows the product detail as a bottom sheet
void showProductDetailBottomSheet(BuildContext context, String productId) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) => ProductDetailBottomSheet(productId: productId),
  );
}

class ProductDetailBottomSheet extends ConsumerStatefulWidget {
  final String productId;

  const ProductDetailBottomSheet({super.key, required this.productId});

  @override
  ConsumerState<ProductDetailBottomSheet> createState() => _ProductDetailBottomSheetState();
}

class _ProductDetailBottomSheetState extends ConsumerState<ProductDetailBottomSheet> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(provideProductDetailViewModelNotifierProvider)?.loadProduct(widget.productId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(provideProductDetailViewModelProvider);
    final screenHeight = MediaQuery.of(context).size.height;

    return Container(
      constraints: BoxConstraints(maxHeight: screenHeight * 0.85),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag handle
          Container(
            margin: const EdgeInsets.only(top: 12),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: AppColors.border,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          
          // Content
          Flexible(
            child: state?.isLoading == true
                ? const SizedBox(
                    height: 300,
                    child: Center(child: CircularProgressIndicator()),
                  )
                : state?.product == null
                    ? const SizedBox(
                        height: 200,
                        child: Center(child: Text('Product not found')),
                      )
                    : SingleChildScrollView(
                        child: Padding(
                          padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Product Image
                              ClipRRect(
                                borderRadius: BorderRadius.circular(16),
                                child: AspectRatio(
                                  aspectRatio: 1.3,
                                  child: state!.product!.imageUrl != null
                                      ? CachedNetworkImage(
                                          imageUrl: state.product!.imageUrl!,
                                          fit: BoxFit.cover,
                                          placeholder: (context, url) => Container(
                                            color: AppColors.background,
                                            child: const Center(child: CircularProgressIndicator()),
                                          ),
                                          errorWidget: (context, url, error) => Container(
                                            color: AppColors.background,
                                            child: Icon(Icons.image_not_supported, size: 60, color: AppColors.textHint),
                                          ),
                                        )
                                      : Container(
                                          color: AppColors.background,
                                          child: Icon(Icons.image_not_supported, size: 60, color: AppColors.textHint),
                                        ),
                                ),
                              ),
                              const SizedBox(height: 16),
                              
                              // Name and Stock Status
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Expanded(
                                    child: Text(state.product!.name, style: AppTextStyles.h3),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                    decoration: BoxDecoration(
                                      color: _getStockColor(state.product!.stockStatus).withValues(alpha: 0.1),
                                      borderRadius: BorderRadius.circular(16),
                                    ),
                                    child: Text(
                                      _getStockText(state.product!.stockStatus),
                                      style: TextStyle(
                                        color: _getStockColor(state.product!.stockStatus),
                                        fontWeight: FontWeight.w600,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              
                              // Price
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    '₹${state.product!.price.toStringAsFixed(0)}',
                                    style: AppTextStyles.h2.copyWith(color: AppColors.primary),
                                  ),
                                  if (state.product!.hasDiscount) ...[
                                    const SizedBox(width: 8),
                                    Padding(
                                      padding: const EdgeInsets.only(bottom: 3),
                                      child: Text(
                                        '₹${state.product!.mrp!.toStringAsFixed(0)}',
                                        style: AppTextStyles.body.copyWith(
                                          color: AppColors.textHint,
                                          decoration: TextDecoration.lineThrough,
                                          decorationColor: AppColors.textHint,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Padding(
                                      padding: const EdgeInsets.only(bottom: 3),
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: AppColors.error.withValues(alpha: 0.12),
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: Text(
                                          '${state.product!.discountPercentage}% OFF',
                                          style: TextStyle(
                                            color: AppColors.error,
                                            fontSize: 11,
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ] else
                                    Text(' / ${state.product!.unit ?? '100g'}', style: AppTextStyles.body.copyWith(color: AppColors.textSecondary)),
                                ],
                              ),
                              const SizedBox(height: 16),
                              
                              // Description
                              if (state.product!.displayBenefit.isNotEmpty) ...[
                                Text('About', style: AppTextStyles.h4),
                                const SizedBox(height: 6),
                                Text(
                                  state.product!.displayBenefit,
                                  style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
                                ),
                                const SizedBox(height: 16),
                              ],
                              
                              // Quantity Selector
                              Container(
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: AppColors.background,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Row(
                                  children: [
                                    Text('Quantity', style: AppTextStyles.body),
                                    const Spacer(),
                                    Container(
                                      decoration: BoxDecoration(
                                        border: Border.all(color: AppColors.border),
                                        borderRadius: BorderRadius.circular(8),
                                        color: AppColors.surface,
                                      ),
                                      child: Row(
                                        children: [
                                          IconButton(
                                            onPressed: () => ref.read(provideProductDetailViewModelNotifierProvider)?.decrementQuantity(),
                                            icon: const Icon(Icons.remove, size: 20),
                                            color: AppColors.primary,
                                          ),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8),
                                            child: Text(
                                              '${state.quantity} ${state.selectedUnit}',
                                              style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600),
                                            ),
                                          ),
                                          IconButton(
                                            onPressed: () => ref.read(provideProductDetailViewModelNotifierProvider)?.incrementQuantity(),
                                            icon: const Icon(Icons.add, size: 20),
                                            color: AppColors.primary,
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 20),
                            ],
                          ),
                        ),
                      ),
          ),
          
          // Bottom Add to Cart Button
          if (state?.product != null)
            Container(
              padding: EdgeInsets.fromLTRB(16, 12, 16, MediaQuery.of(context).viewPadding.bottom + 12),
              decoration: BoxDecoration(
                color: AppColors.surface,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                    offset: const Offset(0, -2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  // Total Price
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('Total', style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary)),
                      Text(
                        state!.formattedTotal,
                        style: AppTextStyles.h3.copyWith(color: AppColors.primary),
                      ),
                    ],
                  ),
                  const SizedBox(width: 16),
                  // Add to Cart Button
                  Expanded(
                    child: ElevatedButton(
                      onPressed: state.product!.stockStatus.toLowerCase().trim() == 'in_stock' ||
                              state.product!.stockStatus.toLowerCase().trim() == 'in stock' ||
                              state.product!.stockStatus.toLowerCase().trim() == 'available'
                          ? () async {
                              final cartNotifier = ref.read(provideCartViewModelNotifierProvider);
                              if (cartNotifier == null) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Unable to add to cart. Please try again.')),
                                );
                                return;
                              }

                              await cartNotifier.addToCart(
                                state.product!,
                                quantity: state.quantity,
                                unit: state.selectedUnit,
                              );

                              if (!context.mounted) return;
                              Navigator.pop(context);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('${state.product!.name} added to cart')),
                              );
                            }
                          : null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        disabledBackgroundColor: AppColors.textHint,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.shopping_cart_outlined, color: Colors.white, size: 20),
                          const SizedBox(width: 8),
                          Text(
                              state.product!.stockStatus.toLowerCase().trim() == 'in_stock' ||
                                      state.product!.stockStatus.toLowerCase().trim() == 'in stock' ||
                                      state.product!.stockStatus.toLowerCase().trim() == 'available'
                                  ? 'Add to Cart'
                                  : 'Out of Stock',
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Color _getStockColor(String stockStatus) {
    switch (stockStatus.toLowerCase()) {
      case 'in_stock':
        return AppColors.success;
      case 'growing':
        return AppColors.warning;
      default:
        return AppColors.error;
    }
  }

  String _getStockText(String stockStatus) {
    switch (stockStatus.toLowerCase()) {
      case 'in_stock':
        return 'In Stock';
      case 'growing':
        return 'Growing';
      default:
        return 'Out of Stock';
    }
  }
}
