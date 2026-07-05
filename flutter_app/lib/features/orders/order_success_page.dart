import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/data/models/order_model.dart';

class OrderSuccessPage extends StatelessWidget {
  final OrderModel order;

  const OrderSuccessPage({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const Spacer(flex: 1),
              
              // Success Animation Container
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  color: AppColors.success.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Container(
                    width: 80,
                    height: 80,
                    decoration: const BoxDecoration(
                      color: AppColors.success,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.check_rounded,
                      color: Colors.white,
                      size: 48,
                    ),
                  ),
                ),
              ),
              
              const SizedBox(height: 32),
              
              // Success Title
              const Text(
                'Order Placed!',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF1A1A2E),
                ),
              ),
              
              const SizedBox(height: 12),
              
              Text(
                'Your order has been placed successfully',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey.shade600,
                ),
                textAlign: TextAlign.center,
              ),
              
              const SizedBox(height: 40),
              
              // Order Details Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8F9FA),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE8E8E8)),
                ),
                child: Column(
                  children: [
                    // Order ID
                    _buildDetailRow(
                      'Order ID',
                      '#${order.orderId.substring(0, 8).toUpperCase()}',
                      showCopy: true,
                      fullId: order.orderId,
                      context: context,
                    ),
                    const Divider(height: 24),
                    
                    // Items Count
                    _buildDetailRow(
                      'Items',
                      '${order.allItems.length} item${order.allItems.length > 1 ? 's' : ''}',
                    ),
                    const Divider(height: 24),
                    
                    // Total Amount
                    _buildDetailRow(
                      'Total Amount',
                      '₹${order.total.toStringAsFixed(0)}',
                      isHighlight: true,
                    ),
                    const Divider(height: 24),
                    
                    // Payment Method
                    _buildDetailRow(
                      'Payment',
                      order.paymentMethod.toUpperCase() == 'COD' 
                          ? 'Cash on Delivery' 
                          : 'Paid Online',
                      icon: order.paymentMethod.toUpperCase() == 'COD'
                          ? Icons.money_rounded
                          : Icons.check_circle_rounded,
                      iconColor: order.paymentMethod.toUpperCase() == 'COD'
                          ? Colors.orange
                          : AppColors.success,
                    ),
                    const Divider(height: 24),
                    
                    // Delivery
                    _buildDetailRow(
                      'Delivery',
                      order.deliveryType == 'instant' ? 'Express Delivery' : 'Tomorrow',
                      icon: Icons.local_shipping_rounded,
                      iconColor: AppColors.primary,
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 24),
              
              // Delivery Address
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.primary.withOpacity(0.2)),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        Icons.location_on_rounded,
                        color: AppColors.primary,
                        size: 22,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Delivering to',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            order.deliveryAddress.isNotEmpty 
                                ? order.deliveryAddress 
                                : 'Your saved address',
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                              color: Color(0xFF1A1A2E),
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              
              const Spacer(flex: 2),
              
              // Buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {
                        Navigator.popUntil(context, (route) => route.isFirst);
                      },
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        side: BorderSide(color: AppColors.primary),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: Text(
                        'Back to Home',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        // Navigate to order tracking
                        Navigator.popUntil(context, (route) => route.isFirst);
                        // TODO: Navigate to orders page
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text(
                        'Track Order',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(
    String label,
    String value, {
    bool isHighlight = false,
    bool showCopy = false,
    String? fullId,
    BuildContext? context,
    IconData? icon,
    Color? iconColor,
  }) {
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
        Row(
          children: [
            if (icon != null) ...[
              Icon(icon, size: 18, color: iconColor ?? AppColors.primary),
              const SizedBox(width: 6),
            ],
            Text(
              value,
              style: TextStyle(
                fontSize: isHighlight ? 18 : 14,
                fontWeight: isHighlight ? FontWeight.w700 : FontWeight.w600,
                color: isHighlight ? AppColors.primary : const Color(0xFF1A1A2E),
              ),
            ),
            if (showCopy && context != null) ...[
              const SizedBox(width: 8),
              GestureDetector(
                onTap: () {
                  Clipboard.setData(ClipboardData(text: fullId ?? value));
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Order ID copied!'),
                      duration: Duration(seconds: 1),
                    ),
                  );
                },
                child: Icon(
                  Icons.copy_rounded,
                  size: 16,
                  color: Colors.grey.shade400,
                ),
              ),
            ],
          ],
        ),
      ],
    );
  }
}
