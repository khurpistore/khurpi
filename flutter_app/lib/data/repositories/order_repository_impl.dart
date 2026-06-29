import 'package:dartz/dartz.dart';
import 'package:khurpi_fresh/core/error/exceptions.dart';
import 'package:khurpi_fresh/core/error/failures.dart';
import 'package:khurpi_fresh/data/models/order_model.dart';
import 'package:khurpi_fresh/data/models/cart_item_model.dart';
import 'package:khurpi_fresh/domain/repositories/order_repository.dart';
import 'package:khurpi_fresh/data/datasources/remote/order_remote_datasource.dart';

class OrderRepositoryImpl implements OrderRepository {
  final OrderRemoteDataSource remoteDataSource;

  OrderRepositoryImpl({required this.remoteDataSource});

  @override
  Future<Either<Failure, OrderModel>> createOrder({
    required List<CartItemModel> items,
    required String deliveryAddress,
    required String city,
    required String pincode,
    required String phone,
    required String paymentMethod,
    String? notes,
  }) async {
    try {
      final order = await remoteDataSource.createOrder(
        items: items,
        deliveryAddress: deliveryAddress,
        city: city,
        pincode: pincode,
        phone: phone,
        paymentMethod: paymentMethod,
        notes: notes,
      );
      return Right(order);
    } on ServerException catch (e) {
      return Left(ServerFailure(message: e.message, statusCode: e.statusCode));
    }
  }

  @override
  Future<Either<Failure, List<OrderModel>>> getMyOrders() async {
    try {
      final orders = await remoteDataSource.getMyOrders();
      return Right(orders);
    } on ServerException catch (e) {
      return Left(ServerFailure(message: e.message, statusCode: e.statusCode));
    }
  }

  @override
  Future<Either<Failure, OrderModel>> getOrderById(String id) async {
    try {
      final order = await remoteDataSource.getOrderById(id);
      return Right(order);
    } on ServerException catch (e) {
      return Left(ServerFailure(message: e.message, statusCode: e.statusCode));
    }
  }

  @override
  Future<Either<Failure, OrderModel>> cancelOrder(String id) async {
    try {
      final order = await remoteDataSource.cancelOrder(id);
      return Right(order);
    } on ServerException catch (e) {
      return Left(ServerFailure(message: e.message, statusCode: e.statusCode));
    }
  }
}
