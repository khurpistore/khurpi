import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:khurpi_fresh/features/auth/auth_providers.dart';
import 'package:khurpi_fresh/features/cart/cart_providers.dart';
import 'package:khurpi_fresh/features/home/home_providers.dart';
import 'package:khurpi_fresh/features/orders/orders_providers.dart';
import 'package:khurpi_fresh/features/orders/order_success_page.dart';
import 'package:khurpi_fresh/features/address/address_list_page.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/core/constants/app_text_styles.dart';
import 'package:khurpi_fresh/core/constants/app_constants.dart';
import 'package:khurpi_fresh/core/network/dio_client.dart';
import 'package:khurpi_fresh/data/models/user_model.dart';
import 'package:khurpi_fresh/data/services/razorpay_service.dart';
import 'package:dio/dio.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';

class CheckoutPage extends ConsumerStatefulWidget {
  const CheckoutPage({super.key});

  @override
  ConsumerState<CheckoutPage> createState() => _CheckoutPageState();
}

class _CheckoutPageState extends ConsumerState<CheckoutPage> {
  final _dio = DioClient.instance;
  final _razorpayService = RazorpayService();
  late Razorpay _razorpay;
  
  String _selectedPaymentMethod = 'online';
  bool _isPlacingOrder = false;
  Map<String, dynamic>? _selectedAddress;
  String _deliveryTime = 'tomorrow'; // 'instant' or 'tomorrow'
  
  // Cached order data for payment callbacks
  Map<String, dynamic>? _pendingOrderData;

