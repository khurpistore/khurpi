import 'package:dartz/dartz.dart';
import '../../core/error/exceptions.dart';
import '../../core/error/failures.dart';
import '../../domain/entities/order_entity.dart';
import '../../domain/repositories/order_repository.dart';
import '../datasources/remote/order_remote_datasource.dart';

class OrderRepositoryImpl implements OrderRepository {
  final OrderRemoteDataSource remoteDataSource;

  OrderRepositoryImpl(this.remoteDataSource);

  @override
  Future<Either<Failure, OrderEntity>> createOrder({
    required List<Map<String, dynamic>> items,
    required String deliveryAddress,
    required String deliverySlot,
    required DateTime deliveryDate,
    String? paymentMethod,
    String? notes,
  }) async {
    try {
      final order = await remoteDataSource.createOrder(
        items: items,
        deliveryAddress: deliveryAddress,
        deliverySlot: deliverySlot,
        deliveryDate: deliveryDate,
        paymentMethod: paymentMethod,
        notes: notes,
      );
      return Right(order);
    } on ServerException catch (e) {
      return Left(ServerFailure(message: e.message, statusCode: e.statusCode));
    }
  }

  @override
  Future<Either<Failure, List<OrderEntity>>> getMyOrders() async {
    try {
      final orders = await remoteDataSource.getMyOrders();
      return Right(orders);
    } on ServerException catch (e) {
      return Left(ServerFailure(message: e.message, statusCode: e.statusCode));
    }
  }

  @override
  Future<Either<Failure, OrderEntity>> getOrderById(String id) async {
    try {
      final order = await remoteDataSource.getOrderById(id);
      return Right(order);
    } on ServerException catch (e) {
      return Left(ServerFailure(message: e.message, statusCode: e.statusCode));
    }
  }

  @override
  Future<Either<Failure, OrderEntity>> cancelOrder(String id) async {
    try {
      final order = await remoteDataSource.cancelOrder(id);
      return Right(order);
    } on ServerException catch (e) {
      return Left(ServerFailure(message: e.message, statusCode: e.statusCode));
    }
  }
}
