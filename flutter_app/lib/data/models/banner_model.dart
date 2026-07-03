import 'package:freezed_annotation/freezed_annotation.dart';

part '../../generated/data/models/banner_model.freezed.dart';
part '../../generated/data/models/banner_model.g.dart';

@freezed
abstract class BannerModel with _$BannerModel {
  const BannerModel._();
  
  const factory BannerModel({
    String? id,
    @JsonKey(name: 'image_url') required String imageUrl,
    String? title,
    String? subtitle,
    @JsonKey(name: 'link_type') String? linkType,
    @JsonKey(name: 'link_value') String? linkValue,
    @JsonKey(name: 'display_order') @Default(0) int displayOrder,
    @Default(true) bool active,
    @JsonKey(name: 'start_date') String? startDate,
    @JsonKey(name: 'end_date') String? endDate,
    @JsonKey(name: 'created_at') String? createdAt,
  }) = _BannerModel;

  factory BannerModel.fromJson(Map<String, dynamic> json) =>
      _$BannerModelFromJson(json);

  // Getter for bannerId
  String get bannerId => id ?? '';

  static BannerModel initial() {
    return const BannerModel(
      imageUrl: '',
    );
  }
}
