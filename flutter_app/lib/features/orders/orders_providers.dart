import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:khurpi_fresh/features/orders/orders_viewmodel.dart';
import 'package:khurpi_fresh/features/providers.dart';

export 'package:khurpi_fresh/features/orders/orders_viewmodel.dart';

// ==================== Orders ViewModel Provider ====================

final provideOrdersViewModelProvider = Provider<OrdersState?>(
  (ref) {
    final orderDS = ref.watch(provideOrderRemoteDataSourceProvider);

    if (orderDS == null) return null;

    return ref.watch(
      ordersViewModelProvider(orderRemoteDataSource: orderDS),
    );
  },
);

final provideOrdersViewModelNotifierProvider = Provider<OrdersViewModel?>(
  (ref) {
    final orderDS = ref.watch(provideOrderRemoteDataSourceProvider);

    if (orderDS == null) return null;

    return ref.watch(
      ordersViewModelProvider(orderRemoteDataSource: orderDS).notifier,
    );
  },
);

