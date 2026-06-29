import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/presentation/providers/providers.dart';
import 'package:khurpi_fresh/presentation/pages/home_page.dart';
import 'package:khurpi_fresh/presentation/pages/categories_page.dart';
import 'package:khurpi_fresh/presentation/pages/cart_page.dart';
import 'package:khurpi_fresh/presentation/pages/profile_page.dart';

class MainNavigationPage extends ConsumerStatefulWidget {
  const MainNavigationPage({super.key});

  @override
  ConsumerState<MainNavigationPage> createState() => _MainNavigationPageState();
}

class _MainNavigationPageState extends ConsumerState<MainNavigationPage> {
  int _currentIndex = 0;

  final List<Widget> _pages = const [HomePage(), CategoriesPage(), CartPage(), ProfilePage()];

  @override
  Widget build(BuildContext context) {
    final cartState = ref.watch(cartViewModelProvider);
    final authState = ref.watch(authViewModelProvider);
    final userAddress = authState.user?.address ?? 'Set your delivery address';

    return Scaffold(
      body: Column(
        children: [
          // Address Bar at top
          Container(
            color: AppColors.primary,
            child: SafeArea(
              bottom: false,
              child: InkWell(
                onTap: () => _showAddressBottomSheet(context),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Row(
                    children: [
                      const Icon(Icons.location_on, color: Colors.white, size: 20),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Deliver to', style: TextStyle(color: Colors.white70, fontSize: 12)),
                            Text(userAddress, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14), maxLines: 1, overflow: TextOverflow.ellipsis),
                          ],
                        ),
                      ),
                      const Icon(Icons.keyboard_arrow_down, color: Colors.white),
                    ],
                  ),
                ),
              ),
            ),
          ),
          Expanded(child: IndexedStack(index: _currentIndex, children: _pages)),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 10, offset: const Offset(0, -5))]),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) => setState(() => _currentIndex = index),
          type: BottomNavigationBarType.fixed,
          backgroundColor: AppColors.surface,
          selectedItemColor: AppColors.primary,
          unselectedItemColor: AppColors.textHint,
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12),
          unselectedLabelStyle: const TextStyle(fontSize: 12),
          items: [
            const BottomNavigationBarItem(icon: Icon(Icons.home_outlined), activeIcon: Icon(Icons.home), label: 'Home'),
            const BottomNavigationBarItem(icon: Icon(Icons.category_outlined), activeIcon: Icon(Icons.category), label: 'Categories'),
            BottomNavigationBarItem(
              icon: Stack(
                clipBehavior: Clip.none,
                children: [
                  const Icon(Icons.shopping_cart_outlined),
                  if (cartState.items.isNotEmpty)
                    Positioned(
                      right: -6,
                      top: -6,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(color: AppColors.error, shape: BoxShape.circle),
                        constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                        child: Text('${cartState.items.length}', style: const TextStyle(color: Colors.white, fontSize: 10), textAlign: TextAlign.center),
                      ),
                    ),
                ],
              ),
              activeIcon: Stack(
                clipBehavior: Clip.none,
                children: [
                  const Icon(Icons.shopping_cart),
                  if (cartState.items.isNotEmpty)
                    Positioned(
                      right: -6,
                      top: -6,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(color: AppColors.error, shape: BoxShape.circle),
                        constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                        child: Text('${cartState.items.length}', style: const TextStyle(color: Colors.white, fontSize: 10), textAlign: TextAlign.center),
                      ),
                    ),
                ],
              ),
              label: 'Cart',
            ),
            const BottomNavigationBarItem(icon: Icon(Icons.person_outline), activeIcon: Icon(Icons.person), label: 'Profile'),
          ],
        ),
      ),
    );
  }

  void _showAddressBottomSheet(BuildContext context) {
    final authState = ref.read(authViewModelProvider);
    final addressController = TextEditingController(text: authState.user?.address ?? '');
    final cityController = TextEditingController(text: authState.user?.city ?? '');
    final pincodeController = TextEditingController(text: authState.user?.pincode ?? '');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom, left: 16, right: 16, top: 16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Delivery Address', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            TextField(controller: addressController, decoration: const InputDecoration(labelText: 'Address', border: OutlineInputBorder()), maxLines: 2),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: TextField(controller: cityController, decoration: const InputDecoration(labelText: 'City', border: OutlineInputBorder()))),
                const SizedBox(width: 12),
                Expanded(child: TextField(controller: pincodeController, decoration: const InputDecoration(labelText: 'Pincode', border: OutlineInputBorder()), keyboardType: TextInputType.number)),
              ],
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  ref.read(authViewModelProvider.notifier).updateAddress(address: addressController.text, city: cityController.text, pincode: pincodeController.text);
                  Navigator.pop(context);
                },
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, padding: const EdgeInsets.symmetric(vertical: 14)),
                child: const Text('Save Address', style: TextStyle(color: Colors.white)),
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}
