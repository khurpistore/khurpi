import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_model.freezed.dart';
part 'user_model.g.dart';

@freezed
abstract class UserModel with _$UserModel {
  const factory UserModel({
    @JsonKey(name: 'id') String? id,
    @JsonKey(name: '_id') String? mongoId,
    String? name,
    required String phone,
    String? email,
    String? address,
    String? city,
    String? pincode,
    @JsonKey(name: 'is_admin') @Default(false) bool isAdmin,
    @JsonKey(name: 'wholesale_enabled') @Default(false) bool wholesaleEnabled,
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
}
