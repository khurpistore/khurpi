import '../../../core/network/api_client.dart';
import '../../../core/error/exceptions.dart';
import '../../models/order_model.dart';

abstract class OrderRemoteDataSource {
  Future<OrderModel> createOrder({
    required List<Map<String, dynamic>> items,
    required String deliveryAddress,
    required String deliverySlot,
    required DateTime deliveryDate,
    String? paymentMethod,
    String? notes,
  });
  Future<List<OrderModel>> getMyOrders();
  Future<OrderModel> getOrderById(String id);
  Future<OrderModel> cancelOrder(String id);
}

class OrderRemoteDataSourceImpl implements OrderRemoteDataSource {
  final ApiClient apiClient;

  OrderRemoteDataSourceImpl(this.apiClient);

  @override
  Future<OrderModel> createOrder({
    required List<Map<String, dynamic>> items,
    required String deliveryAddress,
    required String deliverySlot,
    required DateTime deliveryDate,
    String? paymentMethod,
    String? notes,
  }) async {
    try {
      final response = await apiClient.post('/orders', data: {
        'items': items,
        'delivery_address': deliveryAddress,
        'delivery_slot': deliverySlot,
        'delivery_date': deliveryDate.toIso8601String(),
        if (paymentMethod != null) 'payment_method': paymentMethod,
        if (notes != null) 'notes': notes,
      });
      return OrderModel.fromJson(response);
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException(message: 'Failed to create order: $e');
    }
  }

  @override
  Future<List<OrderModel>> getMyOrders() async {
    try {
      final response = await apiClient.get('/orders/my');
      final List<dynamic> data = response is List ? response : (response['orders'] ?? []);
      return data.map((json) => OrderModel.fromJson(json)).toList();
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException(message: 'Failed to fetch orders: $e');
    }
  }

  @override
  Future<OrderModel> getOrderById(String id) async {
    try {
      final response = await apiClient.get('/orders/$id');
      return OrderModel.fromJson(response);
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException(message: 'Failed to fetch order: $e');
    }
  }

  @override
  Future<OrderModel> cancelOrder(String id) async {
    try {
      final response = await apiClient.post('/orders/$id/cancel', data: {});
      return OrderModel.fromJson(response);
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException(message: 'Failed to cancel order: $e');
    }
  }
}
