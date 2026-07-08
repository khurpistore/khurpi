import 'package:freezed_annotation/freezed_annotation.dart';

part '../../generated/data/models/order_model.freezed.dart';
part '../../generated/data/models/order_model.g.dart';

@freezed
abstract class OrderModel with _$OrderModel {
  const factory OrderModel({
    @JsonKey(name: 'id') String? id,
    @JsonKey(name: '_id') String? mongoId,
    @JsonKey(name: 'user_id') @Default('') String userId,
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
    @JsonKey(name: 'created_at') DateTime? createdAt,
  }) = _OrderModel;

  factory OrderModel.fromJson(Map<String, dynamic> json) =>
      _$OrderModelFromJson(json);
}

extension OrderModelX on OrderModel {
  String get orderId => id ?? mongoId ?? '';
  
  DateTime get orderDate => createdAt ?? DateTime.now();
  
  List<OrderItemModel> get allItems {
    if (items.isNotEmpty) return items;
    if (oneTimeItems.isNotEmpty) return oneTimeItems;
    return [];
  }
}

@freezed
abstract class OrderItemModel with _$OrderItemModel {
  const factory OrderItemModel({
    @JsonKey(name: 'product_id') @Default('') String productId,
    @JsonKey(name: 'product_name') @Default('') String productName,
    @Default(0.0) double price,
    @Default(1.0) double quantity,
    @Default('kg') String unit,
    @Default(0.0) double total,
    Map<String, dynamic>? product,
  }) = _OrderItemModel;

  factory OrderItemModel.fromJson(Map<String, dynamic> json) =>
      _$OrderItemModelFromJson(json);
}

extension OrderItemModelX on OrderItemModel {
  String get displayName {
    if (productName.isNotEmpty) return productName;
    if (product != null && product!['name'] != null) return product!['name'];
    return 'Unknown Product';
  }
  
  double get displayPrice => price > 0 ? price : (product?['price']?.toDouble() ?? 0.0);

  String? get imageUrl {
    if (product == null) return null;
    return (product!['image_url'] ?? product!['image']) as String?;
  }
}
