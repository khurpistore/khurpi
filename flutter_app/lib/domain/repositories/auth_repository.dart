import 'package:dartz/dartz.dart';
import 'package:khurpi_fresh/core/error/failures.dart';
import 'package:khurpi_fresh/data/models/user_model.dart';

abstract class AuthRepository {
  Future<Either<Failure, AuthResult>> login(String phone, String password);
  Future<Either<Failure, AuthResult>> register({
    required String phone,
    required String password,
    String? name,
    String? email,
  });
  Future<Either<Failure, UserModel>> getCurrentUser();
  Future<bool> isLoggedIn();
  Future<Either<Failure, void>> logout();
  Future<Either<Failure, UserModel>> updateProfile({
    String? name,
    String? email,
    String? address,
    String? city,
    String? pincode,
  });
  Future<String?> getStoredToken();
}

class AuthResult {
  final String token;
  final UserModel user;

  AuthResult({required this.token, required this.user});
}
