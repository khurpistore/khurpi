import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:khurpi_fresh/features/home/home_page.dart';
import 'package:khurpi_fresh/features/cart/cart_page.dart';
import 'package:khurpi_fresh/features/address/address_list_page.dart';
import 'package:khurpi_fresh/features/search/search_page.dart';
import 'package:khurpi_fresh/features/profile/profile_page.dart';
import 'package:khurpi_fresh/widgets/floating_cart_button.dart';

import 'app_header.dart';

class MainNavigationPage extends ConsumerStatefulWidget {
  const MainNavigationPage({super.key});

  @override
  ConsumerState<MainNavigationPage> createState() => _MainNavigationPageState();
}

class _MainNavigationPageState extends ConsumerState<MainNavigationPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          // App Header with Location + Search (cart removed from header)
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

                // Reusable Floating Cart Button - visible when cart has items
                const FloatingCartButton(bottomPadding: 24),
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

  void _showAddressList() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const AddressListPage()),
    );
  }
}
