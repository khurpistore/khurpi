import 'package:dartz/dartz.dart';
import 'package:khurpi_fresh/core/error/failures.dart';
import 'package:khurpi_fresh/domain/entities/order_entity.dart';

abstract class OrderRepository {
  /// Create new order
  Future<Either<Failure, OrderEntity>> createOrder({
    required List<Map<String, dynamic>> items,
    required String deliveryAddress,
    required String deliverySlot,
    required DateTime deliveryDate,
    String? paymentMethod,
    String? notes,
  });

  /// Get user's orders
  Future<Either<Failure, List<OrderEntity>>> getMyOrders();

  /// Get single order by ID
  Future<Either<Failure, OrderEntity>> getOrderById(String id);

  /// Cancel order
  Future<Either<Failure, OrderEntity>> cancelOrder(String id);
}
