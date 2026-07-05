import 'package:dio/dio.dart';
import 'package:khurpi_fresh/core/error/exceptions.dart';
import 'package:khurpi_fresh/core/constants/app_constants.dart';
import 'package:khurpi_fresh/data/api/order_api_service.dart';
import 'package:khurpi_fresh/data/models/order_model.dart';
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
  final Dio _dio;

  OrderRemoteDataSourceImpl(this._apiService) : _dio = Dio(BaseOptions(baseUrl: AppConstants.baseUrl));

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
      // Build the request body that matches backend OrderCreate model
      final requestBody = {
        'user_id': userId,
        'address_id': addressId,
        'one_time_items': items.map((item) => {
          'product_id': item.productId,
          'quantity': item.quantity.toInt(), // Backend expects integer
          'price': item.price, // Backend requires price field
          'unit': item.unit,
        }).toList(),
        'subtotal': subtotal,
        'delivery_fee': deliveryFee,
        'total': total,
        'order_type': 'one_time',
        'payment_method': paymentMethod,
        'payment_status': paymentStatus ?? 'pending',
        if (paymentId != null) 'payment_id': paymentId,
        if (razorpayOrderId != null) 'razorpay_order_id': razorpayOrderId,
        if (notes != null) 'notes': notes,
        if (deliveryType != null) 'delivery_type': deliveryType,
        if (deliveryDate != null) 'delivery_date': deliveryDate,
        if (deliverySlotId != null) 'delivery_slot_id': deliverySlotId,
      };

      // Use Dio directly to make the API call with the correct payload
      final response = await _dio.post(
        '/orders',
        data: requestBody,
        options: Options(
          headers: {'Content-Type': 'application/json'},
        ),
      );

      // Check if response contains an error
      if (response.data is Map && response.data['detail'] != null) {
        throw ServerException(message: response.data['detail']);
      }

      return OrderModel.fromJson(response.data);
    } on DioException catch (e) {
      final errorMessage = e.response?.data?['detail'] ?? e.message ?? 'Network error';
      throw ServerException(message: 'Failed to create order: $errorMessage');
    } catch (e) {
      if (e is ServerException) rethrow;
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
