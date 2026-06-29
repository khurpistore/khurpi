import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import 'package:khurpi_fresh/data/models/order_model.dart';
import 'package:khurpi_fresh/data/models/create_order_request.dart';

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
