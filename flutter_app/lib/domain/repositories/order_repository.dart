import 'package:dartz/dartz.dart';
import 'package:khurpi_fresh/core/error/failures.dart';
import 'package:khurpi_fresh/data/models/order_model.dart';
import 'package:khurpi_fresh/data/models/cart_item_model.dart';

abstract class OrderRepository {
  Future<Either<Failure, OrderModel>> createOrder({
    required List<CartItemModel> items,
    required String deliveryAddress,
    required String city,
    required String pincode,
    required String phone,
    required String paymentMethod,
    String? notes,
  });
  Future<Either<Failure, List<OrderModel>>> getMyOrders();
  Future<Either<Failure, OrderModel>> getOrderById(String id);
  Future<Either<Failure, OrderModel>> cancelOrder(String id);
}
