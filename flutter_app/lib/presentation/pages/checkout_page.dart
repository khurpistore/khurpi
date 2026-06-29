import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
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
      _loadStoreSettings();
    });
  }

  void _prefillUserData() {
    final authState = ref.read(authViewModelProvider);
    final user = authState.user;
    if (user != null) {
      _addressController.text = user.address ?? '';
      _cityController.text = user.city ?? '';
      _pincodeController.text = user.pincode ?? '';
      _phoneController.text = user.phone;
    }
  }

  void _loadStoreSettings() async {
    await ref.read(storeViewModelProvider.notifier).loadStoreSettings();
    
    // Load delivery slots for tomorrow by default
    final tomorrow = DateTime.now().add(const Duration(days: 1));
    final dateStr = DateFormat('yyyy-MM-dd').format(tomorrow);
    ref.read(storeViewModelProvider.notifier).setSelectedDate(dateStr);
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
    final storeState = ref.watch(storeViewModelProvider);

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
            _buildOrderSummary(cartState, storeState),
            const SizedBox(height: 24),
            
            // Delivery Time Selection
            if (storeState.settings != null) _buildDeliveryTimeSection(storeState),
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
            
            // Order Notes
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

  Widget _buildOrderSummary(CartState cartState, StoreState storeState) {
    final deliveryFee = storeState.settings != null
        ? ref.read(storeViewModelProvider.notifier).getDeliveryFee(cartState.subtotal)
        : 0.0;
    final total = cartState.subtotal + deliveryFee;

    return Container(
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
          _buildSummaryRow('Subtotal', '₹${cartState.subtotal.toStringAsFixed(0)}'),
          _buildSummaryRow(
            'Delivery${storeState.deliveryType == 'instant' ? ' (Instant)' : ''}',
            deliveryFee > 0 ? '₹${deliveryFee.toStringAsFixed(0)}' : 'FREE',
          ),
          const Divider(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Total', style: AppTextStyles.h4),
              Text(
                '₹${total.toStringAsFixed(0)}',
                style: AppTextStyles.h4.copyWith(color: AppColors.primary),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDeliveryTimeSection(StoreState storeState) {
    final settings = storeState.settings!;
    final showInstant = settings.instantDeliveryEnabled;
    final showSlotted = settings.slottedDeliveryEnabled;

    if (!showInstant && !showSlotted) return const SizedBox.shrink();

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

          // Delivery Type Selection
          Row(
            children: [
              if (showInstant)
                Expanded(
                  child: _buildDeliveryTypeCard(
                    title: 'Instant Delivery',
                    subtitle: 'Within ${settings.instantDeliveryTimeMinutes} mins${settings.instantDeliveryFee > 0 ? ' • +₹${settings.instantDeliveryFee.toStringAsFixed(0)}' : ''}',
                    icon: Icons.bolt,
                    isSelected: storeState.deliveryType == 'instant',
                    onTap: () {
                      ref.read(storeViewModelProvider.notifier).setDeliveryType('instant');
                    },
                  ),
                ),
              if (showInstant && showSlotted) const SizedBox(width: 12),
              if (showSlotted)
                Expanded(
                  child: _buildDeliveryTypeCard(
                    title: 'Scheduled',
                    subtitle: 'Choose date & time',
                    icon: Icons.calendar_today,
                    isSelected: storeState.deliveryType == 'slotted',
                    onTap: () {
                      ref.read(storeViewModelProvider.notifier).setDeliveryType('slotted');
                    },
                  ),
                ),
            ],
          ),

          // Slotted Delivery Options
          if (storeState.deliveryType == 'slotted') ...[
            const SizedBox(height: 20),
            _buildDatePicker(storeState),
            const SizedBox(height: 16),
            _buildSlotPicker(storeState),
          ],

          // Instant Delivery Info
          if (storeState.deliveryType == 'instant') ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.warning.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.warning.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  Icon(Icons.bolt, size: 18, color: AppColors.warning),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Your order will be delivered within ${settings.instantDeliveryTimeMinutes} minutes',
                      style: AppTextStyles.body.copyWith(
                        color: Colors.orange.shade800,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildDeliveryTypeCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
            width: isSelected ? 2 : 1,
          ),
          color: isSelected ? AppColors.primary.withOpacity(0.05) : Colors.transparent,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(
              icon,
              size: 24,
              color: isSelected ? AppColors.primary : AppColors.textSecondary,
            ),
            const SizedBox(height: 8),
            Text(
              title,
              style: AppTextStyles.body.copyWith(
                fontWeight: FontWeight.w600,
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              subtitle,
              style: AppTextStyles.body.copyWith(
                color: AppColors.textSecondary,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDatePicker(StoreState storeState) {
    final now = DateTime.now();
    final dates = List.generate(7, (i) => now.add(Duration(days: i)));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Select Date',
          style: AppTextStyles.body.copyWith(
            fontWeight: FontWeight.w500,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: 8),
        SizedBox(
          height: 80,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: dates.length,
            itemBuilder: (context, index) {
              final date = dates[index];
              final dateStr = DateFormat('yyyy-MM-dd').format(date);
              final isSelected = storeState.selectedDate == dateStr;
              final isToday = index == 0;

              return GestureDetector(
                onTap: () {
                  ref.read(storeViewModelProvider.notifier).setSelectedDate(dateStr);
                },
                child: Container(
                  width: 70,
                  margin: const EdgeInsets.only(right: 8),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isSelected ? AppColors.primary : AppColors.border,
                      width: isSelected ? 2 : 1,
                    ),
                    color: isSelected ? AppColors.primary.withOpacity(0.05) : Colors.transparent,
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        DateFormat('EEE').format(date),
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      Text(
                        DateFormat('d').format(date),
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: isSelected ? AppColors.primary : AppColors.textPrimary,
                        ),
                      ),
                      Text(
                        DateFormat('MMM').format(date),
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      if (isToday)
                        Text(
                          'Today',
                          style: TextStyle(
                            fontSize: 10,
                            color: AppColors.primary,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildSlotPicker(StoreState storeState) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Select Time Slot',
          style: AppTextStyles.body.copyWith(
            fontWeight: FontWeight.w500,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: 8),
        if (storeState.isSlotsLoading)
          const Center(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: CircularProgressIndicator(),
            ),
          )
        else if (storeState.deliverySlots.isEmpty)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Center(
              child: Text(
                'No delivery slots available for this date',
                style: TextStyle(color: AppColors.textSecondary),
              ),
            ),
          )
        else
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: storeState.deliverySlots.map((slot) {
              final isSelected = storeState.selectedSlotId == slot.id;
              final isAvailable = slot.available;

              return GestureDetector(
                onTap: isAvailable
                    ? () {
                        ref.read(storeViewModelProvider.notifier).setSelectedSlotId(slot.id);
                      }
                    : null,
                child: Container(
                  width: (MediaQuery.of(context).size.width - 64) / 2,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: !isAvailable
                          ? AppColors.border.withOpacity(0.5)
                          : isSelected
                              ? AppColors.primary
                              : AppColors.border,
                      width: isSelected ? 2 : 1,
                    ),
                    color: !isAvailable
                        ? AppColors.background.withOpacity(0.5)
                        : isSelected
                            ? AppColors.primary.withOpacity(0.05)
                            : Colors.transparent,
                  ),
                  child: Opacity(
                    opacity: isAvailable ? 1.0 : 0.5,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          slot.name,
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                            color: isSelected ? AppColors.primary : AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          slot.displayText ?? '${slot.startTime} - ${slot.endTime}',
                          style: TextStyle(
                            fontSize: 12,
                            color: AppColors.textSecondary,
                          ),
                        ),
                        if (slot.deliveryFee > 0)
                          Padding(
                            padding: const EdgeInsets.only(top: 4),
                            child: Text(
                              '+₹${slot.deliveryFee.toStringAsFixed(0)}',
                              style: TextStyle(
                                fontSize: 12,
                                color: AppColors.primary,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        if (!isAvailable)
                          Padding(
                            padding: const EdgeInsets.only(top: 4),
                            child: Text(
                              'Full',
                              style: TextStyle(
                                fontSize: 12,
                                color: AppColors.error,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
      ],
    );
  }

  Widget _buildSummaryRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
          ),
          Text(
            value,
            style: AppTextStyles.body.copyWith(
              color: value == 'FREE' ? AppColors.success : null,
              fontWeight: value == 'FREE' ? FontWeight.w600 : null,
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _placeOrder() async {
    if (_addressController.text.isEmpty ||
        _cityController.text.isEmpty ||
        _pincodeController.text.isEmpty ||
        _phoneController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill all required fields')),
      );
      return;
    }

    final storeState = ref.read(storeViewModelProvider);
    
    // Validate slotted delivery selection
    if (storeState.deliveryType == 'slotted') {
      if (storeState.selectedDate == null || storeState.selectedSlotId == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please select a delivery date and time slot')),
        );
        return;
      }
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
        deliveryType: storeState.deliveryType,
        deliveryDate: storeState.deliveryType == 'slotted' ? storeState.selectedDate : null,
        deliverySlotId: storeState.deliveryType == 'slotted' ? storeState.selectedSlotId : null,
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
      if (mounted) setState(() => _isPlacingOrder = false);
    }
  }
}
