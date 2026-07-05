import 'package:freezed_annotation/freezed_annotation.dart';

part '../../generated/data/models/create_order_request.freezed.dart';
part '../../generated/data/models/create_order_request.g.dart';

@freezed
abstract class CreateOrderRequest with _$CreateOrderRequest {
  const factory CreateOrderRequest({
    @JsonKey(name: 'user_id') required String userId,
    @JsonKey(name: 'address_id') required String addressId,
    @JsonKey(name: 'one_time_items') required List<OrderItemRequest> oneTimeItems,
    required double subtotal,
    @JsonKey(name: 'delivery_fee') @Default(0) double deliveryFee,
    @Default(0) double discount,
    required double total,
    @JsonKey(name: 'order_type') @Default('one_time') String orderType,
    @JsonKey(name: 'payment_method') required String paymentMethod,
    @JsonKey(name: 'payment_status') @Default('pending') String paymentStatus,
    @JsonKey(name: 'payment_id') String? paymentId,
    @JsonKey(name: 'razorpay_order_id') String? razorpayOrderId,
    String? notes,
    // Delivery options
    @JsonKey(name: 'delivery_type') String? deliveryType,
    @JsonKey(name: 'delivery_date') String? deliveryDate,
    @JsonKey(name: 'delivery_slot_id') String? deliverySlotId,
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
