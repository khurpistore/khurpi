import 'package:dartz/dartz.dart';
import 'package:khurpi_fresh/core/error/failures.dart';
import 'package:khurpi_fresh/domain/entities/user_entity.dart';

abstract class AuthRepository {
  /// Login with phone and password
  Future<Either<Failure, AuthResult>> login(String phone, String password);

  /// Register new user
  Future<Either<Failure, AuthResult>> register({
    required String phone,
    required String password,
    String? name,
    String? email,
  });

  /// Get current authenticated user
  Future<Either<Failure, UserEntity>> getCurrentUser();

  /// Check if user is logged in
  Future<bool> isLoggedIn();

  /// Logout user
  Future<Either<Failure, void>> logout();

  /// Update user profile
  Future<Either<Failure, UserEntity>> updateProfile({
    String? name,
    String? email,
    String? address,
    String? city,
    String? pincode,
  });

  /// Get stored token
  Future<String?> getStoredToken();
}

class AuthResult {
  final String token;
  final UserEntity user;

  AuthResult({required this.token, required this.user});
}
