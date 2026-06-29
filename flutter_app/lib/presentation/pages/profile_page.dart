import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/core/constants/app_text_styles.dart';
import 'package:khurpi_fresh/presentation/providers/providers.dart';
import 'package:khurpi_fresh/presentation/pages/login_page.dart';
import 'package:khurpi_fresh/presentation/pages/orders_page.dart';

class ProfilePage extends ConsumerStatefulWidget {
  const ProfilePage({super.key});

  @override
  ConsumerState<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends ConsumerState<ProfilePage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {});
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authViewModelProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Profile'), backgroundColor: AppColors.surface, elevation: 0, automaticallyImplyLeading: false),
      body: authState.isAuthenticated ? _buildAuthenticatedView(authState) : _buildGuestView(),
    );
  }

  Widget _buildGuestView() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.account_circle_outlined, size: 100, color: AppColors.textHint.withValues(alpha: 0.5)),
            const SizedBox(height: 24),
            const Text('Welcome to Khurpi Fresh!', style: AppTextStyles.h3, textAlign: TextAlign.center),
            const SizedBox(height: 8),
            Text('Sign in to access your orders, save addresses, and more.', style: AppTextStyles.body.copyWith(color: AppColors.textSecondary), textAlign: TextAlign.center),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const LoginPage())),
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, padding: const EdgeInsets.symmetric(vertical: 14), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                child: const Text('Sign In', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAuthenticatedView(AuthState authState) {
    final user = authState.user;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 4))]),
            child: Row(
              children: [
                CircleAvatar(radius: 35, backgroundColor: AppColors.primary.withValues(alpha: 0.1), child: Text(user?.name?.substring(0, 1).toUpperCase() ?? 'U', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: AppColors.primary))),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(user?.name ?? 'User', style: AppTextStyles.h4),
                      const SizedBox(height: 4),
                      Text(user?.phone ?? '', style: AppTextStyles.body.copyWith(color: AppColors.textSecondary)),
                    ],
                  ),
                ),
                IconButton(onPressed: _showEditProfileDialog, icon: const Icon(Icons.edit_outlined, color: AppColors.primary)),
              ],
            ),
          ),
          const SizedBox(height: 20),
          _buildMenuSection([
            _MenuItem(icon: Icons.shopping_bag_outlined, title: 'My Orders', subtitle: 'View your order history', onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const OrdersPage()))),
            _MenuItem(icon: Icons.location_on_outlined, title: 'Saved Addresses', subtitle: user?.address ?? 'Add your delivery address', onTap: _showAddressDialog),
          ]),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: _showLogoutConfirmation,
              icon: const Icon(Icons.logout, color: AppColors.error),
              label: const Text('Logout', style: TextStyle(color: AppColors.error)),
              style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14), side: const BorderSide(color: AppColors.error), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuSection(List<_MenuItem> items) {
    return Container(
      decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 4))]),
      child: Column(
        children: items.asMap().entries.map((entry) {
          final index = entry.key;
          final item = entry.value;
          return Column(
            children: [
              ListTile(
                leading: Icon(item.icon, color: AppColors.primary),
                title: Text(item.title, style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600)),
                subtitle: Text(item.subtitle, style: AppTextStyles.bodySmall, maxLines: 1, overflow: TextOverflow.ellipsis),
                trailing: const Icon(Icons.chevron_right, color: AppColors.textHint),
                onTap: item.onTap,
              ),
              if (index < items.length - 1) const Divider(height: 1, indent: 16, endIndent: 16),
            ],
          );
        }).toList(),
      ),
    );
  }

  void _showEditProfileDialog() {
    final authState = ref.read(authViewModelProvider);
    final nameController = TextEditingController(text: authState.user?.name ?? '');

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Edit Profile'),
        content: TextField(controller: nameController, decoration: const InputDecoration(labelText: 'Name', border: OutlineInputBorder())),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              ref.read(authViewModelProvider.notifier).updateProfile(name: nameController.text);
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            child: const Text('Save', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showAddressDialog() {
    final authState = ref.read(authViewModelProvider);
    final addressController = TextEditingController(text: authState.user?.address ?? '');
    final cityController = TextEditingController(text: authState.user?.city ?? '');
    final pincodeController = TextEditingController(text: authState.user?.pincode ?? '');

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Edit Address'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: addressController, decoration: const InputDecoration(labelText: 'Address', border: OutlineInputBorder()), maxLines: 2),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: TextField(controller: cityController, decoration: const InputDecoration(labelText: 'City', border: OutlineInputBorder()))),
                const SizedBox(width: 8),
                Expanded(child: TextField(controller: pincodeController, decoration: const InputDecoration(labelText: 'Pincode', border: OutlineInputBorder()), keyboardType: TextInputType.number)),
              ],
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              ref.read(authViewModelProvider.notifier).updateAddress(address: addressController.text, city: cityController.text, pincode: pincodeController.text);
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            child: const Text('Save', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showLogoutConfirmation() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ref.read(authViewModelProvider.notifier).logout();
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            child: const Text('Logout', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}

class _MenuItem {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  _MenuItem({required this.icon, required this.title, required this.subtitle, required this.onTap});
}
