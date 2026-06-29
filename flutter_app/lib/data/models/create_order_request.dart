import 'package:freezed_annotation/freezed_annotation.dart';

part '../../generated/models/create_order_request.freezed.dart';
part '../../generated/models/create_order_request.g.dart';

@freezed
abstract class CreateOrderRequest with _$CreateOrderRequest {
  const factory CreateOrderRequest({
    required List<OrderItemRequest> items,
    @JsonKey(name: 'delivery_address') required String deliveryAddress,
    required String city,
    required String pincode,
    required String phone,
    @JsonKey(name: 'payment_method') required String paymentMethod,
    String? notes,
  }) = _CreateOrderRequest;

  factory CreateOrderRequest.fromJson(Map<String, dynamic> json) =>
      _$CreateOrderRequestFromJson(json);
}

@freezed
abstract class OrderItemRequest with _$OrderItemRequest {
  const factory OrderItemRequest({
    @JsonKey(name: 'product_id') required String productId,
    required double quantity,
    required String unit,
  }) = _OrderItemRequest;

  factory OrderItemRequest.fromJson(Map<String, dynamic> json) =>
      _$OrderItemRequestFromJson(json);
}
