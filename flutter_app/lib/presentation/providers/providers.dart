import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dio/dio.dart';

// Core
import 'package:khurpi_fresh/core/network/dio_client.dart';

// Retrofit API Services
import 'package:khurpi_fresh/data/api/product_api_service.dart';
import 'package:khurpi_fresh/data/api/auth_api_service.dart';
import 'package:khurpi_fresh/data/api/order_api_service.dart';
import 'package:khurpi_fresh/data/api/banner_api_service.dart';

// Data Sources
import 'package:khurpi_fresh/data/datasources/remote/product_remote_datasource.dart';
import 'package:khurpi_fresh/data/datasources/remote/auth_remote_datasource.dart';
import 'package:khurpi_fresh/data/datasources/remote/order_remote_datasource.dart';
import 'package:khurpi_fresh/data/datasources/remote/banner_remote_datasource.dart';
import 'package:khurpi_fresh/data/datasources/local/cart_local_datasource.dart';
import 'package:khurpi_fresh/data/datasources/local/auth_local_datasource.dart';

// ViewModels - exported for state classes
export 'package:khurpi_fresh/presentation/viewmodels/auth_viewmodel.dart';
export 'package:khurpi_fresh/presentation/viewmodels/products_viewmodel.dart';
export 'package:khurpi_fresh/presentation/viewmodels/cart_viewmodel.dart';
export 'package:khurpi_fresh/presentation/viewmodels/orders_viewmodel.dart';
export 'package:khurpi_fresh/presentation/viewmodels/product_detail_viewmodel.dart';
export 'package:khurpi_fresh/presentation/viewmodels/banners_viewmodel.dart';

// Also import for internal use
import 'package:khurpi_fresh/presentation/viewmodels/auth_viewmodel.dart';
import 'package:khurpi_fresh/presentation/viewmodels/products_viewmodel.dart';
import 'package:khurpi_fresh/presentation/viewmodels/cart_viewmodel.dart';
import 'package:khurpi_fresh/presentation/viewmodels/orders_viewmodel.dart';
import 'package:khurpi_fresh/presentation/viewmodels/product_detail_viewmodel.dart';
import 'package:khurpi_fresh/presentation/viewmodels/banners_viewmodel.dart';

part 'providers.g.dart';

// ==================== Core Providers ====================

final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError('SharedPreferences must be overridden in main');
});

@Riverpod(keepAlive: true)
Dio provideDio(Ref ref) {
  return DioClient.instance;
}

// ==================== Retrofit API Service Providers ====================

@Riverpod(keepAlive: true)
ProductApiService? provideProductApiService(Ref ref) {
  final dio = ref.watch(provideDioProvider);
  if (dio == null) return null;
  return ProductApiService(dio);
}

@Riverpod(keepAlive: true)
AuthApiService? provideAuthApiService(Ref ref) {
  final dio = ref.watch(provideDioProvider);
  if (dio == null) return null;
  return AuthApiService(dio);
}

@Riverpod(keepAlive: true)
OrderApiService? provideOrderApiService(Ref ref) {
  final dio = ref.watch(provideDioProvider);
  if (dio == null) return null;
  return OrderApiService(dio);
}

@Riverpod(keepAlive: true)
BannerApiService? provideBannerApiService(Ref ref) {
  final dio = ref.watch(provideDioProvider);
  if (dio == null) return null;
  return BannerApiService(dio);
}

// ==================== Data Source Providers ====================

@Riverpod(keepAlive: true)
ProductRemoteDataSource? provideProductRemoteDataSource(Ref ref) {
  final apiService = ref.watch(provideProductApiServiceProvider);
  if (apiService == null) return null;
  return ProductRemoteDataSourceImpl(apiService);
}

@Riverpod(keepAlive: true)
AuthRemoteDataSource? provideAuthRemoteDataSource(Ref ref) {
  final apiService = ref.watch(provideAuthApiServiceProvider);
  if (apiService == null) return null;
  return AuthRemoteDataSourceImpl(apiService);
}

@Riverpod(keepAlive: true)
AuthLocalDataSource? provideAuthLocalDataSource(Ref ref) {
  final sharedPreferences = ref.watch(sharedPreferencesProvider);
  return AuthLocalDataSourceImpl(sharedPreferences);
}

