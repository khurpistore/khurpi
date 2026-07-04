import 'package:freezed_annotation/freezed_annotation.dart';

part '../../generated/data/models/order_model.freezed.dart';
part '../../generated/data/models/order_model.g.dart';

@freezed
abstract class OrderModel with _$OrderModel {
  const factory OrderModel({
    @JsonKey(name: 'id') String? id,
    @JsonKey(name: '_id') String? mongoId,
    @JsonKey(name: 'user_id') required String userId,
    @JsonKey(name: 'user_name') String? userName,
    @JsonKey(name: 'user_phone') String? userPhone,
    @Default([]) List<OrderItemModel> items,
    @JsonKey(name: 'one_time_items') @Default([]) List<OrderItemModel> oneTimeItems,
    @Default(0.0) double subtotal,
    @JsonKey(name: 'delivery_fee') @Default(0.0) double deliveryFee,
    @Default(0.0) double discount,
    @Default(0.0) double total,
    @Default('pending') String status,
    @JsonKey(name: 'delivery_address') @Default('') String deliveryAddress,
    String? city,
    String? pincode,
    @Default('') String phone,
    @JsonKey(name: 'delivery_slot') String? deliverySlot,
    @JsonKey(name: 'delivery_date') DateTime? deliveryDate,
    @JsonKey(name: 'delivery_type') String? deliveryType,
    @JsonKey(name: 'delivery_slot_id') String? deliverySlotId,
    @JsonKey(name: 'payment_method') @Default('cod') String paymentMethod,
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
  
  /// Get all order items (combines items and oneTimeItems)
  List<OrderItemModel> get allItems {
    if (items.isNotEmpty) return items;
    if (oneTimeItems.isNotEmpty) return oneTimeItems;
    return [];
  }
}

@freezed
abstract class OrderItemModel with _$OrderItemModel {
  const factory OrderItemModel({
    @JsonKey(name: 'product_id') required String productId,
    @JsonKey(name: 'product_name') @Default('') String productName,
    @Default(0.0) double price,
    @Default(1.0) double quantity,
    @Default('kg') String unit,
    @Default(0.0) double total,
    Map<String, dynamic>? product,
  }) = _OrderItemModel;

  factory OrderItemModel.fromJson(Map<String, dynamic> json) =>
      _$OrderItemModelFromJson(json);

  static OrderItemModel initial() {
    return const OrderItemModel(
      productId: '',
    );
  }
}

extension OrderItemModelX on OrderItemModel {
  /// Get the display name (from product or productName field)
  String get displayName {
    if (productName.isNotEmpty) return productName;
    if (product != null && product!['name'] != null) return product!['name'];
    return 'Unknown Product';
  }
  
  /// Get the display price
  double get displayPrice => price > 0 ? price : (product?['price'] ?? 0.0);
}
