import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/core/constants/app_text_styles.dart';
import 'package:khurpi_fresh/data/models/order_model.dart';
import 'package:khurpi_fresh/presentation/providers/providers.dart';
import 'package:intl/intl.dart';

class OrdersPage extends ConsumerStatefulWidget {
  const OrdersPage({super.key});

  @override
  ConsumerState<OrdersPage> createState() => _OrdersPageState();
}

class _OrdersPageState extends ConsumerState<OrdersPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(ordersViewModelProvider)?.loadOrders();
    });
  }

  @override
  Widget build(BuildContext context) {
    final ordersVM = ref.watch(ordersViewModelProvider);

    if (ordersVM == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final ordersState = ordersVM.state;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('My Orders'),
        backgroundColor: AppColors.surface,
        elevation: 0,
      ),
      body: ordersState.isLoading
          ? const Center(child: CircularProgressIndicator())
          : ordersState.orders.isEmpty
              ? _buildEmptyState()
              : RefreshIndicator(
                  onRefresh: () => ordersVM.loadOrders(),
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: ordersState.orders.length,
                    itemBuilder: (context, index) {
                      final order = ordersState.orders[index];
                      return _OrderCard(order: order);
                    },
                  ),
                ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.receipt_long_outlined, size: 80, color: AppColors.textHint.withValues(alpha: 0.5)),
          const SizedBox(height: 16),
          const Text('No orders yet', style: AppTextStyles.h4),
          const SizedBox(height: 8),
          Text('Your order history will appear here', style: AppTextStyles.body.copyWith(color: AppColors.textHint)),
        ],
      ),
    );
  }
}

class _OrderCard extends StatelessWidget {
  final OrderModel order;

  const _OrderCard({required this.order});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Order #${order.orderId.substring(0, 8).toUpperCase()}', style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w600)),
                    const SizedBox(height: 4),
                    Text(DateFormat('dd MMM yyyy, hh:mm a').format(order.createdAt), style: AppTextStyles.bodySmall.copyWith(color: AppColors.textHint)),
                  ],
                ),
                _buildStatusBadge(order.status),
              ],
            ),
          ),
          const Divider(height: 1),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('${order.items.length} item${order.items.length > 1 ? 's' : ''}', style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary)),
                const SizedBox(height: 8),
                ...order.items.take(3).map((item) => Padding(
                      padding: const EdgeInsets.only(bottom: 4),
                      child: Row(
                        children: [
                          Text('${item.quantity}x', style: AppTextStyles.bodySmall.copyWith(color: AppColors.primary)),
                          const SizedBox(width: 8),
                          Expanded(child: Text(item.productName, style: AppTextStyles.bodySmall, maxLines: 1, overflow: TextOverflow.ellipsis)),
                        ],
                      ),
                    )),
                if (order.items.length > 3)
                  Text('+${order.items.length - 3} more items', style: AppTextStyles.bodySmall.copyWith(color: AppColors.textHint)),
              ],
            ),
          ),
          const Divider(height: 1),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Total', style: AppTextStyles.body),
                Text('₹${order.total.toStringAsFixed(0)}', style: AppTextStyles.h4.copyWith(color: AppColors.primary)),
              ],
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
        backgroundColor = AppColors.success.withValues(alpha: 0.1);
        textColor = AppColors.success;
        break;
      case 'cancelled':
        backgroundColor = AppColors.error.withValues(alpha: 0.1);
        textColor = AppColors.error;
        break;
      default:
        backgroundColor = AppColors.warning.withValues(alpha: 0.1);
        textColor = AppColors.warning;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(color: backgroundColor, borderRadius: BorderRadius.circular(20)),
      child: Text(status.toUpperCase(), style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: textColor)),
    );
  }
}
