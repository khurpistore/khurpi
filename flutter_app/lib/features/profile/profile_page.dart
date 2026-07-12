import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/core/constants/app_text_styles.dart';
import 'package:khurpi_fresh/core/constants/app_constants.dart';
import 'package:khurpi_fresh/features/auth/auth_providers.dart';
import 'package:khurpi_fresh/features/auth/otp_login_page.dart';
import 'package:khurpi_fresh/features/orders/orders_page.dart';
import 'package:khurpi_fresh/features/cart/cart_providers.dart';
import 'package:khurpi_fresh/features/address/address_providers.dart';
import 'package:khurpi_fresh/features/cart/floating_cart_button.dart';
import 'package:url_launcher/url_launcher.dart';

class ProfilePage extends ConsumerStatefulWidget {
  const ProfilePage({super.key});

  @override
  ConsumerState<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends ConsumerState<ProfilePage> {
  String? _supportPhone;
  String? _supportWhatsapp;
  String? _supportEmail;
  final _dio = Dio(BaseOptions(baseUrl: AppConstants.baseUrl));

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadSupportPhone();
    });
  }

  Future<void> _loadSupportPhone() async {
    try {
      final response = await _dio.get('/store/settings');
      if (response.data != null) {
        setState(() {
          _supportPhone = response.data['support_phone'] ?? response.data['phone'];
          _supportWhatsapp = response.data['support_whatsapp'];
          _supportEmail = response.data['support_email'] ?? response.data['email'];
        });
      }
    } catch (e) {
      debugPrint('Error loading support phone: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(provideAuthViewModelProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Profile'),
        backgroundColor: AppColors.surface,
        elevation: 0,
      ),
      body: Stack(
        fit: StackFit.expand,
        children: [
          authState?.isAuthenticated == true 
              ? _buildAuthenticatedView(authState!) 
              : _buildGuestView(),
          const Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: FloatingCartButton(),
          ),
        ],
      ),
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
          Text('Welcome to Khurpi Fresh!', style: AppTextStyles.h3, textAlign: TextAlign.center),
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
              icon: Icons.help_outline_rounded,
              title: 'Get Help',
              subtitle: 'Contact support for assistance',
              onTap: _showHelpDialog,
            ),
          ]),
        ],
      ),
    );
  }

  Widget _buildAuthenticatedView(AuthState authState) {
    final user = authState.user;

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      child: Column(
        children: [
          // Profile Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              children: [
                // Profile avatar (initial letter)
                CircleAvatar(
                  radius: 35,
                  backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                  child: Text(
                    user?.name?.substring(0, 1).toUpperCase() ?? 'U',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(user?.name ?? 'User', style: AppTextStyles.h4),
                      const SizedBox(height: 4),
                      Text(
                        user?.phone ?? '',
                        style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: _showEditProfileDialog,
                  icon: Icon(Icons.edit_outlined, color: AppColors.primary),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          
          // Menu Section
          _buildMenuSection([
            _MenuItem(
              icon: Icons.shopping_bag_outlined,
              title: 'My Orders',
              subtitle: 'View your order history',
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const OrdersPage())),
            ),
            _MenuItem(
              icon: Icons.help_outline_rounded,
              title: 'Get Help',
              subtitle: 'Contact support for assistance',
              onTap: _showHelpDialog,
            ),
          ]),
          const SizedBox(height: 16),
          
          // Logout Button
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: _showLogoutConfirmation,
              icon: Icon(Icons.logout, color: AppColors.error),
              label: Text('Logout', style: TextStyle(color: AppColors.error)),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
                side: BorderSide(color: AppColors.error),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuSection(List<_MenuItem> items) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
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
                trailing: Icon(Icons.chevron_right, color: AppColors.textHint),
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
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameController,
              decoration: const InputDecoration(
                labelText: 'Name',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
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

  void _showHelpDialog() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.support_agent_rounded,
                size: 40,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'Need Help?',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w700,
                color: Color(0xFF1A1A2E),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Our support team is here to assist you',
              style: TextStyle(
                fontSize: 15,
                color: Colors.grey.shade600,
              ),
            ),
            const SizedBox(height: 24),
            if ((_supportPhone != null && _supportPhone!.isNotEmpty) ||
                (_supportWhatsapp != null && _supportWhatsapp!.isNotEmpty) ||
                (_supportEmail != null && _supportEmail!.isNotEmpty)) ...[
              if (_supportPhone != null && _supportPhone!.isNotEmpty)
                _buildContactTile(
                  icon: Icons.phone_rounded,
                  color: AppColors.primary,
                  label: 'Call Us',
                  value: _supportPhone!,
                  actionIcon: Icons.call,
                  onTap: () async {
                    final u = Uri.parse('tel:$_supportPhone');
                    if (await canLaunchUrl(u)) await launchUrl(u);
                  },
                ),
              if (_supportWhatsapp != null && _supportWhatsapp!.isNotEmpty)
                _buildContactTile(
                  icon: Icons.chat_rounded,
                  color: const Color(0xFF25D366),
                  label: 'WhatsApp',
                  value: _supportWhatsapp!,
                  actionIcon: Icons.send_rounded,
                  onTap: () async {
                    final digits = _supportWhatsapp!.replaceAll(RegExp(r'[^0-9]'), '');
                    final u = Uri.parse('https://wa.me/$digits');
                    if (await canLaunchUrl(u)) await launchUrl(u, mode: LaunchMode.externalApplication);
                  },
                ),
              if (_supportEmail != null && _supportEmail!.isNotEmpty)
                _buildContactTile(
                  icon: Icons.email_rounded,
                  color: Colors.orange.shade700,
                  label: 'Email',
                  value: _supportEmail!,
                  actionIcon: Icons.arrow_forward_rounded,
                  onTap: () async {
                    final u = Uri.parse('mailto:$_supportEmail');
                    if (await canLaunchUrl(u)) await launchUrl(u);
                  },
                ),
            ] else ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8F9FA),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.info_outline, color: Colors.grey.shade500),
                    const SizedBox(width: 8),
                    Text(
                      'Support contact not available',
                      style: TextStyle(color: Colors.grey.shade600),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildContactTile({
    required IconData icon,
    required Color color,
    required String label,
    required String value,
    required IconData actionIcon,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF8F9FA),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE8E8E8)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: color.withOpacity(0.12), shape: BoxShape.circle),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
                const SizedBox(height: 2),
                Text(value, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Color(0xFF1A1A2E))),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: onTap,
            style: ElevatedButton.styleFrom(backgroundColor: color, shape: const CircleBorder(), padding: const EdgeInsets.all(11)),
            child: Icon(actionIcon, color: Colors.white, size: 18),
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
            onPressed: () async {
              Navigator.pop(context);
              // Wipe in-memory cart + cached address (prefs are cleared by logout below)
              await ref.read(provideCartViewModelNotifierProvider)?.clearCart();
              ref.read(addressNotifierProvider.notifier).clear();
              await ref.read(provideAuthViewModelNotifierProvider)?.logout();
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