@Riverpod(keepAlive: true)
CartLocalDataSource? provideCartLocalDataSource(Ref ref) {
  final sharedPreferences = ref.watch(sharedPreferencesProvider);
  return CartLocalDataSourceImpl(sharedPreferences);
}

@Riverpod(keepAlive: true)
OrderRemoteDataSource? provideOrderRemoteDataSource(Ref ref) {
  final apiService = ref.watch(provideOrderApiServiceProvider);
  if (apiService == null) return null;
  return OrderRemoteDataSourceImpl(apiService);
}

@Riverpod(keepAlive: true)
BannerRemoteDataSource? provideBannerRemoteDataSource(Ref ref) {
  final apiService = ref.watch(provideBannerApiServiceProvider);
  if (apiService == null) return null;
  return BannerRemoteDataSourceImpl(apiService);
}

// ==================== ViewModel Providers ====================

@Riverpod(keepAlive: true)
AuthViewModel? provideAuthViewModel(Ref ref) {
  final authRemoteDataSource = ref.watch(provideAuthRemoteDataSourceProvider);
  final authLocalDataSource = ref.watch(provideAuthLocalDataSourceProvider);

  if (authRemoteDataSource == null || authLocalDataSource == null) {
    return null;
  }

  return AuthViewModel(
    authRemoteDataSource: authRemoteDataSource,
    authLocalDataSource: authLocalDataSource,
  );
}

@Riverpod(keepAlive: true)
ProductsViewModel? provideProductsViewModel(Ref ref) {
  final productRemoteDataSource = ref.watch(provideProductRemoteDataSourceProvider);

  if (productRemoteDataSource == null) {
    return null;
  }

  return ProductsViewModel(
    productRemoteDataSource: productRemoteDataSource,
  );
}

@Riverpod(keepAlive: true)
CartViewModel? provideCartViewModel(Ref ref) {
  final cartLocalDataSource = ref.watch(provideCartLocalDataSourceProvider);

  if (cartLocalDataSource == null) {
    return null;
  }

  return CartViewModel(
    cartLocalDataSource: cartLocalDataSource,
  );
}

@Riverpod(keepAlive: true)
OrdersViewModel? provideOrdersViewModel(Ref ref) {
  final orderRemoteDataSource = ref.watch(provideOrderRemoteDataSourceProvider);

  if (orderRemoteDataSource == null) {
    return null;
  }

  return OrdersViewModel(
    orderRemoteDataSource: orderRemoteDataSource,
  );
}

@riverpod
ProductDetailViewModel? provideProductDetailViewModel(Ref ref) {
  final productRemoteDataSource = ref.watch(provideProductRemoteDataSourceProvider);

  if (productRemoteDataSource == null) {
    return null;
  }

  return ProductDetailViewModel(
    productRemoteDataSource: productRemoteDataSource,
  );
}

@Riverpod(keepAlive: true)
BannersViewModel? provideBannersViewModel(Ref ref) {
  final bannerRemoteDataSource = ref.watch(provideBannerRemoteDataSourceProvider);

  if (bannerRemoteDataSource == null) {
    return null;
  }

  return BannersViewModel(
    bannerRemoteDataSource: bannerRemoteDataSource,
  );
}

// ==================== Legacy Providers for UI Compatibility ====================
// These wrap the @riverpod providers for use with ref.watch() in UI

final authViewModelProvider = Provider<AuthViewModel?>((ref) {
  return ref.watch(provideAuthViewModelProvider);
});

final productsViewModelProvider = Provider<ProductsViewModel?>((ref) {
  return ref.watch(provideProductsViewModelProvider);
});

final cartViewModelProvider = Provider<CartViewModel?>((ref) {
  return ref.watch(provideCartViewModelProvider);
});

final ordersViewModelProvider = Provider<OrdersViewModel?>((ref) {
  return ref.watch(provideOrdersViewModelProvider);
});

final productDetailViewModelProvider = Provider.autoDispose<ProductDetailViewModel?>((ref) {
  return ref.watch(provideProductDetailViewModelProvider);
});

final bannersViewModelProvider = Provider<BannersViewModel?>((ref) {
  return ref.watch(provideBannersViewModelProvider);
});
