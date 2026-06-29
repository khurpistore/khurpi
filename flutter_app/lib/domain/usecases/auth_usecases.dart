import 'package:dartz/dartz.dart';
import 'package:khurpi_fresh/core/error/failures.dart';
import 'package:khurpi_fresh/core/usecase/usecase.dart';
import 'package:khurpi_fresh/domain/entities/user_entity.dart';
import 'package:khurpi_fresh/domain/repositories/auth_repository.dart';

// Login Use Case
class LoginUseCase implements UseCase<AuthResult, LoginParams> {
  final AuthRepository repository;

  LoginUseCase(this.repository);

  @override
  Future<Either<Failure, AuthResult>> call(LoginParams params) {
    return repository.login(params.phone, params.password);
  }
}

class LoginParams {
  final String phone;
  final String password;

  LoginParams({required this.phone, required this.password});
}

// Register Use Case
class RegisterUseCase implements UseCase<AuthResult, RegisterParams> {
  final AuthRepository repository;

  RegisterUseCase(this.repository);

  @override
  Future<Either<Failure, AuthResult>> call(RegisterParams params) {
    return repository.register(
      phone: params.phone,
      password: params.password,
      name: params.name,
      email: params.email,
    );
  }
}

class RegisterParams {
  final String phone;
  final String password;
  final String? name;
  final String? email;

  RegisterParams({
    required this.phone,
    required this.password,
    this.name,
    this.email,
  });
}

// Get Current User Use Case
class GetCurrentUserUseCase implements UseCaseNoParams<UserEntity> {
  final AuthRepository repository;

  GetCurrentUserUseCase(this.repository);

  @override
  Future<Either<Failure, UserEntity>> call() {
    return repository.getCurrentUser();
  }
}

// Logout Use Case
class LogoutUseCase implements UseCaseNoParams<void> {
  final AuthRepository repository;

  LogoutUseCase(this.repository);

  @override
  Future<Either<Failure, void>> call() {
    return repository.logout();
  }
}

// Update Profile Use Case
class UpdateProfileUseCase implements UseCase<UserEntity, UpdateProfileParams> {
  final AuthRepository repository;

  UpdateProfileUseCase(this.repository);

  @override
  Future<Either<Failure, UserEntity>> call(UpdateProfileParams params) {
    return repository.updateProfile(
      name: params.name,
      email: params.email,
      address: params.address,
      city: params.city,
      pincode: params.pincode,
    );
  }
}

class UpdateProfileParams {
  final String? name;
  final String? email;
  final String? address;
  final String? city;
  final String? pincode;

  UpdateProfileParams({
    this.name,
    this.email,
    this.address,
    this.city,
    this.pincode,
  });
}
