import '../models/order_model.dart';
import 'api_service.dart';

class OrderService {
  final ApiService _api = ApiService();

  // Create order
  Future<OrderModel> createOrder({
    required List<Map<String, dynamic>> items,
    required String deliveryAddress,
    required String deliverySlot,
    required DateTime deliveryDate,
    String? paymentMethod,
    String? notes,
  }) async {
    final response = await _api.post('/orders', {
      'items': items,
      'delivery_address': deliveryAddress,
      'delivery_slot': deliverySlot,
      'delivery_date': deliveryDate.toIso8601String(),
      if (paymentMethod != null) 'payment_method': paymentMethod,
      if (notes != null) 'notes': notes,
    });
    
    return OrderModel.fromJson(response);
  }

  // Get user orders
  Future<List<OrderModel>> getMyOrders() async {
    final response = await _api.get('/orders/my');
    final List<dynamic> data = response is List ? response : (response['orders'] ?? []);
    return data.map((json) => OrderModel.fromJson(json)).toList();
  }

  // Get single order
  Future<OrderModel> getOrder(String id) async {
    final response = await _api.get('/orders/$id');
    return OrderModel.fromJson(response);
  }

  // Cancel order
  Future<OrderModel> cancelOrder(String id) async {
    final response = await _api.post('/orders/$id/cancel', {});
    return OrderModel.fromJson(response);
  }

  // Reorder (create order from previous order)
  Future<List<Map<String, dynamic>>> getReorderItems(String orderId) async {
    final order = await getOrder(orderId);
    return order.items.map((item) => {
      'product_id': item.productId,
      'quantity': item.quantity,
      'unit': item.unit,
    }).toList();
  }
}
