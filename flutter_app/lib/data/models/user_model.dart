import 'package:freezed_annotation/freezed_annotation.dart';

part '../../generated/data/models/user_model.freezed.dart';
part '../../generated/data/models/user_model.g.dart';

@freezed
abstract class UserModel with _$UserModel {
  const factory UserModel({
    @JsonKey(name: 'id') String? id,
    @JsonKey(name: '_id') String? mongoId,
    String? name,
    required String phone,
    String? email,
    String? address,
    @JsonKey(name: 'address_line_1') String? addressLine1,
    @JsonKey(name: 'address_line_2') String? addressLine2,
    String? landmark,
    String? city,
    String? state,
    String? country,
    String? pincode,
    double? latitude,
    double? longitude,
    @JsonKey(name: 'formatted_address') String? formattedAddress,
    @JsonKey(name: 'is_admin') @Default(false) bool isAdmin,
    @JsonKey(name: 'wholesale_enabled') @Default(false) bool wholesaleEnabled,
    @JsonKey(name: 'role') @Default('customer') String role,
    @JsonKey(name: 'created_at') DateTime? createdAt,
  }) = _UserModel;

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);

  static UserModel initial() {
    return const UserModel(
      phone: '',
    );
  }
}

extension UserModelX on UserModel {
  String get userId => id ?? mongoId ?? '';

  bool get isVendor => role == 'vendor';

  String get displayAddress {
    final candidates = [
      formattedAddress,
      address,
      [addressLine1, addressLine2, landmark, city, state, pincode, country]
          .whereType<String>()
          .where((e) => e.trim().isNotEmpty)
          .join(', '),
    ];

    for (final value in candidates) {
      if (value != null && value.trim().isNotEmpty) return value.trim();
    }
    return '';
  }
}
