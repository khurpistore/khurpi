import 'package:freezed_annotation/freezed_annotation.dart';

part '../../generated/data/models/delivery_slot_model.freezed.dart';
part '../../generated/data/models/delivery_slot_model.g.dart';

@freezed
abstract class DeliverySlotModel with _$DeliverySlotModel {
  const factory DeliverySlotModel({
    required String id,
    required String name,
    @JsonKey(name: 'start_time') required String startTime,
    @JsonKey(name: 'end_time') required String endTime,
    @JsonKey(name: 'display_text') String? displayText,
    @JsonKey(name: 'delivery_fee') @Default(0) double deliveryFee,
    @JsonKey(name: 'max_orders') @Default(50) int maxOrders,
    @JsonKey(name: 'display_order') @Default(0) int displayOrder,
    @Default(true) bool active,
    @JsonKey(name: 'available_days') List<String>? availableDays,
    // Runtime fields returned by the API when querying for a specific date
    @Default(true) bool available,
    @JsonKey(name: 'orders_count') @Default(0) int ordersCount,
    @JsonKey(name: 'remaining_capacity') int? remainingCapacity,
  }) = _DeliverySlotModel;

  factory DeliverySlotModel.fromJson(Map<String, dynamic> json) =>
      _$DeliverySlotModelFromJson(json);
}
