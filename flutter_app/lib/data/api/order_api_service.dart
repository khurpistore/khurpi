import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import 'package:khurpi_fresh/data/models/order_model.dart';

part 'order_api_service.g.dart';

@RestApi()
abstract class OrderApiService {
  factory OrderApiService(Dio dio, {String baseUrl}) = _OrderApiService;

  @POST('/orders')
  Future<OrderModel> createOrder(@Body() CreateOrderRequest request);

  @GET('/orders/my-orders')
  Future<List<OrderModel>> getMyOrders();

  @GET('/orders/{id}')
  Future<OrderModel> getOrderById(@Path('id') String id);

  @POST('/orders/{id}/cancel')
  Future<OrderModel> cancelOrder(@Path('id') String id);
}

// Request Model
class CreateOrderRequest {
  final List<OrderItemRequest> items;
  final String deliveryAddress;
  final String city;
  final String pincode;
  final String phone;
  final String paymentMethod;
  final String? notes;

  CreateOrderRequest({
    required this.items,
    required this.deliveryAddress,
    required this.city,
    required this.pincode,
    required this.phone,
    required this.paymentMethod,
    this.notes,
  });

  Map<String, dynamic> toJson() => {
    'items': items.map((e) => e.toJson()).toList(),
    'delivery_address': deliveryAddress,
    'city': city,
    'pincode': pincode,
    'phone': phone,
    'payment_method': paymentMethod,
    if (notes != null) 'notes': notes,
  };
}

class OrderItemRequest {
  final String productId;
  final double quantity;
  final String unit;

  OrderItemRequest({
    required this.productId,
    required this.quantity,
    required this.unit,
  });

  Map<String, dynamic> toJson() => {
    'product_id': productId,
    'quantity': quantity,
    'unit': unit,
  };
}
