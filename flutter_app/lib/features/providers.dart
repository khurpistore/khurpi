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
import 'package:khurpi_fresh/data/api/store_api_service.dart';

// Data Sources
import 'package:khurpi_fresh/data/datasources/remote/product_remote_datasource.dart';
import 'package:khurpi_fresh/data/datasources/remote/auth_remote_datasource.dart';
import 'package:khurpi_fresh/data/datasources/remote/order_remote_datasource.dart';
import 'package:khurpi_fresh/data/datasources/remote/banner_remote_datasource.dart';
import 'package:khurpi_fresh/data/datasources/remote/store_remote_datasource.dart';
import 'package:khurpi_fresh/data/datasources/local/cart_local_datasource.dart';
import 'package:khurpi_fresh/data/datasources/local/auth_local_datasource.dart';

// Feature Providers - not exported here to avoid circular dependencies.
// Import feature providers directly in pages/widgets.

part '../generated/features/providers.g.dart';

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

@Riverpod(keepAlive: true)
StoreApiService? provideStoreApiService(Ref ref) {
  final dio = ref.watch(provideDioProvider);
  if (dio == null) return null;
  return StoreApiService(dio);
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

@Riverpod(keepAlive: true)
StoreRemoteDataSource? provideStoreRemoteDataSource(Ref ref) {
  final apiService = ref.watch(provideStoreApiServiceProvider);
  if (apiService == null) return null;
  return StoreRemoteDataSourceImpl(apiService);
}
