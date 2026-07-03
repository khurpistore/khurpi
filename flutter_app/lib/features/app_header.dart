import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/features/auth/auth_providers.dart';
import 'package:khurpi_fresh/features/cart/cart_providers.dart';

class AppHeader extends ConsumerWidget {
  final VoidCallback? onSearchTap;
  final VoidCallback? onAddressTap;
  final VoidCallback? onAccountTap;
  final VoidCallback? onCartTap;

  const AppHeader({
    super.key,
    this.onSearchTap,
    this.onAddressTap,
    this.onAccountTap,
    this.onCartTap,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(provideAuthViewModelProvider);
    final cartState = ref.watch(provideCartViewModelProvider);
    final user = authState?.user;
    final userAddress =
        user?.formattedAddress ?? user?.addressLine1 ?? user?.address ?? 'Set delivery location';
    final userName = user?.name ?? 'Guest';
    final isLoggedIn = user != null;
    final cartItemCount = cartState?.items.length ?? 0;

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.primary, AppColors.primaryDark],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.3),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: SafeArea(
        bottom: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Row 1: Location + Cart + Account
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 8, 8),
              child: Row(
                children: [
                  // Delivery Location
                  Expanded(
                    child: GestureDetector(
                      onTap: onAddressTap,
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Icon(Icons.location_on, color: Colors.white, size: 18),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    const Text('Deliver to', style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w500)),
                                    const SizedBox(width: 4),
                                    const Icon(Icons.keyboard_arrow_down, color: Colors.white70, size: 16),
                                  ],
                                ),
                                const SizedBox(height: 2),
                                Text(userAddress, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13), maxLines: 1, overflow: TextOverflow.ellipsis),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  if (cartItemCount > 0)
                    // Cart icon is hidden until at least one item exists in cart.
                    GestureDetector(
                      onTap: onCartTap,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 8),
                        child: Stack(
                          clipBehavior: Clip.none,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Icon(Icons.shopping_cart_outlined, color: Colors.white, size: 22),
                            ),
                            Positioned(
                              top: -5,
                              right: -5,
                              child: Container(
                                padding: const EdgeInsets.all(4),
                                decoration: const BoxDecoration(
                                  color: AppColors.secondary,
                                  shape: BoxShape.circle,
                                ),
                                constraints: const BoxConstraints(minWidth: 18, minHeight: 18),
                                child: Text(
                                  '$cartItemCount',
                                  style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                                  textAlign: TextAlign.center,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                  // Account Button
                  GestureDetector(
                    onTap: onAccountTap,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          CircleAvatar(
                            radius: 14,
                            backgroundColor: Colors.white,
                            child: Icon(isLoggedIn ? Icons.person : Icons.person_outline, color: AppColors.primary, size: 18),
                          ),
                          const SizedBox(width: 6),
                          Text(isLoggedIn ? userName.split(' ').first : 'Profile', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            // Row 2: Search Bar
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
              child: GestureDetector(
                onTap: onSearchTap,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 2))],
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.search, color: AppColors.textSecondary, size: 22),
                      const SizedBox(width: 12),
                      Text('Search vegetables, fruits...', style: TextStyle(color: AppColors.textHint, fontSize: 14)),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(6)),
                        child: Icon(Icons.mic, color: AppColors.primary, size: 18),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
