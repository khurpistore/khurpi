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

part 'providers.g.dart';

// ==================== Core Providers ====================

@Riverpod(keepAlive: true)
SharedPreferences sharedPreferences(SharedPreferencesRef ref) {
  throw UnimplementedError('SharedPreferences must be overridden in main');
}

@Riverpod(keepAlive: true)
Dio dio(DioRef ref) {
  return DioClient.instance;
}

// ==================== Retrofit API Service Providers ====================

@riverpod
ProductApiService productApiService(ProductApiServiceRef ref) {
  return ProductApiService(ref.watch(dioProvider));
}

@riverpod
AuthApiService authApiService(AuthApiServiceRef ref) {
  return AuthApiService(ref.watch(dioProvider));
}

@riverpod
OrderApiService orderApiService(OrderApiServiceRef ref) {
  return OrderApiService(ref.watch(dioProvider));
}

@riverpod
BannerApiService bannerApiService(BannerApiServiceRef ref) {
  return BannerApiService(ref.watch(dioProvider));
}

// ==================== Data Source Providers ====================

@riverpod
ProductRemoteDataSource productRemoteDataSource(ProductRemoteDataSourceRef ref) {
  return ProductRemoteDataSourceImpl(ref.watch(productApiServiceProvider));
}

@riverpod
AuthRemoteDataSource authRemoteDataSource(AuthRemoteDataSourceRef ref) {
  return AuthRemoteDataSourceImpl(ref.watch(authApiServiceProvider));
}

@Riverpod(keepAlive: true)
AuthLocalDataSource authLocalDataSource(AuthLocalDataSourceRef ref) {
  return AuthLocalDataSourceImpl(ref.watch(sharedPreferencesProvider));
}

@Riverpod(keepAlive: true)
CartLocalDataSource cartLocalDataSource(CartLocalDataSourceRef ref) {
  return CartLocalDataSourceImpl(ref.watch(sharedPreferencesProvider));
}

@riverpod
OrderRemoteDataSource orderRemoteDataSource(OrderRemoteDataSourceRef ref) {
  return OrderRemoteDataSourceImpl(ref.watch(orderApiServiceProvider));
}

@riverpod
BannerRemoteDataSource bannerRemoteDataSource(BannerRemoteDataSourceRef ref) {
  return BannerRemoteDataSourceImpl(ref.watch(bannerApiServiceProvider));
}
