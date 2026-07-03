import 'package:freezed_annotation/freezed_annotation.dart';

part '../../generated/data/models/address_model.freezed.dart';
part '../../generated/data/models/address_model.g.dart';

@freezed
abstract class AddressModel with _$AddressModel {
  const AddressModel._();
  
  const factory AddressModel({
    String? id,
    @JsonKey(name: 'user_id') String? userId,
    @Default('Home') String label,
    @JsonKey(name: 'full_name') required String fullName,
    required String phone,
    @JsonKey(name: 'address_line1') required String addressLine1,
    @JsonKey(name: 'address_line2') String? addressLine2,
    String? landmark,
    required String city,
    required String state,
    required String pincode,
    @Default('India') String country,
    String? society,
    double? latitude,
    double? longitude,
    @JsonKey(name: 'is_default') @Default(false) bool isDefault,
    @JsonKey(name: 'created_at') String? createdAt,
  }) = _AddressModel;

  factory AddressModel.fromJson(Map<String, dynamic> json) =>
      _$AddressModelFromJson(json);

  // Helper getter for display
  String get shortAddress => '$addressLine1, $city - $pincode';
  
  String get fullAddress {
    final parts = <String>[addressLine1];
    if (addressLine2 != null && addressLine2!.isNotEmpty) parts.add(addressLine2!);
    if (landmark != null && landmark!.isNotEmpty) parts.add('Near $landmark');
    if (society != null && society!.isNotEmpty) parts.add(society!);
    parts.add('$city, $state - $pincode');
    return parts.join(', ');
  }
}
