import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:khurpi_fresh/features/auth/auth_providers.dart';
import 'package:khurpi_fresh/features/cart/cart_providers.dart';
import 'package:khurpi_fresh/features/home/home_providers.dart';
import 'package:khurpi_fresh/features/orders/orders_providers.dart';
import 'package:khurpi_fresh/features/address/address_list_page.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/core/constants/app_text_styles.dart';
import 'package:khurpi_fresh/core/constants/app_constants.dart';
import 'package:dio/dio.dart';

class CheckoutPage extends ConsumerStatefulWidget {
  const CheckoutPage({super.key});

  @override
  ConsumerState<CheckoutPage> createState() => _CheckoutPageState();
}

class _CheckoutPageState extends ConsumerState<CheckoutPage> {
  final _dio = Dio(BaseOptions(baseUrl: AppConstants.baseUrl));
  
  String _selectedPaymentMethod = 'cod';
  bool _isPlacingOrder = false;
  Map<String, dynamic>? _selectedAddress;
  String _deliveryTime = 'tomorrow'; // 'instant' or 'tomorrow'

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadDefaultAddress();
      _loadStoreSettings();
    });
  }

  Future<void> _loadDefaultAddress() async {
    final user = ref.read(provideAuthViewModelProvider)?.user;
    if (user == null) return;

    try {
      final response = await _dio.get('/users/${user.userId}/addresses');
      final addresses = List<Map<String, dynamic>>.from(response.data);
      if (addresses.isNotEmpty) {
        final defaultAddr = addresses.firstWhere(
          (a) => a['is_default'] == true,
          orElse: () => addresses.first,
        );
        setState(() => _selectedAddress = defaultAddr);
      }
    } catch (e) {
      debugPrint('Error loading addresses: $e');
    }
  }

  void _loadStoreSettings() async {
    await ref.read(provideStoreViewModelNotifierProvider)?.loadStoreSettings();
  }

  void _selectAddress() async {
    final result = await Navigator.push<Map<String, dynamic>>(
      context,
      MaterialPageRoute(
        builder: (_) => AddressListPage(
          isSelecting: true,
          selectedAddressId: _selectedAddress?['id'],
        ),
      ),
    );
    
    if (result != null) {
      setState(() => _selectedAddress = result);
    }
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cartState = ref.watch(provideCartViewModelProvider);
    final storeState = ref.watch(provideStoreViewModelProvider);

    if (cartState == null || cartState.items.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: const Text('Checkout')),
        body: const Center(child: Text('Your cart is empty')),
      );
    }

    final deliveryFee = _getDeliveryFee(storeState);
    final total = cartState.subtotal + deliveryFee;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Checkout'),
        backgroundColor: AppColors.surface,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Scrollable Content
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Order Items with Images
                  _buildOrderItemsSection(cartState),
                  const SizedBox(height: 20),

                  // Delivery Time Selection (Instant or Tomorrow)
                  _buildDeliveryTimeSection(),
                  const SizedBox(height: 20),

                  // Payment Method
                  _buildPaymentMethodSection(),
                  const SizedBox(height: 20),

                  // Price Summary
                  _buildPriceSummary(cartState, deliveryFee, total),
                ],
              ),
            ),
          ),

          // Bottom Fixed Section: Address + Place Order Button
          _buildBottomSection(total),
        ],
      ),
    );
  }

  Widget _buildOrderItemsSection(CartState cartState) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.shopping_bag_outlined, size: 20, color: AppColors.primary),
              const SizedBox(width: 8),
              Text('Order Items (${cartState.items.length})', style: AppTextStyles.h4),
            ],
          ),
          const SizedBox(height: 12),
          ...cartState.items.map((item) => Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Product Image
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: item.imageUrl != null && item.imageUrl!.isNotEmpty
                      ? Image.network(
                          item.imageUrl!,
                          width: 60,
                          height: 60,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => _buildImagePlaceholder(),
                        )
                      : _buildImagePlaceholder(),
                ),
                const SizedBox(width: 12),
                // Product Details + Controls
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              item.productName,
                              style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w500),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          // Remove button
                          GestureDetector(
                            onTap: () => ref.read(provideCartViewModelNotifierProvider)?.removeFromCart(item.productId),
                            child: Container(
                              padding: const EdgeInsets.all(4),
                              child: Icon(Icons.close, size: 18, color: AppColors.textHint),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '₹${item.price.toStringAsFixed(0)} per ${item.unit}',
                        style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary),
                      ),
                      const SizedBox(height: 8),
                      // Quantity controls and total
                      Row(
                        children: [
                          // Quantity controls
                          Container(
                            decoration: BoxDecoration(
                              border: Border.all(color: AppColors.border),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                GestureDetector(
                                  onTap: () => ref.read(provideCartViewModelNotifierProvider)?.decrementQuantity(item.productId),
                                  child: Container(
                                    padding: const EdgeInsets.all(6),
                                    child: Icon(Icons.remove, size: 18, color: AppColors.primary),
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12),
                                  child: Text(
                                    '${item.quantity.toStringAsFixed(item.quantity == item.quantity.toInt() ? 0 : 1)} ${item.unit}',
                                    style: AppTextStyles.bodySmall.copyWith(fontWeight: FontWeight.w600),
                                  ),
                                ),
                                GestureDetector(
                                  onTap: () => ref.read(provideCartViewModelNotifierProvider)?.incrementQuantity(item.productId),
                                  child: Container(
                                    padding: const EdgeInsets.all(6),
                                    child: Icon(Icons.add, size: 18, color: AppColors.primary),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const Spacer(),
                          // Item total
                          Text(
                            '₹${(item.price * item.quantity).toStringAsFixed(0)}',
                            style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600, color: AppColors.primary),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          )),
        ],
      ),
    );
  }

  Widget _buildImagePlaceholder() {
    return Container(
      width: 56,
      height: 56,
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Icon(Icons.eco, color: AppColors.primary.withOpacity(0.5)),
    );
  }

  Widget _buildDeliveryTimeSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.access_time, size: 20, color: AppColors.primary),
              const SizedBox(width: 8),
              const Text('Delivery Time', style: AppTextStyles.h4),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              // Instant Delivery Option
              Expanded(
                child: _buildDeliveryOption(
                  title: 'Instant',
                  subtitle: 'Within 30 mins',
                  icon: Icons.bolt,
                  isSelected: _deliveryTime == 'instant',
                  onTap: () => setState(() => _deliveryTime = 'instant'),
                ),
              ),
              const SizedBox(width: 12),
              // Tomorrow Delivery Option
              Expanded(
                child: _buildDeliveryOption(
                  title: 'Tomorrow',
                  subtitle: 'By 8:00 AM',
                  icon: Icons.wb_sunny_outlined,
                  isSelected: _deliveryTime == 'tomorrow',
                  onTap: () => setState(() => _deliveryTime = 'tomorrow'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Info Banner
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: _deliveryTime == 'instant' 
                  ? Colors.orange.withOpacity(0.1) 
                  : AppColors.success.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                Icon(
                  _deliveryTime == 'instant' ? Icons.bolt : Icons.schedule,
                  size: 18,
                  color: _deliveryTime == 'instant' ? Colors.orange.shade700 : AppColors.success,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    _deliveryTime == 'instant'
                        ? 'Your order will be delivered within 30 minutes'
                        : 'Your order will be delivered tomorrow by 8:00 AM',
                    style: TextStyle(
                      fontSize: 13,
                      color: _deliveryTime == 'instant' ? Colors.orange.shade800 : Colors.green.shade800,
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

  Widget _buildDeliveryOption({
    required String title,
    required String subtitle,
    required IconData icon,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
            width: isSelected ? 2 : 1,
          ),
          color: isSelected ? AppColors.primary.withOpacity(0.05) : Colors.transparent,
        ),
        child: Column(
          children: [
            Icon(
              icon,
              size: 28,
              color: isSelected ? AppColors.primary : AppColors.textSecondary,
            ),
            const SizedBox(height: 8),
            Text(
              title,
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: isSelected ? AppColors.primary : AppColors.textPrimary,
              ),
            ),
            Text(
              subtitle,
              style: TextStyle(
                fontSize: 12,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentMethodSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.payment, size: 20, color: AppColors.primary),
              const SizedBox(width: 8),
              const Text('Payment Method', style: AppTextStyles.h4),
            ],
          ),
          const SizedBox(height: 12),
          _buildPaymentOption(
            title: 'Cash on Delivery',
            subtitle: 'Pay when you receive',
            icon: Icons.money,
            value: 'cod',
          ),
          const Divider(height: 1),
          _buildPaymentOption(
            title: 'Online Payment',
            subtitle: 'UPI / Card / Net Banking',
            icon: Icons.credit_card,
            value: 'online',
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentOption({
    required String title,
    required String subtitle,
    required IconData icon,
    required String value,
  }) {
    final isSelected = _selectedPaymentMethod == value;
    return InkWell(
      onTap: () => setState(() => _selectedPaymentMethod = value),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Row(
          children: [
            Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected ? AppColors.primary : AppColors.textHint,
                  width: 2,
                ),
              ),
              child: isSelected
                  ? Center(
                      child: Container(
                        width: 12,
                        height: 12,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppColors.primary,
                        ),
                      ),
                    )
                  : null,
            ),
            const SizedBox(width: 12),
            Icon(icon, color: AppColors.textSecondary, size: 22),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: AppTextStyles.body),
                  Text(
                    subtitle,
                    style: AppTextStyles.caption.copyWith(color: AppColors.textHint),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPriceSummary(CartState cartState, double deliveryFee, double total) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          _buildSummaryRow('Subtotal', '₹${cartState.subtotal.toStringAsFixed(0)}'),
          _buildSummaryRow(
            'Delivery${_deliveryTime == 'instant' ? ' (Instant)' : ''}',
            deliveryFee > 0 ? '₹${deliveryFee.toStringAsFixed(0)}' : 'FREE',
            isHighlight: deliveryFee == 0,
          ),
          const Divider(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Total', style: AppTextStyles.h4),
              Text(
                '₹${total.toStringAsFixed(0)}',
                style: AppTextStyles.h3.copyWith(color: AppColors.primary),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value, {bool isHighlight = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: AppTextStyles.body.copyWith(color: AppColors.textSecondary)),
          Text(
            value,
            style: AppTextStyles.body.copyWith(
              color: isHighlight ? AppColors.success : null,
              fontWeight: isHighlight ? FontWeight.w600 : null,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomSection(double total) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 16,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Selected Address Display
            GestureDetector(
              onTap: _selectAddress,
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.background,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(Icons.location_on, size: 20, color: AppColors.primary),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _selectedAddress != null
                          ? Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Deliver to: ${_selectedAddress!['name'] ?? 'Home'}',
                                  style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600),
                                ),
                                Text(
                                  _formatAddressShort(_selectedAddress!),
                                  style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            )
                          : Text(
                              'Select delivery address',
                              style: AppTextStyles.body.copyWith(color: AppColors.textHint),
                            ),
                    ),
                    Icon(Icons.chevron_right, color: AppColors.textHint),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),
            
            // Place Order Button
            SizedBox(
              width: double.infinity,
              height: 54,
              child: ElevatedButton(
                onPressed: _isPlacingOrder ? null : _placeOrder,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  elevation: 0,
                ),
                child: _isPlacingOrder
                    ? const SizedBox(
                        height: 22,
                        width: 22,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.5,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Text(
                            'Place Order',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            '• ₹${total.toStringAsFixed(0)}',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: Colors.white.withOpacity(0.9),
                            ),
                          ),
                        ],
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatAddressShort(Map<String, dynamic> address) {
    final parts = <String>[];
    if (address['address_line_1'] != null) parts.add(address['address_line_1'].toString());
    if (address['city'] != null) parts.add(address['city'].toString());
    if (address['pincode'] != null) parts.add(address['pincode'].toString());
    return parts.join(', ');
  }

  double _getDeliveryFee(StoreState? storeState) {
    if (storeState?.settings == null) return 0;
    final cartState = ref.read(provideCartViewModelProvider);
    final subtotal = cartState?.subtotal ?? 0;
    
    // Free delivery above threshold
    if (subtotal >= storeState!.settings!.minOrderForFreeDelivery) {
      return 0;
    }
    
    // Instant delivery has extra fee
    if (_deliveryTime == 'instant') {
      return storeState.settings!.instantDeliveryFee;
    }
    
    return storeState.settings!.defaultDeliveryFee;
  }

  Future<void> _placeOrder() async {
    if (_selectedAddress == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a delivery address')),
      );
      return;
    }

    setState(() => _isPlacingOrder = true);

    try {
      final cartState = ref.read(provideCartViewModelProvider);
      
      // Prepare delivery date for tomorrow option
      String? deliveryDate;
      if (_deliveryTime == 'tomorrow') {
        final tomorrow = DateTime.now().add(const Duration(days: 1));
        deliveryDate = DateFormat('yyyy-MM-dd').format(tomorrow);
      }
      
      final order = await ref.read(provideOrdersViewModelNotifierProvider)!.createOrder(
        items: cartState?.items ?? [],
        deliveryAddress: _selectedAddress!['address_line'] ?? _formatAddressShort(_selectedAddress!),
        city: _selectedAddress!['city'] ?? '',
        pincode: _selectedAddress!['pincode'] ?? '',
        phone: _selectedAddress!['phone'] ?? '',
        paymentMethod: _selectedPaymentMethod,
        notes: null,
        deliveryType: _deliveryTime,
        deliveryDate: deliveryDate,
        deliverySlotId: null,
      );

      if (order != null) {
        await ref.read(provideCartViewModelNotifierProvider)?.clearCart();
        
        if (mounted) {
          // If online payment, redirect to payment page
          if (_selectedPaymentMethod == 'online') {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Redirecting to payment...')),
            );
            // TODO: Navigate to payment page
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: const Text('Order placed successfully!'),
                backgroundColor: AppColors.success,
              ),
            );
          }
          Navigator.popUntil(context, (route) => route.isFirst);
        }
      } else {
        throw Exception('Failed to place order');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isPlacingOrder = false);
    }
  }
}
