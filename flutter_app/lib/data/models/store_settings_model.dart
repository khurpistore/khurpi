import 'package:freezed_annotation/freezed_annotation.dart';

part '../../generated/data/models/store_settings_model.freezed.dart';
part '../../generated/data/models/store_settings_model.g.dart';

@freezed
abstract class StoreSettingsModel with _$StoreSettingsModel {
  const factory StoreSettingsModel({
    @JsonKey(name: 'store_name') @Default('Khurpi Fresh') String storeName,
    @JsonKey(name: 'store_phone') String? storePhone,
    @JsonKey(name: 'store_email') String? storeEmail,
    @JsonKey(name: 'store_address') String? storeAddress,
    @JsonKey(name: 'min_order_value') @Default(0) double minOrderValue,
    @JsonKey(name: 'default_delivery_fee') @Default(30) double defaultDeliveryFee,
    @JsonKey(name: 'min_order_for_free_delivery') @Default(500) double minOrderForFreeDelivery,
    @JsonKey(name: 'instant_delivery_enabled') @Default(true) bool instantDeliveryEnabled,
    @JsonKey(name: 'instant_delivery_fee') @Default(30) double instantDeliveryFee,
    @JsonKey(name: 'instant_delivery_time_minutes') @Default(60) int instantDeliveryTimeMinutes,
    @JsonKey(name: 'slotted_delivery_enabled') @Default(true) bool slottedDeliveryEnabled,
    @JsonKey(name: 'store_latitude') double? storeLatitude,
    @JsonKey(name: 'store_longitude') double? storeLongitude,
    @JsonKey(name: 'delivery_radius_km') @Default(10) double deliveryRadiusKm,
  }) = _StoreSettingsModel;

  factory StoreSettingsModel.fromJson(Map<String, dynamic> json) =>
      _$StoreSettingsModelFromJson(json);
}
