import 'package:freezed_annotation/freezed_annotation.dart';

part '../../generated/models/order_model.freezed.dart';
part '../../generated/models/order_model.g.dart';

@freezed
abstract class OrderModel with _$OrderModel {
  const factory OrderModel({
    @JsonKey(name: 'id') String? id,
    @JsonKey(name: '_id') String? mongoId,
    @JsonKey(name: 'user_id') required String userId,
    @JsonKey(name: 'user_name') String? userName,
    @JsonKey(name: 'user_phone') String? userPhone,
    @Default([]) List<OrderItemModel> items,
    @Default(0) double subtotal,
    @JsonKey(name: 'delivery_fee') @Default(0) double deliveryFee,
    @Default(0) double total,
    @Default('pending') String status,
    @JsonKey(name: 'delivery_address') String? deliveryAddress,
    @JsonKey(name: 'delivery_slot') String? deliverySlot,
    @JsonKey(name: 'delivery_date') DateTime? deliveryDate,
    @JsonKey(name: 'payment_method') String? paymentMethod,
    @JsonKey(name: 'payment_status') String? paymentStatus,
    String? notes,
    @JsonKey(name: 'created_at') required DateTime createdAt,
  }) = _OrderModel;

  factory OrderModel.fromJson(Map<String, dynamic> json) =>
      _$OrderModelFromJson(json);

  static OrderModel initial() {
    return OrderModel(
      userId: '',
      createdAt: DateTime.now(),
    );
  }
}

extension OrderModelX on OrderModel {
  String get orderId => id ?? mongoId ?? '';
}

@freezed
abstract class OrderItemModel with _$OrderItemModel {
  const factory OrderItemModel({
    @JsonKey(name: 'product_id') required String productId,
    @JsonKey(name: 'product_name') required String productName,
    required double price,
    required double quantity,
    @Default('kg') String unit,
    required double total,
  }) = _OrderItemModel;

  factory OrderItemModel.fromJson(Map<String, dynamic> json) =>
      _$OrderItemModelFromJson(json);

  static OrderItemModel initial() {
    return const OrderItemModel(
      productId: '',
      productName: '',
      price: 0,
      quantity: 0,
      total: 0,
    );
  }
}
