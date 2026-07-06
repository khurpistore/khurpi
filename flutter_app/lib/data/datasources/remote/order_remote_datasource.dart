import 'package:dio/dio.dart';
import 'package:khurpi_fresh/core/error/exceptions.dart';
import 'package:khurpi_fresh/core/constants/app_constants.dart';
import 'package:khurpi_fresh/core/network/dio_client.dart';
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

  OrderRemoteDataSourceImpl(this._apiService) : _dio = DioClient.instance;

  /// Helper to transform order response data to match OrderModel
  Map<String, dynamic> _transformOrderResponse(Map<String, dynamic> data) {
    final responseData = Map<String, dynamic>.from(data);
    
    // Convert delivery_address from Map to String if needed
    if (responseData['delivery_address'] is Map) {
      final addr = responseData['delivery_address'] as Map;
      final parts = <String>[];
      if (addr['address_line'] != null) parts.add(addr['address_line'].toString());
      if (addr['city'] != null) parts.add(addr['city'].toString());
      if (addr['pincode'] != null) parts.add(addr['pincode'].toString());
      responseData['delivery_address'] = parts.isNotEmpty ? parts.join(', ') : '';
    } else if (responseData['delivery_address'] == null) {
      responseData['delivery_address'] = '';
    }
    
    // Transform one_time_items
    if (responseData['one_time_items'] is List) {
      responseData['one_time_items'] = _transformItemsList(responseData['one_time_items'] as List);
    }
    
    // Transform items
    if (responseData['items'] is List) {
      responseData['items'] = _transformItemsList(responseData['items'] as List);
    }
    
    return responseData;
  }
  
  List<Map<String, dynamic>> _transformItemsList(List items) {
    return items.map((item) {
      if (item is Map) {
        final product = item['product'];
        // Try multiple sources for product name
        String productName = '';
        if (item['product_name'] != null && item['product_name'].toString().isNotEmpty) {
          productName = item['product_name'].toString();
        } else if (item['product_name_at_order'] != null && item['product_name_at_order'].toString().isNotEmpty) {
          productName = item['product_name_at_order'].toString();
        } else if (product is Map && product['name'] != null) {
          productName = product['name'].toString();
        } else {
          productName = 'Product';
        }
        
        return <String, dynamic>{
          'product_id': item['product_id']?.toString() ?? '',
          'product_name': productName,
          'price': _toDouble(item['price'] ?? item['price_at_order']),
          'quantity': _toDouble(item['quantity'] ?? 1),
          'unit': item['unit']?.toString() ?? 'kg',
          'total': _toDouble(item['price'] ?? 0) * _toDouble(item['quantity'] ?? 1),
          'product': product is Map ? Map<String, dynamic>.from(product) : null,
        };
      }
      return <String, dynamic>{};
    }).toList();
  }
  
  double _toDouble(dynamic value) {
    if (value == null) return 0.0;
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    return 0.0;
  }

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
      final requestBody = <String, dynamic>{
        'user_id': userId,
        'address_id': addressId,
        'one_time_items': items.map((item) => <String, dynamic>{
          'product_id': item.productId,
          'product_name': item.productName, // Include product name for display
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
      };
      
      if (paymentId != null) requestBody['payment_id'] = paymentId;
      if (razorpayOrderId != null) requestBody['razorpay_order_id'] = razorpayOrderId;
      if (notes != null) requestBody['notes'] = notes;
      if (deliveryType != null) requestBody['delivery_type'] = deliveryType;
      if (deliveryDate != null) requestBody['delivery_date'] = deliveryDate;
      if (deliverySlotId != null) requestBody['delivery_slot_id'] = deliverySlotId;

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
        throw ServerException(message: response.data['detail'].toString());
      }

      // Transform response to match OrderModel expectations
      final transformedData = _transformOrderResponse(Map<String, dynamic>.from(response.data));
      return OrderModel.fromJson(transformedData);
    } on DioException catch (e) {
      final errorData = e.response?.data;
      String errorMessage = 'Network error';
      if (errorData is Map && errorData['detail'] != null) {
        errorMessage = errorData['detail'].toString();
      } else if (e.message != null) {
        errorMessage = e.message!;
      }
      throw ServerException(message: errorMessage);
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException(message: 'Failed to create order: $e');
    }
  }

  @override
  Future<List<OrderModel>> getMyOrders() async {
    try {
      final response = await _dio.get('/orders/my-orders');
      
      if (response.data is List) {
        return (response.data as List).map((order) {
          if (order is Map<String, dynamic>) {
            final transformedData = _transformOrderResponse(order);
            return OrderModel.fromJson(transformedData);
          }
          throw ServerException(message: 'Invalid order data format');
        }).toList();
      }
      
      throw ServerException(message: 'Invalid response format');
    } on DioException catch (e) {
      final errorData = e.response?.data;
      String errorMessage = 'Failed to fetch orders';
      if (errorData is Map && errorData['detail'] != null) {
        errorMessage = errorData['detail'].toString();
      }
      throw ServerException(message: errorMessage);
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException(message: 'Failed to fetch orders: $e');
    }
  }

  @override
  Future<OrderModel> getOrderById(String id) async {
    try {
      final response = await _dio.get('/orders/$id');
      
      if (response.data is Map<String, dynamic>) {
        final transformedData = _transformOrderResponse(response.data);
        return OrderModel.fromJson(transformedData);
      }
      
      throw ServerException(message: 'Invalid response format');
    } on DioException catch (e) {
      final errorData = e.response?.data;
      String errorMessage = 'Failed to fetch order';
      if (errorData is Map && errorData['detail'] != null) {
        errorMessage = errorData['detail'].toString();
      }
      throw ServerException(message: errorMessage);
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException(message: 'Failed to fetch order: $e');
    }
  }

  @override
  Future<OrderModel> cancelOrder(String id) async {
    try {
      final response = await _dio.post('/orders/$id/cancel');
      
      if (response.data is Map<String, dynamic>) {
        final transformedData = _transformOrderResponse(response.data);
        return OrderModel.fromJson(transformedData);
      }
      
      throw ServerException(message: 'Invalid response format');
    } on DioException catch (e) {
      final errorData = e.response?.data;
      String errorMessage = 'Failed to cancel order';
      if (errorData is Map && errorData['detail'] != null) {
        errorMessage = errorData['detail'].toString();
      }
      throw ServerException(message: errorMessage);
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException(message: 'Failed to cancel order: $e');
    }
  }
}
