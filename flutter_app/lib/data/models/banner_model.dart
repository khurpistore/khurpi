import 'package:freezed_annotation/freezed_annotation.dart';

part '../../generated/data/models/banner_model.freezed.dart';
part '../../generated/data/models/banner_model.g.dart';

@freezed
abstract class BannerModel with _$BannerModel {
  const factory BannerModel({
    String? id,
    @JsonKey(name: 'image_url') @Default('') String imageUrl,
    String? title,
    String? subtitle,
    @JsonKey(name: 'link_type') String? linkType,
    @JsonKey(name: 'link_value') String? linkValue,
    @JsonKey(name: 'action_type') String? actionType,
    @JsonKey(name: 'action_value') String? actionValue,
    @JsonKey(name: 'display_order') @Default(0) int displayOrder,
    @Default(true) bool active,
    @JsonKey(name: 'start_date') String? startDate,
    @JsonKey(name: 'end_date') String? endDate,
    @JsonKey(name: 'created_at') String? createdAt,
  }) = _BannerModel;

  factory BannerModel.fromJson(Map<String, dynamic> json) =>
      _$BannerModelFromJson(json);
}

extension BannerModelX on BannerModel {
  String get bannerId => id ?? '';
}
