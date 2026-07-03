import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:khurpi_fresh/features/cart/cart_viewmodel.dart';
import 'package:khurpi_fresh/features/providers.dart';

export 'package:khurpi_fresh/features/cart/cart_viewmodel.dart';

// ==================== Cart ViewModel Provider ====================

final provideCartViewModelProvider = Provider<CartState?>(
  (ref) {
    final cartDS = ref.watch(provideCartLocalDataSourceProvider);
    final prefs = ref.watch(sharedPreferencesProvider);

    if (cartDS == null) return null;

    return ref.watch(
      cartViewModelProvider(
        cartLocalDataSource: cartDS,
        sharedPreferences: prefs,
      ),
    );
  },
);

final provideCartViewModelNotifierProvider = Provider<CartViewModel?>(
  (ref) {
    final cartDS = ref.watch(provideCartLocalDataSourceProvider);
    final prefs = ref.watch(sharedPreferencesProvider);

    if (cartDS == null) return null;

    return ref.watch(
      cartViewModelProvider(
        cartLocalDataSource: cartDS,
        sharedPreferences: prefs,
      ).notifier,
    );
  },
);

