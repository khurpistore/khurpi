import 'package:flutter_riverpod/flutter_riverpod.dart';
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

// ==================== Core Providers ====================

final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError('SharedPreferences must be overridden in main');
});

final dioProvider = Provider<Dio>((ref) {
  return DioClient.instance;
});

// ==================== Retrofit API Service Providers ====================

final productApiServiceProvider = Provider<ProductApiService>((ref) {
  final dio = ref.watch(dioProvider);
  return ProductApiService(dio);
});

final authApiServiceProvider = Provider<AuthApiService>((ref) {
  final dio = ref.watch(dioProvider);
  return AuthApiService(dio);
});

final orderApiServiceProvider = Provider<OrderApiService>((ref) {
  final dio = ref.watch(dioProvider);
  return OrderApiService(dio);
});

final bannerApiServiceProvider = Provider<BannerApiService>((ref) {
  final dio = ref.watch(dioProvider);
  return BannerApiService(dio);
});

// ==================== Data Source Providers ====================

final productRemoteDataSourceProvider = Provider<ProductRemoteDataSource>((ref) {
  final apiService = ref.watch(productApiServiceProvider);
  return ProductRemoteDataSourceImpl(apiService);
});

final authRemoteDataSourceProvider = Provider<AuthRemoteDataSource>((ref) {
  final apiService = ref.watch(authApiServiceProvider);
  return AuthRemoteDataSourceImpl(apiService);
});

final authLocalDataSourceProvider = Provider<AuthLocalDataSource>((ref) {
  final sharedPreferences = ref.watch(sharedPreferencesProvider);
  return AuthLocalDataSourceImpl(sharedPreferences);
});

final cartLocalDataSourceProvider = Provider<CartLocalDataSource>((ref) {
  final sharedPreferences = ref.watch(sharedPreferencesProvider);
  return CartLocalDataSourceImpl(sharedPreferences);
});

final orderRemoteDataSourceProvider = Provider<OrderRemoteDataSource>((ref) {
  final apiService = ref.watch(orderApiServiceProvider);
  return OrderRemoteDataSourceImpl(apiService);
});

final bannerRemoteDataSourceProvider = Provider<BannerRemoteDataSource>((ref) {
  final apiService = ref.watch(bannerApiServiceProvider);
  return BannerRemoteDataSourceImpl(apiService);
});

// ==================== ViewModel Providers ====================

/// Auth ViewModel Provider - manages authentication state
final provideAuthViewModelProvider = Provider<AuthViewModel?>((ref) {
  final authRemoteDataSource = ref.watch(authRemoteDataSourceProvider);
  final authLocalDataSource = ref.watch(authLocalDataSourceProvider);

  return AuthViewModel(
    authRemoteDataSource: authRemoteDataSource,
    authLocalDataSource: authLocalDataSource,
  );
});

final authViewModelProvider = StateNotifierProvider<AuthViewModel, AuthState>((ref) {
  final authRemoteDataSource = ref.watch(authRemoteDataSourceProvider);
  final authLocalDataSource = ref.watch(authLocalDataSourceProvider);

  return AuthViewModel(
    authRemoteDataSource: authRemoteDataSource,
    authLocalDataSource: authLocalDataSource,
  );
});

/// Products ViewModel Provider - manages products list state
final provideProductsViewModelProvider = Provider<ProductsViewModel?>((ref) {
  final productRemoteDataSource = ref.watch(productRemoteDataSourceProvider);

  return ProductsViewModel(
    productRemoteDataSource: productRemoteDataSource,
  );
});

final productsViewModelProvider = StateNotifierProvider<ProductsViewModel, ProductsState>((ref) {
  final productRemoteDataSource = ref.watch(productRemoteDataSourceProvider);

  return ProductsViewModel(
    productRemoteDataSource: productRemoteDataSource,
  );
});

/// Cart ViewModel Provider - manages cart state
final provideCartViewModelProvider = Provider<CartViewModel?>((ref) {
  final cartLocalDataSource = ref.watch(cartLocalDataSourceProvider);

  return CartViewModel(
    cartLocalDataSource: cartLocalDataSource,
  );
});

final cartViewModelProvider = StateNotifierProvider<CartViewModel, CartState>((ref) {
  final cartLocalDataSource = ref.watch(cartLocalDataSourceProvider);

  return CartViewModel(
    cartLocalDataSource: cartLocalDataSource,
  );
});

/// Orders ViewModel Provider - manages orders state
final provideOrdersViewModelProvider = Provider<OrdersViewModel?>((ref) {
  final orderRemoteDataSource = ref.watch(orderRemoteDataSourceProvider);

  return OrdersViewModel(
    orderRemoteDataSource: orderRemoteDataSource,
  );
});

final ordersViewModelProvider = StateNotifierProvider<OrdersViewModel, OrdersState>((ref) {
  final orderRemoteDataSource = ref.watch(orderRemoteDataSourceProvider);

  return OrdersViewModel(
    orderRemoteDataSource: orderRemoteDataSource,
  );
});

/// Product Detail ViewModel Provider - manages product detail state
final provideProductDetailViewModelProvider = Provider.autoDispose<ProductDetailViewModel?>((ref) {
  final productRemoteDataSource = ref.watch(productRemoteDataSourceProvider);

  return ProductDetailViewModel(
    productRemoteDataSource: productRemoteDataSource,
  );
});

final productDetailViewModelProvider = StateNotifierProvider.autoDispose<ProductDetailViewModel, ProductDetailState>((ref) {
  final productRemoteDataSource = ref.watch(productRemoteDataSourceProvider);

  return ProductDetailViewModel(
    productRemoteDataSource: productRemoteDataSource,
  );
});

/// Banners ViewModel Provider - manages banners state
final provideBannersViewModelProvider = Provider<BannersViewModel?>((ref) {
  final bannerRemoteDataSource = ref.watch(bannerRemoteDataSourceProvider);

  return BannersViewModel(
    bannerRemoteDataSource: bannerRemoteDataSource,
  );
});

final bannersViewModelProvider = StateNotifierProvider<BannersViewModel, BannersState>((ref) {
  final bannerRemoteDataSource = ref.watch(bannerRemoteDataSourceProvider);

  return BannersViewModel(
    bannerRemoteDataSource: bannerRemoteDataSource,
  );
});
