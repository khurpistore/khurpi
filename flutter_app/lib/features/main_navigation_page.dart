import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:khurpi_fresh/features/address/address_list_page.dart';
import 'package:khurpi_fresh/features/address/address_providers.dart';
import 'package:khurpi_fresh/features/auth/auth_providers.dart';
import 'package:khurpi_fresh/features/home/home_page.dart';
import 'package:khurpi_fresh/features/cart/cart_page.dart';
import 'package:khurpi_fresh/features/search/search_page.dart';
import 'package:khurpi_fresh/features/profile/profile_page.dart';
import 'package:khurpi_fresh/features/cart/floating_cart_button.dart';

import 'app_header.dart';

class MainNavigationPage extends ConsumerStatefulWidget {
  const MainNavigationPage({super.key});

  @override
  ConsumerState<MainNavigationPage> createState() => _MainNavigationPageState();
}

class _MainNavigationPageState extends ConsumerState<MainNavigationPage> {
  @override
  void initState() {
    super.initState();
    // Fetch the selected/default delivery address from the address API on load.
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadSelectedAddress());
  }

  void _loadSelectedAddress() {
    final user = ref.read(provideAuthViewModelProvider)?.user;
    if (user != null && user.userId.isNotEmpty) {
      ref.read(addressNotifierProvider.notifier).loadDefaultAddress(user.userId);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          // App Header with Location + Search (Cart removed from header)
          AppHeader(
            onSearchTap: _navigateToSearch,
            onAddressTap: _showAddressList,
            onAccountTap: _handleAccountTap,
          ),

          // Page Content
          Expanded(
            child: Stack(
              children: [
                const HomePage(),

                // Reusable Floating Cart Button - visible on every page when cart has items
                // Uses SafeArea to avoid overlapping device navigation buttons
                const Positioned(
                  left: 0,
                  right: 0,
                  bottom: 0,
                  child: FloatingCartButton(),
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
      MaterialPageRoute(builder: (_) => const SearchPage()),
    );
  }

  void _handleAccountTap() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const ProfilePage()),
    );
  }

  Future<void> _showAddressList() async {
    final selectedAddress = await Navigator.push<Map<String, dynamic>>(
      context,
      MaterialPageRoute(
        builder: (_) => const AddressListPage(isSelecting: true),
      ),
    );

    if (!mounted || selectedAddress == null) return;
    ref.read(addressNotifierProvider.notifier).setSelectedAddress(selectedAddress);
  }
}
