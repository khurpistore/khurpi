// GENERATED CODE - DO NOT MODIFY BY HAND

part of '../../../data/models/recent_search_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_RecentSearchModel _$RecentSearchModelFromJson(Map<String, dynamic> json) =>
    _RecentSearchModel(
      id: json['id'] as String?,
      userId: json['user_id'] as String?,
      query: json['query'] as String,
      searchedAt: json['searched_at'] as String?,
    );

Map<String, dynamic> _$RecentSearchModelToJson(_RecentSearchModel instance) =>
    <String, dynamic>{
      'id': ?instance.id,
      'user_id': ?instance.userId,
      'query': instance.query,
      'searched_at': ?instance.searchedAt,
    };
