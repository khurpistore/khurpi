import 'package:freezed_annotation/freezed_annotation.dart';

part 'banner_model.freezed.dart';
part 'banner_model.g.dart';

@freezed
abstract class BannerModel with _$BannerModel {
  const factory BannerModel({
    @JsonKey(name: 'id') String? id,
    @JsonKey(name: '_id') String? mongoId,
    @JsonKey(name: 'image_url') required String imageUrl,
    String? title,
    String? subtitle,
    @JsonKey(name: 'action_type') String? actionType,
    @JsonKey(name: 'action_value') String? actionValue,
    @JsonKey(name: 'display_order') @Default(0) int displayOrder,
    @JsonKey(name: 'is_active') @Default(true) bool isActive,
  }) = _BannerModel;

  factory BannerModel.fromJson(Map<String, dynamic> json) =>
      _$BannerModelFromJson(json);

  static BannerModel initial() {
    return const BannerModel(
      imageUrl: '',
    );
  }
}

extension BannerModelX on BannerModel {
  String get bannerId => id ?? mongoId ?? '';
}
