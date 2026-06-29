import 'package:khurpi_fresh/core/error/exceptions.dart';
import 'package:khurpi_fresh/data/api/order_api_service.dart';
import 'package:khurpi_fresh/data/models/order_model.dart';
import 'package:khurpi_fresh/data/models/create_order_request.dart';
import 'package:khurpi_fresh/data/models/cart_item_model.dart';

abstract class OrderRemoteDataSource {
  Future<OrderModel> createOrder({
    required List<CartItemModel> items,
    required String deliveryAddress,
    required String city,
    required String pincode,
    required String phone,
    required String paymentMethod,
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
    required List<CartItemModel> items,
    required String deliveryAddress,
    required String city,
    required String pincode,
    required String phone,
    required String paymentMethod,
    String? notes,
    String? deliveryType,
    String? deliveryDate,
    String? deliverySlotId,
  }) async {
    try {
      final request = CreateOrderRequest(
        items: items.map((item) => OrderItemRequest(
          productId: item.productId,
          quantity: item.quantity,
          unit: item.unit,
        )).toList(),
        deliveryAddress: deliveryAddress,
        city: city,
        pincode: pincode,
        phone: phone,
        paymentMethod: paymentMethod,
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
