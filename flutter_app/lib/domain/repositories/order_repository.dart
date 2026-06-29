import 'package:dartz/dartz.dart';
import '../../core/error/failures.dart';
import '../entities/order_entity.dart';

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
