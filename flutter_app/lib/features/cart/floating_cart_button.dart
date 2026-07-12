import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/features/cart/cart_providers.dart';
import 'package:khurpi_fresh/features/checkout/checkout_page.dart';

class FloatingCartButton extends ConsumerWidget {
  const FloatingCartButton({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartState = ref.watch(provideCartViewModelProvider);
    
    if (cartState == null) return const SizedBox.shrink();
    
    final items = cartState.items;
    final itemCount = items.length;
    final subtotal = cartState.subtotal;
    
    if (itemCount == 0) return const SizedBox.shrink();

    // Calculate safe bottom padding
    final mediaQuery = MediaQuery.of(context);
    final safeBottomPadding = mediaQuery.viewPadding.bottom + 16;

    // Get first 5 items for display
    final displayItems = items.take(5).toList();
    // Width of the overlapping image stack scales with the number of products
    final stackWidth = displayItems.isEmpty
        ? 0.0
        : (displayItems.length - 1) * 14.0 + 40 + (itemCount > 5 ? 16.0 : 0.0);

    return Container(
      padding: EdgeInsets.fromLTRB(16, 0, 16, safeBottomPadding),
      child: GestureDetector(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const CheckoutPage()),
          );
        },
        child: Center(
        child: Container(
          height: 68,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [AppColors.primary, AppColors.primaryDark],
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
            ),
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withOpacity(0.4),
                blurRadius: 16,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Product images stack
                SizedBox(
                  width: stackWidth,
                  height: 44,
                  child: Stack(
                    children: [
                      for (int i = 0; i < displayItems.length && i < 5; i++)
                        Positioned(
                          left: i * 14.0,
                          child: Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: Colors.white,
                                width: 2,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.1),
                                  blurRadius: 4,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: ClipOval(
                              child: displayItems[i].imageUrl != null && 
                                     displayItems[i].imageUrl!.isNotEmpty
                                  ? CachedNetworkImage(
                                      imageUrl: displayItems[i].imageUrl!,
                                      fit: BoxFit.cover,
                                      placeholder: (_, __) => Container(
                                        color: const Color(0xFFF5F5F5),
                                        child: Icon(
                                          Icons.eco,
                                          color: AppColors.primary.withOpacity(0.3),
                                          size: 18,
                                        ),
                                      ),
                                      errorWidget: (_, __, ___) => Container(
                                        color: const Color(0xFFF5F5F5),
                                        child: Icon(
                                          Icons.eco,
                                          color: AppColors.primary.withOpacity(0.3),
                                          size: 18,
                                        ),
                                      ),
                                    )
                                  : Container(
                                      color: const Color(0xFFF5F5F5),
                                      child: Icon(
                                        Icons.eco,
                                        color: AppColors.primary.withOpacity(0.3),
                                        size: 18,
                                      ),
                                    ),
                            ),
                          ),
                        ),
                      // Show +N badge if more items
                      if (itemCount > 5)
                        Positioned(
                          right: 0,
                          bottom: 0,
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: const BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                            ),
                            child: Text(
                              '+${itemCount - 5}',
                              style: TextStyle(
                                color: AppColors.primary,
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                
                // Item count and total
                Padding(
                  padding: const EdgeInsets.only(right: 16),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '$itemCount ${itemCount == 1 ? 'item' : 'items'}',
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '₹${subtotal.toStringAsFixed(0)}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                
                // Checkout button
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Cart',
                        style: TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w700,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Icon(
                        Icons.arrow_forward_rounded,
                        color: AppColors.primary,
                        size: 18,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        ),
      ),
    );
  }
}
