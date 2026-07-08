import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/core/constants/app_text_styles.dart';
import 'package:khurpi_fresh/data/models/product_model.dart';
import 'package:khurpi_fresh/features/cart/cart_providers.dart';

class ProductCard extends ConsumerWidget {
  final ProductModel product;
  final VoidCallback? onTap;
  final bool showWholesalePrice;

  const ProductCard({
    super.key,
    required this.product,
    this.onTap,
    this.showWholesalePrice = false,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartState = ref.watch(provideCartViewModelProvider);
    final cartNotifier = ref.read(provideCartViewModelNotifierProvider);

    final stockStatus = product.stockStatus.toLowerCase().trim();
    final isAvailable =
        stockStatus == 'in_stock' ||
        stockStatus == 'in stock' ||
        stockStatus == 'available';
    final isGrowing = stockStatus == 'growing';

    double quantityInCart = 0;
    if (cartState != null) {
      for (final item in cartState.items) {
        if (item.productId == product.productId) {
          quantityInCart = item.quantity;
          break;
        }
      }
    }

    final isInCart = quantityInCart > 0;
    final displayPrice = showWholesalePrice && product.wholesalePrice != null
        ? product.wholesalePrice!
        : product.price;
    
    // Real MRP from backend (strike-through). price = selling price.
    final mrpPrice = product.mrp ?? 0;
    final hasDiscount = product.hasDiscount && !showWholesalePrice;
    final discountPercent = product.discountPercentage;
    
    final packLabel = _buildPackLabel();

    return GestureDetector(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          // Product Image Card
          Stack(
            children: [
              Padding(
                padding: const EdgeInsets.all(4.0),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFE8E8E8)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.05),
                        blurRadius: 10,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Image
                        AspectRatio(
                          aspectRatio: 0.85,
                          child: Stack(
                            fit: StackFit.expand,
                            children: [
                              CachedNetworkImage(
                                imageUrl: product.imageUrl ?? '',
                                fit: BoxFit.cover,
                                placeholder: (_, __) => Container(
                                  color: const Color(0xFFF5F5F5),
                                  child: const Center(
                                    child: SizedBox(
                                      width: 22,
                                      height: 22,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                      ),
                                    ),
                                  ),
                                ),
                                errorWidget: (_, __, ___) => Container(
                                  color: const Color(0xFFF5F5F5),
                                  child: Icon(
                                    Icons.eco_rounded,
                                    color: AppColors.primary.withOpacity(0.28),
                                    size: 42,
                                  ),
                                ),
                              ),
                              // Discount badge (top left)
                              if (hasDiscount && discountPercent > 0)
                                Positioned(
                                  left: 8,
                                  top: 8,
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: AppColors.error,
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(
                                      '$discountPercent% OFF',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 10,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ),
                                ),
                              // Growing/Out of stock overlay
                              if (!isAvailable)
                                Positioned.fill(
                                  child: ColoredBox(
                                    color: Colors.black.withOpacity(0.32),
                                    child: Center(
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                        decoration: BoxDecoration(
                                          color: isGrowing
                                              ? const Color(0xFFFFA726)
                                              : AppColors.error,
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: Text(
                                          isGrowing ? 'GROWING' : 'OUT OF STOCK',
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 10,
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ),
                        // Weight + Add button row
                        Padding(
                          padding: const EdgeInsets.fromLTRB(10, 8, 10, 8),
                          child: Row(
                            children: [
                              Expanded(
                                child: Text(
                                  packLabel,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: AppTextStyles.caption.copyWith(
                                    color: const Color(0xFF3A3A3A),
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                              if (!isAvailable) ...[
                                const SizedBox(width: 8),
                                Container(
                                  height: 28,
                                  padding: const EdgeInsets.symmetric(horizontal: 8),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF3F3F3),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Center(
                                    child: Text(
                                      'Unavailable',
                                      style: AppTextStyles.caption.copyWith(
                                        color: AppColors.textHint,
                                        fontWeight: FontWeight.w600,
                                        fontSize: 10,
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              // Add/Quantity button (bottom right)
              if (isAvailable)
                Positioned(
                  right: 0,
                  bottom: 0,
                  child: isInCart
                      ? _buildQuantityControl(
                          quantityInCart: quantityInCart,
                          cartNotifier: cartNotifier,
                        )
                      : InkWell(
                          onTap: () async {
                            if (cartNotifier == null) return;
                            await cartNotifier.addToCart(product);
                            // No toast - silently add to cart
                          },
                          child: Container(
                            height: 32,
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            decoration: BoxDecoration(
                              color: AppColors.card,
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: AppColors.primary),
                            ),
                            child: Center(
                              child: Text(
                                'ADD',
                                style: AppTextStyles.caption.copyWith(
                                  fontSize: 12,
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                          ),
                        ),
                ),
            ],
          ),
          // Price section (left aligned)
          const SizedBox(height: 8),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '₹${displayPrice.toStringAsFixed(0)}',
                style: AppTextStyles.body.copyWith(
                  color: AppColors.primary,
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
              ),
              if (hasDiscount) ...[
                const SizedBox(width: 6),
                Padding(
                  padding: const EdgeInsets.only(bottom: 1),
                  child: Text(
                    '₹${mrpPrice.toStringAsFixed(0)}',
                    style: AppTextStyles.caption.copyWith(
                      color: AppColors.textHint,
                      fontSize: 12,
                      decoration: TextDecoration.lineThrough,
                      decorationColor: AppColors.textHint,
                    ),
                  ),
                ),
              ],
            ],
          ),
          // Product name (left aligned)
          const SizedBox(height: 4),
          Text(
            product.name,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: AppTextStyles.bodySmall.copyWith(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: const Color(0xFF1F1F1F),
              height: 1.2,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuantityControl({
    required double quantityInCart,
    required dynamic cartNotifier,
  }) {
    return Container(
      height: 32,
      width: 80,
      decoration: BoxDecoration(
        color: AppColors.primary,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        children: [
          _StepperButton(
            icon: Icons.remove_rounded,
            isLeft: true,
            onTap: () async {
              if (cartNotifier == null) return;
              await cartNotifier.decrementQuantity(product.productId);
            },
          ),
          Expanded(
            child: Center(
              child: Text(
                quantityInCart.toStringAsFixed(
                  quantityInCart == quantityInCart.toInt() ? 0 : 1,
                ),
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                  fontSize: 12,
                ),
              ),
            ),
          ),
          _StepperButton(
            icon: Icons.add_rounded,
            isLeft: false,
            onTap: () async {
              if (cartNotifier == null) return;
              await cartNotifier.incrementQuantity(product.productId);
            },
          ),
        ],
      ),
    );
  }

  String _buildPackLabel() {
    if (product.weight != null) {
      final weight = product.weight!;
      final weightText = weight == weight.toInt()
          ? weight.toInt().toString()
          : weight.toStringAsFixed(1);
      final unit = product.unit ?? 'kg';
      return '$weightText $unit';
    }

    final unit = product.unit?.trim();
    return unit != null && unit.isNotEmpty ? '1 $unit' : '1 kg';
  }
}

class _StepperButton extends StatelessWidget {
  final IconData icon;
  final bool isLeft;
  final Future<void> Function() onTap;

  const _StepperButton({
    required this.icon,
    required this.isLeft,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.all(6.0),
        child: Icon(icon, color: Colors.white, size: 16),
      ),
    );
  }
}
