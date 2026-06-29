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

// Repositories
import 'package:khurpi_fresh/data/repositories/product_repository_impl.dart';
import 'package:khurpi_fresh/data/repositories/auth_repository_impl.dart';
import 'package:khurpi_fresh/data/repositories/cart_repository_impl.dart';
import 'package:khurpi_fresh/data/repositories/order_repository_impl.dart';
import 'package:khurpi_fresh/data/repositories/banner_repository_impl.dart';

// Domain Repositories
import 'package:khurpi_fresh/domain/repositories/product_repository.dart';
import 'package:khurpi_fresh/domain/repositories/auth_repository.dart';
import 'package:khurpi_fresh/domain/repositories/cart_repository.dart';
import 'package:khurpi_fresh/domain/repositories/order_repository.dart';
import 'package:khurpi_fresh/domain/repositories/banner_repository.dart';

// Use Cases
import 'package:khurpi_fresh/domain/usecases/product_usecases.dart';
import 'package:khurpi_fresh/domain/usecases/auth_usecases.dart';
import 'package:khurpi_fresh/domain/usecases/order_usecases.dart';

// ==================== Core Providers ====================

final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError('SharedPreferences must be overridden in main');
});

final dioProvider = Provider<Dio>((ref) {
  return DioClient.instance;
});

// ==================== Retrofit API Service Providers ====================

final productApiServiceProvider = Provider<ProductApiService>((ref) {
  return ProductApiService(ref.watch(dioProvider));
});

final authApiServiceProvider = Provider<AuthApiService>((ref) {
  return AuthApiService(ref.watch(dioProvider));
});

final orderApiServiceProvider = Provider<OrderApiService>((ref) {
  return OrderApiService(ref.watch(dioProvider));
});

final bannerApiServiceProvider = Provider<BannerApiService>((ref) {
  return BannerApiService(ref.watch(dioProvider));
});

// ==================== Data Source Providers ====================

final productRemoteDataSourceProvider = Provider<ProductRemoteDataSource>((ref) {
  return ProductRemoteDataSourceImpl(ref.watch(productApiServiceProvider));
});

final authRemoteDataSourceProvider = Provider<AuthRemoteDataSource>((ref) {
  return AuthRemoteDataSourceImpl(ref.watch(authApiServiceProvider));
});

final authLocalDataSourceProvider = Provider<AuthLocalDataSource>((ref) {
  return AuthLocalDataSourceImpl(ref.watch(sharedPreferencesProvider));
});

final cartLocalDataSourceProvider = Provider<CartLocalDataSource>((ref) {
  return CartLocalDataSourceImpl(ref.watch(sharedPreferencesProvider));
});

final orderRemoteDataSourceProvider = Provider<OrderRemoteDataSource>((ref) {
  return OrderRemoteDataSourceImpl(ref.watch(orderApiServiceProvider));
});

final bannerRemoteDataSourceProvider = Provider<BannerRemoteDataSource>((ref) {
  return BannerRemoteDataSourceImpl(ref.watch(bannerApiServiceProvider));
});

// ==================== Repository Providers ====================

final productRepositoryProvider = Provider<ProductRepository>((ref) {
  return ProductRepositoryImpl(ref.watch(productRemoteDataSourceProvider));
});

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepositoryImpl(
    remoteDataSource: ref.watch(authRemoteDataSourceProvider),
    localDataSource: ref.watch(authLocalDataSourceProvider),
  );
});

final cartRepositoryProvider = Provider<CartRepository>((ref) {
  return CartRepositoryImpl(ref.watch(cartLocalDataSourceProvider));
});

final orderRepositoryProvider = Provider<OrderRepository>((ref) {
  return OrderRepositoryImpl(ref.watch(orderRemoteDataSourceProvider));
});

final bannerRepositoryProvider = Provider<BannerRepository>((ref) {
  return BannerRepositoryImpl(ref.watch(bannerRemoteDataSourceProvider));
});

// ==================== Use Case Providers ====================

// Product Use Cases
final getProductsUseCaseProvider = Provider<GetProductsUseCase>((ref) {
  return GetProductsUseCase(ref.watch(productRepositoryProvider));
});

final getProductByIdUseCaseProvider = Provider<GetProductByIdUseCase>((ref) {
  return GetProductByIdUseCase(ref.watch(productRepositoryProvider));
});

final getCategoriesUseCaseProvider = Provider<GetCategoriesUseCase>((ref) {
  return GetCategoriesUseCase(ref.watch(productRepositoryProvider));
});

final getProductsByCategoryUseCaseProvider = Provider<GetProductsByCategoryUseCase>((ref) {
  return GetProductsByCategoryUseCase(ref.watch(productRepositoryProvider));
});

// Auth Use Cases
final loginUseCaseProvider = Provider<LoginUseCase>((ref) {
  return LoginUseCase(ref.watch(authRepositoryProvider));
});

final registerUseCaseProvider = Provider<RegisterUseCase>((ref) {
  return RegisterUseCase(ref.watch(authRepositoryProvider));
});

final getCurrentUserUseCaseProvider = Provider<GetCurrentUserUseCase>((ref) {
  return GetCurrentUserUseCase(ref.watch(authRepositoryProvider));
});

final logoutUseCaseProvider = Provider<LogoutUseCase>((ref) {
  return LogoutUseCase(ref.watch(authRepositoryProvider));
});

final updateProfileUseCaseProvider = Provider<UpdateProfileUseCase>((ref) {
  return UpdateProfileUseCase(ref.watch(authRepositoryProvider));
});

// Order Use Cases
final createOrderUseCaseProvider = Provider<CreateOrderUseCase>((ref) {
  return CreateOrderUseCase(ref.watch(orderRepositoryProvider));
});

final getMyOrdersUseCaseProvider = Provider<GetMyOrdersUseCase>((ref) {
  return GetMyOrdersUseCase(ref.watch(orderRepositoryProvider));
});

final getOrderByIdUseCaseProvider = Provider<GetOrderByIdUseCase>((ref) {
  return GetOrderByIdUseCase(ref.watch(orderRepositoryProvider));
});

final cancelOrderUseCaseProvider = Provider<CancelOrderUseCase>((ref) {
  return CancelOrderUseCase(ref.watch(orderRepositoryProvider));
});
