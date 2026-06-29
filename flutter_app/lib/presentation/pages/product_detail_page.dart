import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/core/constants/app_text_styles.dart';
import 'package:khurpi_fresh/presentation/providers/providers.dart';

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
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(productDetailViewModelProvider.notifier).loadProduct(widget.productId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(productDetailViewModelProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: Text(state.product?.name ?? 'Product Details'), backgroundColor: AppColors.surface, elevation: 0),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : state.product == null
              ? const Center(child: Text('Product not found'))
              : SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      AspectRatio(
                        aspectRatio: 1,
                        child: state.product!.imageUrl != null
                            ? CachedNetworkImage(
                                imageUrl: state.product!.imageUrl!,
                                fit: BoxFit.cover,
                                placeholder: (context, url) => Container(color: AppColors.background, child: const Center(child: CircularProgressIndicator())),
                                errorWidget: (context, url, error) => Container(color: AppColors.background, child: const Icon(Icons.image_not_supported, size: 80, color: AppColors.textHint)),
                              )
                            : Container(color: AppColors.background, child: const Icon(Icons.image_not_supported, size: 80, color: AppColors.textHint)),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(state.product!.name, style: AppTextStyles.h2),
                            const SizedBox(height: 8),
                            Row(children: [Text('₹${state.product!.price.toStringAsFixed(0)}', style: AppTextStyles.h3.copyWith(color: AppColors.primary)), const Text(' / 100g', style: AppTextStyles.body)]),
                            const SizedBox(height: 16),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(color: _getStockColor(state.product!.stockStatus).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(20)),
                              child: Text(state.product!.stockStatus.toUpperCase(), style: TextStyle(color: _getStockColor(state.product!.stockStatus), fontWeight: FontWeight.w600, fontSize: 12)),
                            ),
                            const SizedBox(height: 24),
                            const Text('Description', style: AppTextStyles.h4),
                            const SizedBox(height: 8),
                            Text(state.product!.benefit, style: AppTextStyles.body.copyWith(color: AppColors.textSecondary)),
                            const SizedBox(height: 24),
                            const Text('Quantity', style: AppTextStyles.h4),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                Container(
                                  decoration: BoxDecoration(border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(8)),
                                  child: Row(
                                    children: [
                                      IconButton(onPressed: () => ref.read(productDetailViewModelProvider.notifier).decrementQuantity(), icon: const Icon(Icons.remove)),
                                      Text('${state.quantity} ${state.selectedUnit}', style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600)),
                                      IconButton(onPressed: () => ref.read(productDetailViewModelProvider.notifier).incrementQuantity(), icon: const Icon(Icons.add)),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Text(state.formattedTotal, style: AppTextStyles.h4.copyWith(color: AppColors.primary)),
                              ],
                            ),
                            const SizedBox(height: 32),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: state.product!.stockStatus == 'in_stock'
                                    ? () {
                                        ref.read(cartViewModelProvider.notifier).addToCart(state.product!, quantity: state.quantity, unit: state.selectedUnit);
                                        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('${state.product!.name} added to cart')));
                                      }
                                    : null,
                                style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, padding: const EdgeInsets.symmetric(vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                                child: const Text('Add to Cart', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white)),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
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
}
