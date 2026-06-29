import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/core/constants/app_text_styles.dart';
import 'package:khurpi_fresh/presentation/providers/providers.dart';
import 'package:khurpi_fresh/presentation/widgets/cart_item_card.dart';
import 'package:khurpi_fresh/presentation/pages/checkout_page.dart';

class CartPage extends ConsumerWidget {
  const CartPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartState = ref.watch(cartViewModelProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('My Cart'),
        backgroundColor: AppColors.surface,
        elevation: 0,
        automaticallyImplyLeading: false,
        actions: [
          if (cartState.items.isNotEmpty)
            TextButton(
              onPressed: () => ref.read(cartViewModelProvider.notifier).clearCart(),
              child: const Text('Clear All', style: TextStyle(color: AppColors.error)),
            ),
        ],
      ),
      body: cartState.items.isEmpty
          ? _buildEmptyCart()
          : Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: cartState.items.length,
                    itemBuilder: (context, index) {
                      final item = cartState.items[index];
                      return CartItemCard(
                        item: item,
                        onIncrement: () => ref.read(cartViewModelProvider.notifier).incrementQuantity(item.productId),
                        onDecrement: () => ref.read(cartViewModelProvider.notifier).decrementQuantity(item.productId),
                        onRemove: () => ref.read(cartViewModelProvider.notifier).removeFromCart(item.productId),
                      );
                    },
                  ),
                ),
                _buildCartSummary(context, cartState),
              ],
            ),
    );
  }

  Widget _buildEmptyCart() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.shopping_cart_outlined, size: 80, color: AppColors.textHint.withValues(alpha: 0.5)),
          const SizedBox(height: 16),
          const Text('Your cart is empty', style: AppTextStyles.h4),
          const SizedBox(height: 8),
          Text('Add some fresh products to your cart', style: AppTextStyles.body.copyWith(color: AppColors.textHint)),
        ],
      ),
    );
  }

  Widget _buildCartSummary(BuildContext context, CartState cartState) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, -5))],
      ),
      child: SafeArea(
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [const Text('Subtotal', style: AppTextStyles.body), Text(cartState.formattedSubtotal, style: AppTextStyles.body)],
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [const Text('Delivery Fee', style: AppTextStyles.body), Text(cartState.formattedDeliveryFee, style: AppTextStyles.body)],
            ),
            const Divider(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [const Text('Total', style: AppTextStyles.h4), Text(cartState.formattedTotal, style: AppTextStyles.h4.copyWith(color: AppColors.primary))],
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CheckoutPage())),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('Proceed to Checkout', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
