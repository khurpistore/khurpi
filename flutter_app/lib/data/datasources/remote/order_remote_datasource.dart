import 'package:khurpi_fresh/core/error/exceptions.dart';
import 'package:khurpi_fresh/data/api/order_api_service.dart';
import 'package:khurpi_fresh/data/models/order_model.dart';
import 'package:khurpi_fresh/domain/entities/cart_item_entity.dart';

abstract class OrderRemoteDataSource {
  Future<OrderModel> createOrder({
    required List<CartItemEntity> items,
    required String deliveryAddress,
    required String city,
    required String pincode,
    required String phone,
    required String paymentMethod,
    String? notes,
  });
  Future<List<OrderModel>> getMyOrders();
  Future<OrderModel> getOrderById(String id);
  Future<OrderModel> cancelOrder(String id);
}

class OrderRemoteDataSourceImpl implements OrderRemoteDataSource {
  final OrderApiService _apiService;

  OrderRemoteDataSourceImpl(this._apiService);

  @override
  Future<OrderModel> createOrder({
    required List<CartItemEntity> items,
    required String deliveryAddress,
    required String city,
    required String pincode,
    required String phone,
    required String paymentMethod,
    String? notes,
  }) async {
    try {
      final request = CreateOrderRequest(
        items: items.map((item) => OrderItemRequest(
          productId: item.product.id,
          quantity: item.quantity,
          unit: item.unit,
        )).toList(),
        deliveryAddress: deliveryAddress,
        city: city,
        pincode: pincode,
        phone: phone,
        paymentMethod: paymentMethod,
        notes: notes,
      );
      return await _apiService.createOrder(request);
    } catch (e) {
      throw ServerException(message: 'Failed to create order: $e');
    }
  }

  @override
  Future<List<OrderModel>> getMyOrders() async {
    try {
      return await _apiService.getMyOrders();
    } catch (e) {
      throw ServerException(message: 'Failed to fetch orders: $e');
    }
  }

  @override
  Future<OrderModel> getOrderById(String id) async {
    try {
      return await _apiService.getOrderById(id);
    } catch (e) {
      throw ServerException(message: 'Failed to fetch order: $e');
    }
  }

  @override
  Future<OrderModel> cancelOrder(String id) async {
    try {
      return await _apiService.cancelOrder(id);
    } catch (e) {
      throw ServerException(message: 'Failed to cancel order: $e');
    }
  }
}
