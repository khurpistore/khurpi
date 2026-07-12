import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:dio/dio.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/core/network/dio_client.dart';

class VendorProductsPage extends StatefulWidget {
  const VendorProductsPage({super.key});

  @override
  State<VendorProductsPage> createState() => _VendorProductsPageState();
}

class _VendorProductsPageState extends State<VendorProductsPage> {
  final _dio = DioClient.instance;
  bool _loading = true;
  String? _error;
  List<dynamic> _products = [];
  String _search = '';

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
      final res = await _dio.get('/vendor/products');
      setState(() {
        _products = res.data as List<dynamic>;
        _loading = false;
      });
    } on DioException catch (e) {
      setState(() {
        _error = e.response?.data is Map
            ? (e.response?.data['detail']?.toString() ?? 'Failed to load products')
            : 'Failed to load products';
        _loading = false;
      });
    }
  }

  List<dynamic> get _filtered {
    if (_search.trim().isEmpty) return _products;
    final q = _search.toLowerCase();
    return _products.where((p) => (p['name']?.toString().toLowerCase() ?? '').contains(q)).toList();
  }

  Future<void> _openEditSheet(Map<String, dynamic> product) async {
    final priceCtrl = TextEditingController(text: (product['price'] ?? '').toString());
    final mrpCtrl = TextEditingController(text: (product['mrp'] ?? '').toString());
    final stockCtrl = TextEditingController(text: (product['stock_quantity'] ?? 0).toString());
    bool saving = false;

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setSheet) {
            return Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 20,
                bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(product['name']?.toString() ?? 'Product',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                  const SizedBox(height: 20),
                  _field('Selling Price (₹)', priceCtrl),
                  const SizedBox(height: 14),
                  _field('MRP (₹)', mrpCtrl),
                  const SizedBox(height: 14),
                  _field('Stock Quantity', stockCtrl, isInt: true),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: saving
                          ? null
                          : () async {
                              setSheet(() => saving = true);
                              final ok = await _save(
                                product['id'].toString(),
                                price: double.tryParse(priceCtrl.text.trim()),
                                mrp: double.tryParse(mrpCtrl.text.trim()),
                                stock: int.tryParse(stockCtrl.text.trim()),
                              );
                              if (ok && ctx.mounted) Navigator.pop(ctx);
                              if (!ok) setSheet(() => saving = false);
                            },
                      child: saving
                          ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Text('Save Changes', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _field(String label, TextEditingController ctrl, {bool isInt = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(color: AppColors.textSecondary, fontSize: 13, fontWeight: FontWeight.w500)),
        const SizedBox(height: 6),
        TextField(
          controller: ctrl,
          keyboardType: TextInputType.numberWithOptions(decimal: !isInt),
          inputFormatters: isInt
              ? [FilteringTextInputFormatter.digitsOnly]
              : [FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d*'))],
          decoration: InputDecoration(
            isDense: true,
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
          ),
        ),
      ],
    );
  }

  Future<bool> _save(String productId, {double? price, double? mrp, int? stock}) async {
    try {
      final data = <String, dynamic>{};
      if (price != null) data['price'] = price;
      if (mrp != null) data['mrp'] = mrp;
      if (stock != null) data['stock_quantity'] = stock;
      final res = await _dio.put('/vendor/products/$productId', data: data);
      setState(() {
        final idx = _products.indexWhere((p) => p['id'] == productId);
        if (idx != -1) {
          _products[idx]['price'] = res.data['price'];
          _products[idx]['mrp'] = res.data['mrp'];
          _products[idx]['stock_quantity'] = res.data['stock_quantity'];
        }
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: const Text('Product updated'), backgroundColor: AppColors.primary),
        );
      }
      return true;
    } on DioException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.response?.data is Map ? (e.response?.data['detail']?.toString() ?? 'Update failed') : 'Update failed')),
        );
      }
      return false;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Manage Products'),
        backgroundColor: AppColors.surface,
        elevation: 0,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: TextField(
              onChanged: (v) => setState(() => _search = v),
              decoration: InputDecoration(
                hintText: 'Search products',
                prefixIcon: const Icon(Icons.search),
                isDense: true,
                filled: true,
                fillColor: AppColors.surface,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
            ),
          ),
          Expanded(
            child: RefreshIndicator(
              onRefresh: _load,
              child: _loading
                  ? const Center(child: CircularProgressIndicator())
                  : _error != null
                      ? _buildError()
                      : _filtered.isEmpty
                          ? _buildEmpty()
                          : ListView.separated(
                              padding: const EdgeInsets.fromLTRB(12, 0, 12, 20),
                              itemCount: _filtered.length,
                              separatorBuilder: (_, __) => const SizedBox(height: 8),
                              itemBuilder: (context, i) => _buildProductRow(_filtered[i]),
                            ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildError() => ListView(children: [
        const SizedBox(height: 120),
        Icon(Icons.error_outline, size: 48, color: AppColors.error),
        const SizedBox(height: 12),
        Center(child: Text(_error!, textAlign: TextAlign.center)),
        const SizedBox(height: 16),
        Center(child: ElevatedButton(onPressed: _load, child: const Text('Retry'))),
      ]);

  Widget _buildEmpty() => ListView(children: [
        const SizedBox(height: 140),
        Icon(Icons.inventory_2_outlined, size: 56, color: AppColors.textHint),
        const SizedBox(height: 12),
        Center(child: Text('No products found', style: TextStyle(color: AppColors.textSecondary, fontSize: 16))),
      ]);

  Widget _buildProductRow(Map<String, dynamic> p) {
    final image = p['image_url']?.toString();
    final mrp = p['mrp'];
    final price = p['price'];
    final stock = p['stock_quantity'] ?? 0;

    return InkWell(
      onTap: () => _openEditSheet(p),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 6, offset: const Offset(0, 2))],
        ),
        padding: const EdgeInsets.all(10),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: image != null && image.isNotEmpty
                  ? Image.network(image, width: 56, height: 56, fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => _imgPlaceholder())
                  : _imgPlaceholder(),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(p['name']?.toString() ?? 'Product',
                      maxLines: 1, overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Text('₹${(price ?? 0).toStringAsFixed(0)}',
                          style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 15)),
                      const SizedBox(width: 8),
                      if (mrp != null && (mrp as num) > (price ?? 0))
                        Text('₹${mrp.toStringAsFixed(0)}',
                            style: TextStyle(
                                color: AppColors.textHint,
                                fontSize: 13,
                                decoration: TextDecoration.lineThrough)),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text('Stock: $stock',
                      style: TextStyle(
                          color: (stock as num) > 0 ? AppColors.textSecondary : AppColors.error, fontSize: 12)),
                ],
              ),
            ),
            Icon(Icons.edit_outlined, color: AppColors.primary, size: 20),
          ],
        ),
      ),
    );
  }

  Widget _imgPlaceholder() => Container(
        width: 56,
        height: 56,
        color: AppColors.primary.withOpacity(0.08),
        child: Icon(Icons.image_outlined, color: AppColors.primary.withOpacity(0.5)),
      );
}
