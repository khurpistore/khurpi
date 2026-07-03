import 'package:equatable/equatable.dart';

/// Base failure class for error handling
abstract class Failure extends Equatable {
  final String message;
  final int? statusCode;

  const Failure({required this.message, this.statusCode});

  @override
  List<Object?> get props => [message, statusCode];
}

/// Server failure for API errors
class ServerFailure extends Failure {
  const ServerFailure({required super.message, super.statusCode});
}

/// Cache failure for local storage errors
class CacheFailure extends Failure {
  const CacheFailure({required super.message});
}

/// Network failure for connectivity issues
class NetworkFailure extends Failure {
  const NetworkFailure({super.message = 'No internet connection'});
}

/// Validation failure for input errors
class ValidationFailure extends Failure {
  const ValidationFailure({required super.message});
}

/// Authentication failure
class AuthFailure extends Failure {
  const AuthFailure({required super.message, super.statusCode});
}