  @override
  void initState() {
    super.initState();
    _initRazorpay();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadDefaultAddress();
      _loadStoreSettings();
    });
  }
  
  void _initRazorpay() {
    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handleRazorpaySuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handleRazorpayError);
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleExternalWallet);
  }
  
  void _handleRazorpaySuccess(PaymentSuccessResponse response) async {
    debugPrint('Payment Success: ${response.paymentId}');
    
    if (_pendingOrderData == null) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Payment successful but order data missing. Please contact support.')),
        );
        setState(() => _isPlacingOrder = false);
      }
      return;
    }
    
    final user = _pendingOrderData!['user'] as UserModel;
    final cartState = _pendingOrderData!['cartState'] as CartState?;
    
    await _handlePaymentSuccess(
      user: user,
      cartState: cartState,
      subtotal: _pendingOrderData!['subtotal'] as double,
      deliveryFee: _pendingOrderData!['deliveryFee'] as double,
      total: _pendingOrderData!['total'] as double,
      deliveryDate: _pendingOrderData!['deliveryDate'] as String?,
      razorpayOrderId: response.orderId ?? _pendingOrderData!['razorpayOrderId'] as String,
      razorpayPaymentId: response.paymentId ?? '',
      razorpaySignature: response.signature ?? '',
    );
  }
  
  void _handleRazorpayError(PaymentFailureResponse response) {
    debugPrint('Payment Error: ${response.code} - ${response.message}');
    _pendingOrderData = null;
    
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Payment failed: ${response.message ?? 'Unknown error'}'),
          backgroundColor: Colors.red,
        ),
      );
      setState(() => _isPlacingOrder = false);
    }
  }
  
  void _handleExternalWallet(ExternalWalletResponse response) {
    debugPrint('External Wallet: ${response.walletName}');
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('External Wallet selected: ${response.walletName}')),
      );
    }
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
    _razorpay.clear();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cartState = ref.watch(provideCartViewModelProvider);
    final storeState = ref.watch(provideStoreViewModelProvider);

    if (cartState == null || cartState.items.isEmpty) {
      // Cart emptied (e.g. all items removed here) -> return to home.
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted && Navigator.canPop(context)) {
          Navigator.of(context).popUntil((r) => r.isFirst);
        }
      });
      return Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          title: const Text('Checkout'),
          backgroundColor: Colors.white,
          elevation: 0,
        ),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    final deliveryFee = _getDeliveryFee(storeState);
    final total = cartState.subtotal + deliveryFee;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Checkout'),
        backgroundColor: Colors.white,
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

                  // Price Summary (payment method is selected at the bottom bar)
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
                          // Remove button (gift items can't be removed manually)
                          if (item.price > 0)
                            GestureDetector(
                              onTap: () => ref.read(provideCartViewModelNotifierProvider)?.removeFromCart(item.productId),
                              child: Container(
                                padding: const EdgeInsets.all(4),
                                child: Icon(Icons.close, size: 18, color: AppColors.textHint),
                              ),
                            )
                          else
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: AppColors.primary.withOpacity(0.12),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text('FREE GIFT',
                                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.primary)),
                            ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        item.price > 0 ? '₹${item.price.toStringAsFixed(0)} per ${item.unit}' : 'Free gift with your order',
                        style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary),
                      ),
                      const SizedBox(height: 8),
                      // Quantity controls and total
                      Row(
                        children: [
                          // Quantity controls (hidden for free gift items)
                          if (item.price > 0)
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
                            )
                          else
                            Text(
                              '${item.quantity.toStringAsFixed(item.quantity == item.quantity.toInt() ? 0 : 1)} ${item.unit}',
                              style: AppTextStyles.bodySmall.copyWith(fontWeight: FontWeight.w600),
                            ),
                          const Spacer(),
                          // Item total
                          Text(
                            item.price > 0 ? '₹${(item.price * item.quantity).toStringAsFixed(0)}' : 'FREE',
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
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(Icons.access_time, size: 18, color: AppColors.primary),
          const SizedBox(width: 8),
          Text('Delivery', style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600)),
          const Spacer(),
          _buildDeliveryChip('instant', 'Instant', Icons.bolt),
          const SizedBox(width: 8),
          _buildDeliveryChip('tomorrow', 'Tomorrow', Icons.wb_sunny_outlined),
        ],
      ),
    );
  }

  Widget _buildDeliveryChip(String value, String label, IconData icon) {
    final isSelected = _deliveryTime == value;
    return GestureDetector(
      onTap: () => setState(() => _deliveryTime = value),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : AppColors.background,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isSelected ? AppColors.primary : AppColors.border),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 15, color: isSelected ? Colors.white : AppColors.textSecondary),
            const SizedBox(width: 5),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: isSelected ? Colors.white : AppColors.textSecondary,
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
              Text('Total', style: AppTextStyles.h4),
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
            
            // Payment Method + Place Order Row
            Row(
              children: [
                // Payment Method Selector (left side)
                GestureDetector(
                  onTap: _showPaymentMethodSheet,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    decoration: BoxDecoration(
                      color: AppColors.background,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          _selectedPaymentMethod == 'online' ? Icons.credit_card : Icons.money,
                          size: 20,
                          color: AppColors.primary,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          _selectedPaymentMethod == 'online' ? 'Online' : 'COD',
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Icon(Icons.keyboard_arrow_down, size: 18, color: AppColors.textHint),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                
                // Place Order Button (right side)
                Expanded(
                  child: SizedBox(
                    height: 52,
                    child: ElevatedButton(
                      onPressed: _isPlacingOrder ? null : _placeOrder,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
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
                                    fontSize: 15,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.white,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  '₹${total.toStringAsFixed(0)}',
                                  style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w600,
                                    color: Colors.white.withOpacity(0.9),
                                  ),
                                ),
                              ],
                            ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showPaymentMethodSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => SafeArea(
        child: Container(
          padding: EdgeInsets.fromLTRB(20, 20, 20, 20 + MediaQuery.of(context).padding.bottom),
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
            const SizedBox(height: 20),
            const Text(
              'Select Payment Method',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: Color(0xFF1A1A2E),
              ),
            ),
            const SizedBox(height: 20),
            
            // Online Payment Option
            _buildPaymentSheetOption(
              title: 'Online Payment',
              subtitle: 'UPI / Card / Net Banking',
              icon: Icons.credit_card,
              value: 'online',
              isSelected: _selectedPaymentMethod == 'online',
            ),
            const SizedBox(height: 12),
            
            // COD Option
            _buildPaymentSheetOption(
              title: 'Cash on Delivery',
              subtitle: 'Pay when you receive',
              icon: Icons.money,
              value: 'cod',
              isSelected: _selectedPaymentMethod == 'cod',
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
      ),
    );
  }

  Widget _buildPaymentSheetOption({
    required String title,
    required String subtitle,
    required IconData icon,
    required String value,
    required bool isSelected,
  }) {
    return GestureDetector(
      onTap: () {
        setState(() => _selectedPaymentMethod = value);
        Navigator.pop(context);
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary.withOpacity(0.08) : const Color(0xFFF8F9FA),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.primary : const Color(0xFFE8E8E8),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary.withOpacity(0.1) : Colors.white,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: isSelected ? AppColors.primary : Colors.grey.shade600, size: 24),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: isSelected ? AppColors.primary : const Color(0xFF1A1A2E),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.grey.shade600,
                    ),
                  ),
                ],
              ),
            ),
            if (isSelected)
              Icon(Icons.check_circle, color: AppColors.primary, size: 24)
            else
              Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.grey.shade400),
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
      final user = ref.read(provideAuthViewModelProvider)?.user;
      final storeState = ref.read(provideStoreViewModelProvider);
      
      if (user == null) {
        throw Exception('User not logged in');
      }
      
      // Calculate totals
      final subtotal = cartState?.subtotal ?? 0;
      final deliveryFee = _getDeliveryFee(storeState);
      final total = subtotal + deliveryFee;
      
      // Prepare delivery date for tomorrow option
      String? deliveryDate;
      if (_deliveryTime == 'tomorrow') {
        final tomorrow = DateTime.now().add(const Duration(days: 1));
        deliveryDate = DateFormat('yyyy-MM-dd').format(tomorrow);
      }

      // If online payment, initiate Razorpay
      if (_selectedPaymentMethod == 'online') {
        await _initiateRazorpayPayment(
          user: user,
          cartState: cartState,
          subtotal: subtotal,
          deliveryFee: deliveryFee,
          total: total,
          deliveryDate: deliveryDate,
        );
        return;
      }
      
      // COD order - place directly
      final order = await ref.read(provideOrdersViewModelNotifierProvider)!.createOrder(
        userId: user.userId,
        addressId: _selectedAddress!['id'] ?? '',
        items: cartState?.items ?? [],
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: total,
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        notes: null,
        deliveryType: _deliveryTime,
        deliveryDate: deliveryDate,
        deliverySlotId: null,
      );

      if (order != null) {
        await ref.read(provideCartViewModelNotifierProvider)?.clearCart();
        
        if (mounted) {
          // Navigate to Order Success Page
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (_) => OrderSuccessPage(order: order),
            ),
          );
        }
      } else {
        // Check if there's an error message in the orders state
        final ordersState = ref.read(provideOrdersViewModelProvider);
        final errorMsg = ordersState?.errorMessage ?? 'Failed to place order';
        throw Exception(errorMsg);
      }
    } catch (e) {
      if (mounted) {
        String errorMessage = e.toString();
        // Clean up the error message
        if (errorMessage.startsWith('Exception: ')) {
          errorMessage = errorMessage.substring(11);
        }
        if (errorMessage.contains('ServerException')) {
          errorMessage = errorMessage.replaceAll(RegExp(r'ServerException.*?message: '), '').replaceAll(')', '');
        }
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $errorMessage')),
        );
      }
    } finally {
      if (mounted) setState(() => _isPlacingOrder = false);
    }
  }

  Future<void> _initiateRazorpayPayment({
    required UserModel user,
    required CartState? cartState,
    required double subtotal,
    required double deliveryFee,
    required double total,
    String? deliveryDate,
  }) async {
    try {
      // Create Razorpay order on backend
      final receipt = 'order_${DateTime.now().millisecondsSinceEpoch}';
      final orderResponse = await _razorpayService.createOrder(
        amount: total,
        receipt: receipt,
        notes: {
          'user_id': user.userId,
          'address_id': _selectedAddress!['id'] ?? '',
        },
      );

      if (orderResponse['success'] != true) {
        throw Exception('Failed to create payment order');
      }

      final razorpayOrderId = orderResponse['order_id'];
      final keyId = orderResponse['key_id'];
      final isTestMode = orderResponse['test_mode'] == true;

      // Store order data for callback handlers
      _pendingOrderData = {
        'user': user,
        'cartState': cartState,
        'subtotal': subtotal,
        'deliveryFee': deliveryFee,
        'total': total,
        'deliveryDate': deliveryDate,
        'razorpayOrderId': razorpayOrderId,
      };

      // Build Razorpay checkout options
      final options = {
        'key': keyId,
        'amount': (total * 100).toInt(), // Amount in paise
        'name': 'Khurpi Fresh',
        'description': 'Order Payment',
        'order_id': razorpayOrderId,
        'prefill': {
          'contact': user.phone,
          'email': user.email ?? 'customer@khurpifresh.com',
        },
        'theme': {
          'color': '#4CAF50',
        },
        'notes': {
          'user_id': user.userId,
          'address_id': _selectedAddress!['id'] ?? '',
        },
      };

      // Show test mode warning if applicable
      if (isTestMode && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('⚠️ TEST MODE: Use Razorpay test credentials'),
            backgroundColor: Colors.orange,
            duration: Duration(seconds: 2),
          ),
        );
      }

      // Open Razorpay checkout
      _razorpay.open(options);
      
    } catch (e) {
      _pendingOrderData = null;
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Payment initialization error: $e')),
        );
        setState(() => _isPlacingOrder = false);
      }
    }
  }

  Future<void> _handlePaymentSuccess({
    required UserModel user,
    required CartState? cartState,
    required double subtotal,
    required double deliveryFee,
    required double total,
    String? deliveryDate,
    required String razorpayOrderId,
    required String razorpayPaymentId,
    String razorpaySignature = '',
  }) async {
    try {
      // Verify payment on backend
      await _razorpayService.verifyPayment(
        razorpayOrderId: razorpayOrderId,
        razorpayPaymentId: razorpayPaymentId,
        razorpaySignature: razorpaySignature,
      );

      // Create order with payment details
      final order = await ref.read(provideOrdersViewModelNotifierProvider)!.createOrder(
        userId: user.userId,
        addressId: _selectedAddress!['id'] ?? '',
        items: cartState?.items ?? [],
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: total,
        paymentMethod: 'online',
        paymentStatus: 'paid',
        paymentId: razorpayPaymentId,
        razorpayOrderId: razorpayOrderId,
        notes: null,
        deliveryType: _deliveryTime,
        deliveryDate: deliveryDate,
        deliverySlotId: null,
      );

      _pendingOrderData = null;

      if (order != null) {
        await ref.read(provideCartViewModelNotifierProvider)?.clearCart();
        
        if (mounted) {
          // Navigate to Order Success Page
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (_) => OrderSuccessPage(order: order),
            ),
          );
        }
      } else {
        throw Exception('Failed to place order after payment');
      }
    } catch (e) {
      _pendingOrderData = null;
      if (mounted) {
        String errorMessage = e.toString();
        if (errorMessage.startsWith('Exception: ')) {
          errorMessage = errorMessage.substring(11);
        }
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Order creation failed: $errorMessage')),
        );
      }
    } finally {
      if (mounted) setState(() => _isPlacingOrder = false);
    }
  }
}
