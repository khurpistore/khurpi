import 'package:dartz/dartz.dart';
import '../error/failures.dart';

/// Base use case with parameters
abstract class UseCase<Type, Params> {
  Future<Either<Failure, Type>> call(Params params);
}

/// Use case without parameters
abstract class UseCaseNoParams<Type> {
  Future<Either<Failure, Type>> call();
}

/// No parameters class
class NoParams {
  const NoParams();
}
