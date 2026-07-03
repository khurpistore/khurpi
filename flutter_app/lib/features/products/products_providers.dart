import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:khurpi_fresh/features/products/products_viewmodel.dart';
import 'package:khurpi_fresh/features/products/product_detail_viewmodel.dart';
import 'package:khurpi_fresh/features/providers.dart';

export 'package:khurpi_fresh/features/products/products_viewmodel.dart';
export 'package:khurpi_fresh/features/products/product_detail_viewmodel.dart';

// ==================== Products ViewModel Provider ====================

final provideProductsViewModelProvider = Provider<ProductsState?>(
  (ref) {
    final productDS = ref.watch(provideProductRemoteDataSourceProvider);

    if (productDS == null) return null;

    return ref.watch(
      productsViewModelProvider(productRemoteDataSource: productDS),
    );
  },
);

final provideProductsViewModelNotifierProvider =
    Provider<ProductsViewModel?>(
  (ref) {
    final productDS = ref.watch(provideProductRemoteDataSourceProvider);

    if (productDS == null) return null;

    return ref.watch(
      productsViewModelProvider(productRemoteDataSource: productDS).notifier,
    );
  },
);

// ==================== Product Detail ViewModel Provider ====================

final provideProductDetailViewModelProvider = Provider<ProductDetailState?>(
  (ref) {
    final productDS = ref.watch(provideProductRemoteDataSourceProvider);

    if (productDS == null) return null;

    return ref.watch(
      productDetailViewModelProvider(productRemoteDataSource: productDS),
    );
  },
);

final provideProductDetailViewModelNotifierProvider =
    Provider<ProductDetailViewModel?>(
  (ref) {
    final productDS = ref.watch(provideProductRemoteDataSourceProvider);

    if (productDS == null) return null;

    return ref.watch(
      productDetailViewModelProvider(productRemoteDataSource: productDS).notifier,
    );
  },
);

