import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/core/constants/app_text_styles.dart';
import 'package:khurpi_fresh/data/models/order_model.dart';
import 'package:khurpi_fresh/features/orders/orders_providers.dart';

class OrderDetailPage extends ConsumerStatefulWidget {
  final String orderId;

  const OrderDetailPage({super.key, required this.orderId});

  @override
  ConsumerState<OrderDetailPage> createState() => _OrderDetailPageState();
}

class _OrderDetailPageState extends ConsumerState<OrderDetailPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(provideOrdersViewModelNotifierProvider)?.loadOrderById(widget.orderId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final ordersState = ref.watch(provideOrdersViewModelProvider);
    final order = ordersState?.currentOrder;
    final isLoading = ordersState?.isLoading ?? true;

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        title: const Text(
          'Order Details',
          style: TextStyle(
            fontWeight: FontWeight.w700,
            fontSize: 20,
            color: Color(0xFF1A1A2E),
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF1A1A2E)),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : order == null
              ? _buildErrorState()
              : _buildOrderDetails(order),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline, size: 64, color: Colors.grey.shade400),
          const SizedBox(height: 16),
          Text(
            'Order not found',
            style: TextStyle(fontSize: 18, color: Colors.grey.shade600),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Go Back'),
          ),
        ],
      ),
    );
  }

  Widget _buildOrderDetails(OrderModel order) {
    final String orderId = order.orderId;
    final DateTime orderDate = order.orderDate;
    final List<OrderItemModel> items = order.allItems;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Order Header Card
          _buildOrderHeader(orderId, orderDate, order.status),
          const SizedBox(height: 16),

          // Order Timeline
          _buildOrderTimeline(order.status),
          const SizedBox(height: 16),

          // Order Items
          _buildOrderItems(items),
          const SizedBox(height: 16),

          // Delivery Address
          _buildDeliveryAddress(order),
          const SizedBox(height: 16),

          // Payment Summary
          _buildPaymentSummary(order),
          const SizedBox(height: 24),

          // Action Buttons
          if (order.status.toLowerCase() == 'pending' ||
              order.status.toLowerCase() == 'confirmed')
            _buildActionButtons(order),
        ],
      ),
    );
  }

  Widget _buildOrderHeader(String orderId, DateTime orderDate, String status) {
    final displayId = orderId.length >= 8 
        ? orderId.substring(0, 8).toUpperCase() 
        : orderId.toUpperCase();
    final statusColor = _getStatusColor(status);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Order #$displayId',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF1A1A2E),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Icon(Icons.access_time_rounded, size: 14, color: Colors.grey.shade500),
                      const SizedBox(width: 4),
                      Text(
                        DateFormat('dd MMM yyyy, h:mm a').format(orderDate),
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  _formatStatus(status),
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: statusColor,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildOrderTimeline(String currentStatus) {
    final stages = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
    final currentIndex = _getStatusIndex(currentStatus);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Order Status',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: Color(0xFF1A1A2E),
            ),
          ),
          const SizedBox(height: 20),
          Row(
            children: List.generate(stages.length, (index) {
              final isCompleted = index <= currentIndex;
              final isLast = index == stages.length - 1;

              return Expanded(
                child: Row(
                  children: [
                    Column(
                      children: [
                        Container(
                          width: 28,
                          height: 28,
                          decoration: BoxDecoration(
                            color: isCompleted ? AppColors.primary : Colors.grey.shade200,
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            isCompleted ? Icons.check : Icons.circle,
                            size: isCompleted ? 16 : 8,
                            color: isCompleted ? Colors.white : Colors.grey.shade400,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          stages[index],
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: isCompleted ? FontWeight.w600 : FontWeight.w400,
                            color: isCompleted ? AppColors.primary : Colors.grey.shade500,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                    if (!isLast)
                      Expanded(
                        child: Container(
                          height: 2,
                          margin: const EdgeInsets.only(bottom: 20),
                          color: index < currentIndex 
                              ? AppColors.primary 
                              : Colors.grey.shade200,
                        ),
                      ),
                  ],
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildOrderItems(List<OrderItemModel> items) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Order Items',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF1A1A2E),
                ),
              ),
              Text(
                '${items.length} item${items.length > 1 ? 's' : ''}',
                style: TextStyle(
                  fontSize: 13,
                  color: Colors.grey.shade600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (items.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 20),
              child: Center(
                child: Text(
                  'No items in this order',
                  style: TextStyle(color: Colors.grey.shade500),
                ),
              ),
            )
          else
            ...items.map((item) {
              final String itemName = item.displayName;
              final double price = item.displayPrice;
              final double qty = item.quantity;
              final String unit = item.unit;

              return Container(
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(color: Colors.grey.shade100),
                  ),
                ),
                child: Row(
                  children: [
                    // Product Image Placeholder
                    Container(
                      width: 50,
                      height: 50,
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        Icons.eco_rounded,
                        color: AppColors.primary.withOpacity(0.5),
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 12),
                    // Product Details
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            itemName,
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF1A1A2E),
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${qty.toStringAsFixed(qty == qty.toInt() ? 0 : 1)} $unit × ₹${price.toStringAsFixed(0)}',
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.grey.shade600,
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Item Total
                    Text(
                      '₹${(price * qty).toStringAsFixed(0)}',
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primary,
                      ),
                    ),
                  ],
                ),
              );
            }),
        ],
      ),
    );
  }

  Widget _buildDeliveryAddress(OrderModel order) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.location_on_rounded, color: AppColors.primary, size: 20),
              const SizedBox(width: 8),
              const Text(
                'Delivery Address',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF1A1A2E),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            order.deliveryAddress.isNotEmpty 
                ? order.deliveryAddress 
                : 'Address not available',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey.shade700,
              height: 1.5,
            ),
          ),
          if (order.phone.isNotEmpty) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.phone_rounded, size: 16, color: Colors.grey.shade500),
                const SizedBox(width: 6),
                Text(
                  order.phone,
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.grey.shade600,
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildPaymentSummary(OrderModel order) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Payment Summary',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: Color(0xFF1A1A2E),
            ),
          ),
          const SizedBox(height: 16),
          _buildSummaryRow('Subtotal', '₹${order.subtotal.toStringAsFixed(0)}'),
          const SizedBox(height: 10),
          _buildSummaryRow('Delivery Fee', '₹${order.deliveryFee.toStringAsFixed(0)}'),
          if (order.discount > 0) ...[
            const SizedBox(height: 10),
            _buildSummaryRow('Discount', '-₹${order.discount.toStringAsFixed(0)}', isDiscount: true),
          ],
          const SizedBox(height: 12),
          const Divider(),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Total',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF1A1A2E),
                ),
              ),
              Text(
                '₹${order.total.toStringAsFixed(0)}',
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Payment Method
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFF8F9FA),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                Icon(
                  order.paymentMethod.toUpperCase() == 'COD'
                      ? Icons.money_rounded
                      : Icons.credit_card_rounded,
                  color: AppColors.primary,
                  size: 20,
                ),
                const SizedBox(width: 10),
                Text(
                  order.paymentMethod.toUpperCase() == 'COD'
                      ? 'Cash on Delivery'
                      : 'Paid Online',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: order.paymentStatus?.toLowerCase() == 'paid'
                        ? AppColors.success.withOpacity(0.1)
                        : Colors.orange.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    order.paymentStatus?.toUpperCase() ?? 'PENDING',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: order.paymentStatus?.toLowerCase() == 'paid'
                          ? AppColors.success
                          : Colors.orange,
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

  Widget _buildSummaryRow(String label, String value, {bool isDiscount = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 14,
            color: Colors.grey.shade600,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: isDiscount ? AppColors.success : const Color(0xFF1A1A2E),
          ),
        ),
      ],
    );
  }

  Widget _buildActionButtons(OrderModel order) {
    return Row(
      children: [
        Expanded(
          child: OutlinedButton.icon(
            onPressed: () {
              // TODO: Implement cancel order
              _showCancelDialog();
            },
            icon: const Icon(Icons.close_rounded),
            label: const Text('Cancel Order'),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.error,
              side: const BorderSide(color: AppColors.error),
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: ElevatedButton.icon(
            onPressed: () {
              // TODO: Implement contact support
            },
            icon: const Icon(Icons.support_agent_rounded),
            label: const Text('Get Help'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ),
      ],
    );
  }

  void _showCancelDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancel Order?'),
        content: const Text('Are you sure you want to cancel this order? This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('No, Keep it'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              // TODO: Implement cancel logic
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Order cancellation requested')),
              );
            },
            child: Text('Yes, Cancel', style: TextStyle(color: AppColors.error)),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return Colors.orange;
      case 'confirmed':
        return AppColors.primary;
      case 'processing':
        return Colors.blue;
      case 'out_for_delivery':
      case 'shipped':
        return Colors.purple;
      case 'delivered':
        return AppColors.success;
      case 'cancelled':
        return AppColors.error;
      default:
        return Colors.grey;
    }
  }

  int _getStatusIndex(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return 0;
      case 'confirmed':
        return 1;
      case 'processing':
        return 2;
      case 'out_for_delivery':
      case 'shipped':
        return 3;
      case 'delivered':
        return 4;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  }

  String _formatStatus(String status) {
    switch (status.toLowerCase()) {
      case 'out_for_delivery':
        return 'Out for Delivery';
      default:
        return status.split('_').map((word) => 
          word.isNotEmpty ? '${word[0].toUpperCase()}${word.substring(1)}' : ''
        ).join(' ');
    }
  }
}
