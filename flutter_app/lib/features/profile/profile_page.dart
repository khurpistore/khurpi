import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/core/constants/app_text_styles.dart';
import 'package:khurpi_fresh/features/auth/auth_providers.dart';
import 'package:khurpi_fresh/features/auth/otp_login_page.dart';
import 'package:khurpi_fresh/features/address/address_form_page.dart';
import 'package:khurpi_fresh/features/earn/earn_page.dart';
import 'package:khurpi_fresh/features/orders/orders_page.dart';


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
    final authState = ref.watch(provideAuthViewModelProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: authState?.isAuthenticated == true ? _buildAuthenticatedView(authState!) : _buildGuestView(),
    );
  }

  Widget _buildGuestView() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          const SizedBox(height: 24),
          Icon(Icons.account_circle_outlined, size: 100, color: AppColors.textHint.withValues(alpha: 0.5)),
          const SizedBox(height: 24),
          const Text('Welcome to Khurpi Fresh!', style: AppTextStyles.h3, textAlign: TextAlign.center),
          const SizedBox(height: 8),
          Text('Sign in to access your orders, save addresses, and more.', style: AppTextStyles.body.copyWith(color: AppColors.textSecondary), textAlign: TextAlign.center),
          const SizedBox(height: 24),
          _buildMenuSection([
            _MenuItem(
              icon: Icons.login,
              title: 'Login with Phone',
              subtitle: 'Quick OTP login',
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const OTPLoginPage())),
            ),
            _MenuItem(
              icon: Icons.stars_rounded,
              title: 'Earn & Spin',
              subtitle: 'Win free veggies and rewards',
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const EarnPage())),
            ),
          ]),
        ],
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
            _MenuItem(
              icon: Icons.location_on_outlined,
              title: 'Saved Addresses',
              subtitle: user?.formattedAddress ?? user?.addressLine1 ?? user?.address ?? 'Add your delivery address',
              onTap: _showAddressDialog,
            ),
            _MenuItem(icon: Icons.stars_rounded, title: 'Earn & Spin', subtitle: 'Play spin game to win freebies', onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const EarnPage()))),
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
    final authState = ref.read(provideAuthViewModelProvider);
    final nameController = TextEditingController(text: authState?.user?.name ?? '');

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Edit Profile'),
        content: TextField(controller: nameController, decoration: const InputDecoration(labelText: 'Name', border: OutlineInputBorder())),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              ref.read(provideAuthViewModelNotifierProvider)?.updateProfile(name: nameController.text);
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
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const AddressFormPage()),
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
              ref.read(provideAuthViewModelNotifierProvider)?.logout();
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
