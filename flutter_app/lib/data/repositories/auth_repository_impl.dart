import 'package:dartz/dartz.dart';
import '../../core/error/exceptions.dart';
import '../../core/error/failures.dart';
import '../../core/network/api_client.dart';
import '../../domain/entities/user_entity.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/remote/auth_remote_datasource.dart';
import '../models/user_model.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;
  final AuthLocalDataSource localDataSource;
  final ApiClient apiClient;

  AuthRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
    required this.apiClient,
  });

  @override
  Future<Either<Failure, AuthResult>> login(String phone, String password) async {
    try {
      final response = await remoteDataSource.login(phone, password);
      await localDataSource.saveAuthData(response.token, response.user);
      apiClient.setAuthToken(response.token);
      return Right(AuthResult(token: response.token, user: response.user));
    } on ServerException catch (e) {
      return Left(AuthFailure(message: e.message, statusCode: e.statusCode));
    }
  }

  @override
  Future<Either<Failure, AuthResult>> register({
    required String phone,
    required String password,
    String? name,
    String? email,
  }) async {
    try {
      final response = await remoteDataSource.register(
        phone: phone,
        password: password,
        name: name,
        email: email,
      );
      await localDataSource.saveAuthData(response.token, response.user);
      apiClient.setAuthToken(response.token);
      return Right(AuthResult(token: response.token, user: response.user));
    } on ServerException catch (e) {
      return Left(AuthFailure(message: e.message, statusCode: e.statusCode));
    }
  }

  @override
  Future<Either<Failure, UserEntity>> getCurrentUser() async {
    try {
      final token = await localDataSource.getToken();
      if (token == null) {
        return const Left(AuthFailure(message: 'Not authenticated'));
      }
      apiClient.setAuthToken(token);
      final user = await remoteDataSource.getCurrentUser();
      await localDataSource.saveAuthData(token, user);
      return Right(user);
    } on ServerException catch (e) {
      return Left(AuthFailure(message: e.message, statusCode: e.statusCode));
    }
  }

  @override
  Future<bool> isLoggedIn() async {
    final token = await localDataSource.getToken();
    return token != null;
  }

  @override
  Future<Either<Failure, void>> logout() async {
    try {
      await localDataSource.clearAuthData();
      apiClient.setAuthToken(null);
      return const Right(null);
    } catch (e) {
      return Left(CacheFailure(message: 'Failed to logout: $e'));
    }
  }

  @override
  Future<Either<Failure, UserEntity>> updateProfile({
    String? name,
    String? email,
    String? address,
    String? city,
    String? pincode,
  }) async {
    try {
      final user = await remoteDataSource.updateProfile(
        name: name,
        email: email,
        address: address,
        city: city,
        pincode: pincode,
      );
      final token = await localDataSource.getToken();
      if (token != null) {
        await localDataSource.saveAuthData(token, user);
      }
      return Right(user);
    } on ServerException catch (e) {
      return Left(ServerFailure(message: e.message, statusCode: e.statusCode));
    }
  }

  @override
  Future<String?> getStoredToken() async {
    return localDataSource.getToken();
  }
}
