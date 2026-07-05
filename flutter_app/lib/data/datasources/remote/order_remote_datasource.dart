import 'package:khurpi_fresh/core/error/exceptions.dart';
import 'package:khurpi_fresh/data/api/order_api_service.dart';
import 'package:khurpi_fresh/data/models/order_model.dart';
import 'package:khurpi_fresh/data/models/create_order_request.dart';
import 'package:khurpi_fresh/data/models/cart_item_model.dart';

abstract class OrderRemoteDataSource {
  Future<OrderModel> createOrder({
    required String userId,
    required String addressId,
    required List<CartItemModel> items,
    required double subtotal,
    required double deliveryFee,
    required double total,
    required String paymentMethod,
    String? paymentStatus,
    String? paymentId,
    String? razorpayOrderId,
    String? notes,
    String? deliveryType,
    String? deliveryDate,
    String? deliverySlotId,
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
    required String userId,
    required String addressId,
    required List<CartItemModel> items,
    required double subtotal,
    required double deliveryFee,
    required double total,
    required String paymentMethod,
    String? paymentStatus,
    String? paymentId,
    String? razorpayOrderId,
    String? notes,
    String? deliveryType,
    String? deliveryDate,
    String? deliverySlotId,
  }) async {
    try {
      final request = CreateOrderRequest(
        userId: userId,
        addressId: addressId,
        oneTimeItems: items.map((item) => OrderItemRequest(
          productId: item.productId,
          quantity: item.quantity,
          unit: item.unit,
        )).toList(),
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: total,
        paymentMethod: paymentMethod,
        paymentStatus: paymentStatus ?? 'pending',
        paymentId: paymentId,
        razorpayOrderId: razorpayOrderId,
        notes: notes,
        deliveryType: deliveryType,
        deliveryDate: deliveryDate,
        deliverySlotId: deliverySlotId,
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
