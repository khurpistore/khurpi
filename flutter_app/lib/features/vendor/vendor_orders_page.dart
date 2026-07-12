import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:intl/intl.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/core/network/dio_client.dart';

class VendorOrdersPage extends StatefulWidget {
  const VendorOrdersPage({super.key});

  @override
  State<VendorOrdersPage> createState() => _VendorOrdersPageState();
}

class _VendorOrdersPageState extends State<VendorOrdersPage> {
  final _dio = DioClient.instance;
  bool _loading = true;
  String? _error;
  List<dynamic> _orders = [];
  List<String> _statuses = [];
  final Set<String> _updating = {};

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final statusRes = await _dio.get('/vendor/order-statuses');
      final ordersRes = await _dio.get('/vendor/orders');
      setState(() {
        _statuses = List<String>.from(statusRes.data['statuses'] ?? []);
        _orders = ordersRes.data as List<dynamic>;
        _loading = false;
      });
    } on DioException catch (e) {
      setState(() {
        _error = e.response?.data is Map
            ? (e.response?.data['detail']?.toString() ?? 'Failed to load orders')
            : 'Failed to load orders';
        _loading = false;
      });
    }
  }

  Future<void> _updateStatus(String orderId, String status) async {
    setState(() => _updating.add(orderId));
    try {
      await _dio.put('/vendor/orders/$orderId/status', data: {'status': status});
      setState(() {
        final idx = _orders.indexWhere((o) => o['id'] == orderId);
        if (idx != -1) _orders[idx]['status'] = status;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Order marked as ${_prettify(status)}'), backgroundColor: AppColors.primary),
        );
      }
    } on DioException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.response?.data is Map ? (e.response?.data['detail']?.toString() ?? 'Update failed') : 'Update failed')),
        );
      }
    } finally {
      if (mounted) setState(() => _updating.remove(orderId));
    }
  }

  String _prettify(String s) =>
      s.replaceAll('_', ' ').split(' ').map((w) => w.isEmpty ? w : '${w[0].toUpperCase()}${w.substring(1)}').join(' ');

  Color _statusColor(String status) {
    switch (status) {
      case 'delivered':
        return Colors.green;
      case 'cancelled':
        return Colors.red;
      case 'out_for_delivery':
        return Colors.orange;
      case 'preparing':
        return Colors.blue;
      case 'confirmed':
        return Colors.teal;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Manage Orders'),
        backgroundColor: AppColors.surface,
        elevation: 0,
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : _error != null
                ? _buildError()
                : _orders.isEmpty
                    ? _buildEmpty()
                    : ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: _orders.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 12),
                        itemBuilder: (context, i) => _buildOrderCard(_orders[i]),
                      ),
      ),
    );
  }

  Widget _buildError() => ListView(
        children: [
          const SizedBox(height: 120),
          Icon(Icons.error_outline, size: 48, color: AppColors.error),
          const SizedBox(height: 12),
          Center(child: Text(_error!, textAlign: TextAlign.center)),
          const SizedBox(height: 16),
          Center(
            child: ElevatedButton(onPressed: _load, child: const Text('Retry')),
          ),
        ],
      );

  Widget _buildEmpty() => ListView(
        children: [
          const SizedBox(height: 140),
          Icon(Icons.receipt_long_outlined, size: 56, color: AppColors.textHint),
          const SizedBox(height: 12),
          Center(child: Text('No orders yet', style: TextStyle(color: AppColors.textSecondary, fontSize: 16))),
        ],
      );

  Widget _buildOrderCard(Map<String, dynamic> order) {
    final orderId = order['id']?.toString() ?? '';
    final status = order['status']?.toString() ?? 'pending';
    final items = (order['items'] as List<dynamic>? ?? []);
    final createdAt = order['created_at']?.toString();
    String dateText = '';
    if (createdAt != null) {
      try {
        dateText = DateFormat('dd MMM, hh:mm a').format(DateTime.parse(createdAt).toLocal());
      } catch (_) {}
    }
    final isUpdating = _updating.contains(orderId);

    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8, offset: const Offset(0, 3))],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(order['customer_name']?.toString() ?? 'Customer',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    const SizedBox(height: 2),
                    Text(order['customer_phone']?.toString() ?? '',
                        style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: _statusColor(status).withOpacity(0.12),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(_prettify(status),
                    style: TextStyle(color: _statusColor(status), fontWeight: FontWeight.w600, fontSize: 12)),
              ),
            ],
          ),
          if (dateText.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(dateText, style: TextStyle(color: AppColors.textHint, fontSize: 12)),
          ],
          if ((order['address']?.toString() ?? '').isNotEmpty) ...[
            const SizedBox(height: 8),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.location_on_outlined, size: 16, color: AppColors.textSecondary),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(order['address'].toString(),
                      style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                ),
              ],
            ),
          ],
          const Divider(height: 20),
          ...items.map((item) {
            final qty = item['quantity'];
            final unit = item['unit']?.toString() ?? '';
            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 2),
              child: Row(
                children: [
                  Expanded(child: Text(item['product_name']?.toString() ?? 'Item', style: const TextStyle(fontSize: 14))),
                  Text('x$qty${unit.isNotEmpty ? ' $unit' : ''}',
                      style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                ],
              ),
            );
          }),
          const SizedBox(height: 8),
          Row(
            children: [
              const Text('Total', style: TextStyle(fontWeight: FontWeight.w600)),
              const Spacer(),
              Text('₹${(order['total'] ?? 0).toStringAsFixed(0)}',
                  style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary, fontSize: 16)),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              const Text('Update status:', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
              const SizedBox(width: 10),
              Expanded(
                child: isUpdating
                    ? const Align(alignment: Alignment.centerLeft, child: SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2)))
                    : Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        decoration: BoxDecoration(
                          border: Border.all(color: AppColors.primary.withOpacity(0.4)),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            isExpanded: true,
                            value: _statuses.contains(status) ? status : null,
                            hint: const Text('Select'),
                            items: _statuses
                                .map((s) => DropdownMenuItem(value: s, child: Text(_prettify(s))))
                                .toList(),
                            onChanged: (val) {
                              if (val != null && val != status) _updateStatus(orderId, val);
                            },
                          ),
                        ),
                      ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
