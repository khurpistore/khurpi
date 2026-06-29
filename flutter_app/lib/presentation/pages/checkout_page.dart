import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/core/constants/app_text_styles.dart';
import 'package:khurpi_fresh/presentation/viewmodels/cart_viewmodel.dart';
import 'package:khurpi_fresh/presentation/viewmodels/auth_viewmodel.dart';
import 'package:khurpi_fresh/presentation/viewmodels/orders_viewmodel.dart';

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
    // Delay reading provider to avoid "modifying provider while building" error
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _prefillUserData();
    });
  }

  void _prefillUserData() {
    final user = ref.read(authViewModelProvider).user;
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
    final cartState = ref.watch(cartViewModelProvider);
    final authState = ref.watch(authViewModelProvider);

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
            // Delivery Address
            const Text('Delivery Address', style: AppTextStyles.h4),
            const SizedBox(height: 12),
            _buildTextField(_addressController, 'Address', Icons.location_on_outlined),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: _buildTextField(_cityController, 'City', Icons.location_city)),
                const SizedBox(width: 12),
                Expanded(child: _buildTextField(_pincodeController, 'Pincode', Icons.pin_drop_outlined)),
              ],
            ),
            const SizedBox(height: 12),
            _buildTextField(_phoneController, 'Phone', Icons.phone_outlined),
            const SizedBox(height: 24),

            // Payment Method
            const Text('Payment Method', style: AppTextStyles.h4),
            const SizedBox(height: 12),
            _buildPaymentOption('cod', 'Cash on Delivery', Icons.money),
            _buildPaymentOption('online', 'Online Payment', Icons.payment),
            const SizedBox(height: 24),

            // Notes
            const Text('Notes (Optional)', style: AppTextStyles.h4),
            const SizedBox(height: 12),
            _buildTextField(_notesController, 'Any special instructions?', Icons.note_outlined, maxLines: 3),
            const SizedBox(height: 24),

            // Order Summary
            const Text('Order Summary', style: AppTextStyles.h4),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  ...cartState.items.map((item) => Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(child: Text('${item.productName} x ${item.quantity} ${item.unit}')),
                        Text('₹${(item.price * item.quantity).toStringAsFixed(0)}'),
                      ],
                    ),
                  )),
                  const Divider(),
                  _buildSummaryRow('Subtotal', cartState.formattedSubtotal),
                  _buildSummaryRow('Delivery', cartState.formattedDeliveryFee),
                  const Divider(),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total', style: AppTextStyles.h4),
                      Text(cartState.formattedTotal, style: AppTextStyles.h4.copyWith(color: AppColors.primary)),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: ElevatedButton(
            onPressed: _isPlacingOrder ? null : _placeOrder,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: _isPlacingOrder
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                  )
                : Text(
                    'Place Order • ${ref.watch(cartViewModelProvider).formattedTotal}',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(TextEditingController controller, String hint, IconData icon, {int maxLines = 1}) {
    return TextField(
      controller: controller,
      maxLines: maxLines,
      decoration: InputDecoration(
        hintText: hint,
        prefixIcon: Icon(icon),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        filled: true,
        fillColor: AppColors.surface,
      ),
    );
  }

  Widget _buildPaymentOption(String value, String label, IconData icon) {
    return ListTile(
      leading: Icon(icon, color: _selectedPaymentMethod == value ? AppColors.primary : AppColors.textHint),
      title: Text(label),
      trailing: Radio<String>(
        value: value,
        groupValue: _selectedPaymentMethod,
        onChanged: (v) => setState(() => _selectedPaymentMethod = v!),
        activeColor: AppColors.primary,
      ),
      onTap: () => setState(() => _selectedPaymentMethod = value),
    );
  }

  Widget _buildSummaryRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
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
      final cartState = ref.read(cartViewModelProvider);
      final order = await ref.read(ordersViewModelProvider.notifier).createOrder(
        items: cartState.items,
        deliveryAddress: _addressController.text,
        city: _cityController.text,
        pincode: _pincodeController.text,
        phone: _phoneController.text,
        paymentMethod: _selectedPaymentMethod,
        notes: _notesController.text.isNotEmpty ? _notesController.text : null,
      );

      if (order != null) {
        await ref.read(cartViewModelProvider.notifier).clearCart();
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
