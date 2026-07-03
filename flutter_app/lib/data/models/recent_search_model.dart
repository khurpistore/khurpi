import 'package:freezed_annotation/freezed_annotation.dart';

part '../../generated/data/models/recent_search_model.freezed.dart';
part '../../generated/data/models/recent_search_model.g.dart';

@freezed
abstract class RecentSearchModel with _$RecentSearchModel {
  const factory RecentSearchModel({
    String? id,
    @JsonKey(name: 'user_id') String? userId,
    required String query,
    @JsonKey(name: 'searched_at') String? searchedAt,
  }) = _RecentSearchModel;

  factory RecentSearchModel.fromJson(Map<String, dynamic> json) =>
      _$RecentSearchModelFromJson(json);
}
