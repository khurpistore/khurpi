import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:khurpi_fresh/core/constants/app_colors.dart';
import 'package:khurpi_fresh/data/models/product_model.dart';
import 'package:khurpi_fresh/features/vendor/vendor_providers.dart';

class VendorProductsPage extends ConsumerStatefulWidget {
  const VendorProductsPage({super.key});

  @override
  ConsumerState<VendorProductsPage> createState() => _VendorProductsPageState();
}

class _VendorProductsPageState extends ConsumerState<VendorProductsPage> {
  String _search = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(vendorProductsViewModelProvider.notifier).loadProducts();
    });
  }

  List<ProductModel> _filter(List<ProductModel> products) {
    if (_search.trim().isEmpty) return products;
    final q = _search.toLowerCase();
    return products.where((p) => p.name.toLowerCase().contains(q)).toList();
  }

  Future<void> _openEditSheet(ProductModel product) async {
    final priceCtrl = TextEditingController(text: product.price.toStringAsFixed(0));
    final mrpCtrl = TextEditingController(text: product.mrp != null ? product.mrp!.toStringAsFixed(0) : '');
    final stockCtrl = TextEditingController(text: product.stockQuantity.toString());
    final unit = (product.unit ?? '').trim();
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
                bottom: MediaQuery.of(ctx).viewInsets.bottom + MediaQuery.of(ctx).padding.bottom + 24,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(product.name,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                  if (unit.isNotEmpty) ...[
                    const SizedBox(height: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text('Unit: $unit',
                          style: TextStyle(color: AppColors.primary, fontSize: 12, fontWeight: FontWeight.w600)),
                    ),
                  ],
                  const SizedBox(height: 20),
                  _field('Selling Price (₹)', priceCtrl),
                  const SizedBox(height: 14),
                  _field('MRP (₹)', mrpCtrl),
                  const SizedBox(height: 14),
                  _field(unit.isNotEmpty ? 'Stock Quantity ($unit)' : 'Stock Quantity', stockCtrl, isInt: true),
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
                              final ok = await ref.read(vendorProductsViewModelProvider.notifier).updateProduct(
                                    product.productId,
                                    price: double.tryParse(priceCtrl.text.trim()),
                                    mrp: double.tryParse(mrpCtrl.text.trim()),
                                    stockQuantity: int.tryParse(stockCtrl.text.trim()),
                                  );
                              if (!ctx.mounted) return;
                              if (ok) {
                                Navigator.pop(ctx);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: const Text('Product updated'), backgroundColor: AppColors.primary),
                                );
                              } else {
                                setSheet(() => saving = false);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Update failed. Please try again.')),
                                );
                              }
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

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(vendorProductsViewModelProvider);
    final products = _filter(state.products);

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
              onRefresh: () => ref.read(vendorProductsViewModelProvider.notifier).loadProducts(),
              child: state.isLoading && state.products.isEmpty
                  ? const Center(child: CircularProgressIndicator())
                  : state.errorMessage != null && state.products.isEmpty
                      ? _buildError(state.errorMessage!)
                      : products.isEmpty
                          ? _buildEmpty()
                          : ListView.separated(
                              padding: const EdgeInsets.fromLTRB(12, 0, 12, 20),
                              itemCount: products.length,
                              separatorBuilder: (_, __) => const SizedBox(height: 8),
                              itemBuilder: (context, i) => _buildProductRow(products[i]),
                            ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildError(String message) => ListView(children: [
        const SizedBox(height: 120),
        Icon(Icons.error_outline, size: 48, color: AppColors.error),
        const SizedBox(height: 12),
        Center(child: Text(message, textAlign: TextAlign.center)),
        const SizedBox(height: 16),
        Center(
          child: ElevatedButton(
            onPressed: () => ref.read(vendorProductsViewModelProvider.notifier).loadProducts(),
            child: const Text('Retry'),
          ),
        ),
      ]);

  Widget _buildEmpty() => ListView(children: [
        const SizedBox(height: 140),
        Icon(Icons.inventory_2_outlined, size: 56, color: AppColors.textHint),
        const SizedBox(height: 12),
        Center(child: Text('No products found', style: TextStyle(color: AppColors.textSecondary, fontSize: 16))),
      ]);

  Widget _buildProductRow(ProductModel p) {
    final image = p.galleryImages.isNotEmpty ? p.galleryImages.first : p.imageUrl;
    final mrp = p.mrp;
    final price = p.price;
    final stock = p.stockQuantity;
    final unit = (p.unit ?? '').trim();

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
                  Text(p.name,
                      maxLines: 2, overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15, height: 1.2)),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Text('₹${price.toStringAsFixed(0)}',
                          style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 15)),
                      const SizedBox(width: 8),
                      if (mrp != null && mrp > price)
                        Text('₹${mrp.toStringAsFixed(0)}',
                            style: TextStyle(
                                color: AppColors.textHint,
                                fontSize: 13,
                                decoration: TextDecoration.lineThrough)),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text('Stock: $stock${unit.isNotEmpty ? ' $unit' : ''}',
                      style: TextStyle(
                          color: stock > 0 ? AppColors.textSecondary : AppColors.error, fontSize: 12)),
                ],
              ),
            ),
            const SizedBox(width: 8),
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
