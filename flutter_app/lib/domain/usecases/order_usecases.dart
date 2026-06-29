import 'package:dartz/dartz.dart';
import '../../core/error/failures.dart';
import '../../core/usecase/usecase.dart';
import '../entities/order_entity.dart';
import '../repositories/order_repository.dart';

// Create Order Use Case
class CreateOrderUseCase implements UseCase<OrderEntity, CreateOrderParams> {
  final OrderRepository repository;

  CreateOrderUseCase(this.repository);

  @override
  Future<Either<Failure, OrderEntity>> call(CreateOrderParams params) {
    return repository.createOrder(
      items: params.items,
      deliveryAddress: params.deliveryAddress,
      deliverySlot: params.deliverySlot,
      deliveryDate: params.deliveryDate,
      paymentMethod: params.paymentMethod,
      notes: params.notes,
    );
  }
}

class CreateOrderParams {
  final List<Map<String, dynamic>> items;
  final String deliveryAddress;
  final String deliverySlot;
  final DateTime deliveryDate;
  final String? paymentMethod;
  final String? notes;

  CreateOrderParams({
    required this.items,
    required this.deliveryAddress,
    required this.deliverySlot,
    required this.deliveryDate,
    this.paymentMethod,
    this.notes,
  });
}

// Get My Orders Use Case
class GetMyOrdersUseCase implements UseCaseNoParams<List<OrderEntity>> {
  final OrderRepository repository;

  GetMyOrdersUseCase(this.repository);

  @override
  Future<Either<Failure, List<OrderEntity>>> call() {
    return repository.getMyOrders();
  }
}

// Get Order By ID Use Case
class GetOrderByIdUseCase implements UseCase<OrderEntity, String> {
  final OrderRepository repository;

  GetOrderByIdUseCase(this.repository);

  @override
  Future<Either<Failure, OrderEntity>> call(String id) {
    return repository.getOrderById(id);
  }
}

// Cancel Order Use Case
class CancelOrderUseCase implements UseCase<OrderEntity, String> {
  final OrderRepository repository;

  CancelOrderUseCase(this.repository);

  @override
  Future<Either<Failure, OrderEntity>> call(String id) {
    return repository.cancelOrder(id);
  }
}
