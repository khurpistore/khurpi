import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/features/home/home_page.dart';
import 'package:khurpi_fresh/features/cart/cart_page.dart';
import 'package:khurpi_fresh/features/address/address_form_page.dart';
import 'package:khurpi_fresh/features/products/products_page.dart';
import 'package:khurpi_fresh/features/profile/profile_page.dart';
import 'package:khurpi_fresh/features/cart/cart_providers.dart';

import 'app_header.dart';

class MainNavigationPage extends ConsumerStatefulWidget {
  const MainNavigationPage({super.key});

  @override
  ConsumerState<MainNavigationPage> createState() => _MainNavigationPageState();
}

class _MainNavigationPageState extends ConsumerState<MainNavigationPage> {
  @override
  Widget build(BuildContext context) {
    final cartState = ref.watch(provideCartViewModelProvider);
    final itemCount = cartState?.items.length ?? 0;
    final total = cartState?.formattedTotal ?? '₹0';

    return Scaffold(
      body: Column(
        children: [
          // App Header with Location + Search
          AppHeader(
            onSearchTap: _navigateToSearch,
            onAddressTap: _showAddressBottomSheet,
            onAccountTap: _handleAccountTap,
            onCartTap: _openCart,
          ),

          // Page Content
          Expanded(
            child: Stack(
              children: [
                const HomePage(),

                // Floating Cart Bar — visible on all pages when cart has items
                if (itemCount > 0)
                  Positioned(
                    bottom: 12,
                    left: 16,
                    right: 16,
                    child: GestureDetector(
                      onTap: _openCart,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primary.withValues(alpha: 0.45),
                              blurRadius: 14,
                              offset: const Offset(0, 5),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                '$itemCount item${itemCount > 1 ? 's' : ''}',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w600,
                                  fontSize: 13,
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            const Expanded(
                              child: Text(
                                'View Cart',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w700,
                                  fontSize: 15,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ),
                            Text(
                              total,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w700,
                                fontSize: 15,
                              ),
                            ),
                            const SizedBox(width: 4),
                            const Icon(Icons.arrow_forward_ios, color: Colors.white, size: 14),
                          ],
                        ),
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

  void _openCart() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const CartPage()),
    );
  }

  void _navigateToSearch() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const ProductsPage()),
    );
  }

  void _handleAccountTap() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const ProfilePage()),
    );
  }

  void _showAddressBottomSheet() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const AddressFormPage()),
    );
  }
}
