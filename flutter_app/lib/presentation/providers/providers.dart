import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

// Core
import '../../core/network/api_client.dart';

// Data Sources
import '../../data/datasources/remote/product_remote_datasource.dart';
import '../../data/datasources/remote/auth_remote_datasource.dart';
import '../../data/datasources/remote/order_remote_datasource.dart';
import '../../data/datasources/remote/banner_remote_datasource.dart';
import '../../data/datasources/local/cart_local_datasource.dart';

// Repositories
import '../../data/repositories/product_repository_impl.dart';
import '../../data/repositories/auth_repository_impl.dart';
import '../../data/repositories/cart_repository_impl.dart';
import '../../data/repositories/order_repository_impl.dart';
import '../../data/repositories/banner_repository_impl.dart';

// Domain Repositories
import '../../domain/repositories/product_repository.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../domain/repositories/cart_repository.dart';
import '../../domain/repositories/order_repository.dart';
import '../../domain/repositories/banner_repository.dart';

// Use Cases
import '../../domain/usecases/product_usecases.dart';
import '../../domain/usecases/auth_usecases.dart';
import '../../domain/usecases/order_usecases.dart';

// ==================== Core Providers ====================

final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError('SharedPreferences must be overridden in main');
});

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient();
});

// ==================== Data Source Providers ====================

final productRemoteDataSourceProvider = Provider<ProductRemoteDataSource>((ref) {
  return ProductRemoteDataSourceImpl(ref.watch(apiClientProvider));
});

final authRemoteDataSourceProvider = Provider<AuthRemoteDataSource>((ref) {
  return AuthRemoteDataSourceImpl(ref.watch(apiClientProvider));
});

final authLocalDataSourceProvider = Provider<AuthLocalDataSource>((ref) {
  return AuthLocalDataSourceImpl(ref.watch(sharedPreferencesProvider));
});

final cartLocalDataSourceProvider = Provider<CartLocalDataSource>((ref) {
  return CartLocalDataSourceImpl(ref.watch(sharedPreferencesProvider));
});

final orderRemoteDataSourceProvider = Provider<OrderRemoteDataSource>((ref) {
  return OrderRemoteDataSourceImpl(ref.watch(apiClientProvider));
});

final bannerRemoteDataSourceProvider = Provider<BannerRemoteDataSource>((ref) {
  return BannerRemoteDataSourceImpl(ref.watch(apiClientProvider));
});

// ==================== Repository Providers ====================

final productRepositoryProvider = Provider<ProductRepository>((ref) {
  return ProductRepositoryImpl(ref.watch(productRemoteDataSourceProvider));
});

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepositoryImpl(
    remoteDataSource: ref.watch(authRemoteDataSourceProvider),
    localDataSource: ref.watch(authLocalDataSourceProvider),
    apiClient: ref.watch(apiClientProvider),
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
