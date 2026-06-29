import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:khurpi_fresh/presentation/providers/providers.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/core/constants/app_text_styles.dart';

class CheckoutPage extends ConsumerStatefulWidget {
  const CheckoutPage({super.key});

  @override
  ConsumerState<CheckoutPage> createState() => _CheckoutPageState();
}

class _CheckoutPageState extends ConsumerState<CheckoutPage> {
  final _addressController = TextEditingController();
  final _cityController = TextEditingController();
  final _pincodeController = TextEditingController();
  final _phoneController = TextEditingController();
  final _notesController = TextEditingController();
  String _selectedPaymentMethod = 'cod';
  bool _isPlacingOrder = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _prefillUserData();
    });
  }

  void _prefillUserData() {
    final authVM = ref.read(authViewModelProvider);
    final user = authVM?.state.user;
    if (user != null) {
      _addressController.text = user.address ?? '';
      _cityController.text = user.city ?? '';
      _pincodeController.text = user.pincode ?? '';
      _phoneController.text = user.phone;
    }
  }

  @override
  void dispose() {
    _addressController.dispose();
    _cityController.dispose();
    _pincodeController.dispose();
    _phoneController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cartVM = ref.watch(cartViewModelProvider);
    final authVM = ref.watch(authViewModelProvider);

    if (cartVM == null || authVM == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final cartState = cartVM.state;
    final authState = authVM.state;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Checkout'),
        backgroundColor: AppColors.surface,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Order Summary
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Order Summary', style: AppTextStyles.h4),
                  const Divider(height: 24),
                  ...cartState.items.map((item) => Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            '${item.productName} x ${item.quantity}',
                            style: AppTextStyles.body,
                          ),
                        ),
                        Text(
                          '₹${(item.price * item.quantity).toStringAsFixed(0)}',
                          style: AppTextStyles.body,
                        ),
                      ],
                    ),
                  )),
                  const Divider(height: 24),
                  _buildSummaryRow('Subtotal', cartState.formattedSubtotal),
                  _buildSummaryRow('Delivery', cartState.formattedDeliveryFee),
                  const Divider(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total', style: AppTextStyles.h4),
                      Text(
                        cartState.formattedTotal,
                        style: AppTextStyles.h4.copyWith(color: AppColors.primary),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Delivery Address
            const Text('Delivery Address', style: AppTextStyles.h4),
            const SizedBox(height: 12),
            TextField(
              controller: _addressController,
              decoration: const InputDecoration(
                labelText: 'Street Address *',
                border: OutlineInputBorder(),
              ),
              maxLines: 2,
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _cityController,
                    decoration: const InputDecoration(
                      labelText: 'City *',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    controller: _pincodeController,
                    decoration: const InputDecoration(
                      labelText: 'Pincode *',
                      border: OutlineInputBorder(),
                    ),
                    keyboardType: TextInputType.number,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _phoneController,
              decoration: const InputDecoration(
                labelText: 'Phone Number *',
                border: OutlineInputBorder(),
                prefixText: '+91 ',
              ),
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 24),

            // Payment Method
            const Text('Payment Method', style: AppTextStyles.h4),
            const SizedBox(height: 12),
            Container(
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  RadioListTile<String>(
                    title: const Text('Cash on Delivery'),
                    subtitle: const Text('Pay when you receive'),
                    value: 'cod',
                    groupValue: _selectedPaymentMethod,
                    onChanged: (v) => setState(() => _selectedPaymentMethod = v!),
                    activeColor: AppColors.primary,
                  ),
                  const Divider(height: 1),
                  RadioListTile<String>(
                    title: const Text('Online Payment'),
                    subtitle: const Text('UPI / Card / Net Banking'),
                    value: 'online',
                    groupValue: _selectedPaymentMethod,
                    onChanged: (v) => setState(() => _selectedPaymentMethod = v!),
                    activeColor: AppColors.primary,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Notes
            TextField(
              controller: _notesController,
              decoration: const InputDecoration(
                labelText: 'Order Notes (Optional)',
                border: OutlineInputBorder(),
                hintText: 'Any special instructions...',
              ),
              maxLines: 2,
            ),
            const SizedBox(height: 32),

            // Place Order Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isPlacingOrder ? null : _placeOrder,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isPlacingOrder
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : const Text(
                        'Place Order',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: AppTextStyles.body.copyWith(color: AppColors.textSecondary)),
          Text(value, style: AppTextStyles.body),
        ],
      ),
    );
  }

  Future<void> _placeOrder() async {
    if (_addressController.text.isEmpty || _cityController.text.isEmpty ||
        _pincodeController.text.isEmpty || _phoneController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill all required fields')),
      );
      return;
    }

    setState(() => _isPlacingOrder = true);

    try {
      final cartVM = ref.read(cartViewModelProvider);
      final ordersVM = ref.read(ordersViewModelProvider);

      if (cartVM == null || ordersVM == null) {
        throw Exception('Services not available');
      }

      final order = await ordersVM.createOrder(
        items: cartVM.state.items,
        deliveryAddress: _addressController.text,
        city: _cityController.text,
        pincode: _pincodeController.text,
        phone: _phoneController.text,
        paymentMethod: _selectedPaymentMethod,
        notes: _notesController.text.isNotEmpty ? _notesController.text : null,
      );

      if (order != null) {
        await cartVM.clearCart();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Order placed successfully!')),
          );
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
      if (mounted) {
        setState(() => _isPlacingOrder = false);
      }
    }
  }
}
