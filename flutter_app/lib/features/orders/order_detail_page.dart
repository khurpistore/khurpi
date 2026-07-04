import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/core/constants/app_text_styles.dart';
import 'package:khurpi_fresh/data/models/order_model.dart';

class OrderDetailPage extends ConsumerWidget {
  final OrderModel order;

  const OrderDetailPage({super.key, required this.order});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Order Details'),
        backgroundColor: AppColors.surface,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Order Header
            _buildOrderHeader(),
            const SizedBox(height: 20),

            // Order Tracking Timeline
            _buildTrackingTimeline(),
            const SizedBox(height: 20),

            // Order Items
            _buildOrderItems(),
            const SizedBox(height: 20),

            // Delivery Address
            _buildDeliveryAddress(),
            const SizedBox(height: 20),

            // Payment Summary
            _buildPaymentSummary(),
            const SizedBox(height: 20),

            // Actions
            if (order.status.toLowerCase() == 'pending' ||
                order.status.toLowerCase() == 'confirmed')
              _buildActions(context),
          ],
        ),
      ),
    );
  }

  Widget _buildOrderHeader() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
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
              Text(
                'Order #${order.orderId.substring(0, 8).toUpperCase()}',
                style: AppTextStyles.h4,
              ),
              _buildStatusBadge(order.status),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Icon(Icons.calendar_today, size: 16, color: AppColors.textHint),
              const SizedBox(width: 8),
              Text(
                DateFormat('dd MMM yyyy, hh:mm a').format(order.createdAt),
                style:
                    AppTextStyles.body.copyWith(color: AppColors.textSecondary),
              ),
            ],
          ),
          if (order.deliveryType != null) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(
                  order.deliveryType == 'instant'
                      ? Icons.bolt
                      : Icons.schedule,
                  size: 16,
                  color: AppColors.primary,
                ),
                const SizedBox(width: 8),
                Text(
                  order.deliveryType == 'instant'
                      ? 'Instant Delivery'
                      : 'Scheduled Delivery',
                  style: AppTextStyles.body.copyWith(color: AppColors.primary),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildTrackingTimeline() {
    final steps = _getTrackingSteps();
    final currentStepIndex = _getCurrentStepIndex();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.local_shipping_outlined,
                  size: 20, color: AppColors.primary),
              const SizedBox(width: 8),
              const Text('Order Tracking', style: AppTextStyles.h4),
            ],
          ),
          const SizedBox(height: 16),
          ...steps.asMap().entries.map((entry) {
            final index = entry.key;
            final step = entry.value;
            final isCompleted = index <= currentStepIndex;
            final isCurrent = index == currentStepIndex;
            final isLast = index == steps.length - 1;

            return Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Column(
                  children: [
                    Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isCompleted
                            ? AppColors.primary
                            : AppColors.background,
                        border: Border.all(
                          color: isCompleted
                              ? AppColors.primary
                              : AppColors.border,
                          width: 2,
                        ),
                      ),
                      child: isCompleted
                          ? const Icon(Icons.check, size: 14, color: Colors.white)
                          : null,
                    ),
                    if (!isLast)
                      Container(
                        width: 2,
                        height: 40,
                        color: isCompleted
                            ? AppColors.primary
                            : AppColors.border,
                      ),
                  ],
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          step['title']!,
                          style: AppTextStyles.body.copyWith(
                            fontWeight:
                                isCurrent ? FontWeight.w600 : FontWeight.normal,
                            color: isCompleted
                                ? AppColors.textPrimary
                                : AppColors.textHint,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          step['subtitle']!,
                          style: AppTextStyles.bodySmall.copyWith(
                            color: AppColors.textHint,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            );
          }),
        ],
      ),
    );
  }

  List<Map<String, String>> _getTrackingSteps() {
    return [
      {
        'title': 'Order Placed',
        'subtitle': 'Your order has been received',
      },
      {
        'title': 'Confirmed',
        'subtitle': 'Your order has been confirmed',
      },
      {
        'title': 'Preparing',
        'subtitle': 'Your order is being prepared',
      },
      {
        'title': 'Out for Delivery',
        'subtitle': 'Your order is on the way',
      },
      {
        'title': 'Delivered',
        'subtitle': 'Your order has been delivered',
      },
    ];
  }

  int _getCurrentStepIndex() {
    switch (order.status.toLowerCase()) {
      case 'pending':
        return 0;
      case 'confirmed':
        return 1;
      case 'preparing':
        return 2;
      case 'out_for_delivery':
        return 3;
      case 'delivered':
        return 4;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  }

  Widget _buildOrderItems() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.shopping_bag_outlined,
                  size: 20, color: AppColors.primary),
              const SizedBox(width: 8),
              Text(
                'Items (${order.items.length})',
                style: AppTextStyles.h4,
              ),
            ],
          ),
          const SizedBox(height: 16),
          ...order.items.map((item) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Row(
                  children: [
                    Container(
                      width: 50,
                      height: 50,
                      decoration: BoxDecoration(
                        color: AppColors.background,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Center(
                        child: Text(
                          '${item.quantity}x',
                          style: AppTextStyles.body.copyWith(
                            color: AppColors.primary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.productName,
                            style: AppTextStyles.body
                                .copyWith(fontWeight: FontWeight.w500),
                          ),
                          Text(
                            '₹${item.price.toStringAsFixed(0)} each',
                            style: AppTextStyles.bodySmall
                                .copyWith(color: AppColors.textHint),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      '₹${(item.price * item.quantity).toStringAsFixed(0)}',
                      style: AppTextStyles.body.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              )),
        ],
      ),
    );
  }

  Widget _buildDeliveryAddress() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.location_on_outlined,
                  size: 20, color: AppColors.primary),
              const SizedBox(width: 8),
              const Text('Delivery Address', style: AppTextStyles.h4),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            order.deliveryAddress,
            style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
          ),
          if (order.city != null || order.pincode != null) ...[
            const SizedBox(height: 4),
            Text(
              '${order.city ?? ''} - ${order.pincode ?? ''}',
              style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
            ),
          ],
          const SizedBox(height: 8),
          Row(
            children: [
              Icon(Icons.phone_outlined, size: 16, color: AppColors.textHint),
              const SizedBox(width: 8),
              Text(
                order.phone,
                style:
                    AppTextStyles.body.copyWith(color: AppColors.textSecondary),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentSummary() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.receipt_outlined, size: 20, color: AppColors.primary),
              const SizedBox(width: 8),
              const Text('Payment Summary', style: AppTextStyles.h4),
            ],
          ),
          const SizedBox(height: 16),
          _buildPaymentRow('Subtotal', '₹${order.subtotal.toStringAsFixed(0)}'),
          _buildPaymentRow(
            'Delivery',
            order.deliveryFee > 0
                ? '₹${order.deliveryFee.toStringAsFixed(0)}'
                : 'FREE',
          ),
          if (order.discount > 0)
            _buildPaymentRow(
              'Discount',
              '-₹${order.discount.toStringAsFixed(0)}',
              isDiscount: true,
            ),
          const Divider(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Total', style: AppTextStyles.h4),
              Text(
                '₹${order.total.toStringAsFixed(0)}',
                style: AppTextStyles.h4.copyWith(color: AppColors.primary),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  order.paymentMethod.toLowerCase() == 'cod'
                      ? Icons.money
                      : Icons.payment,
                  size: 16,
                  color: AppColors.textSecondary,
                ),
                const SizedBox(width: 8),
                Text(
                  order.paymentMethod.toLowerCase() == 'cod'
                      ? 'Cash on Delivery'
                      : 'Online Payment',
                  style: AppTextStyles.body
                      .copyWith(color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentRow(String label, String value, {bool isDiscount = false}) {
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
              color: isDiscount
                  ? AppColors.success
                  : value == 'FREE'
                      ? AppColors.success
                      : null,
              fontWeight: value == 'FREE' ? FontWeight.w600 : null,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActions(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () {
                // TODO: Implement cancel order
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                      content: Text('Cancel order feature coming soon')),
                );
              },
              icon: const Icon(Icons.cancel_outlined, color: AppColors.error),
              label:
                  const Text('Cancel Order', style: TextStyle(color: AppColors.error)),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
                side: const BorderSide(color: AppColors.error),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () {
                // TODO: Implement contact support
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Contact support coming soon')),
                );
              },
              icon: const Icon(Icons.chat_outlined),
              label: const Text('Need Help?'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color backgroundColor;
    Color textColor;
    switch (status.toLowerCase()) {
      case 'delivered':
        backgroundColor = AppColors.success.withOpacity(0.1);
        textColor = AppColors.success;
        break;
      case 'cancelled':
        backgroundColor = AppColors.error.withOpacity(0.1);
        textColor = AppColors.error;
        break;
      case 'out_for_delivery':
        backgroundColor = AppColors.primary.withOpacity(0.1);
        textColor = AppColors.primary;
        break;
      default:
        backgroundColor = AppColors.warning.withOpacity(0.1);
        textColor = AppColors.warning;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        status.replaceAll('_', ' ').toUpperCase(),
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: textColor,
        ),
      ),
    );
  }
}
