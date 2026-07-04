// GENERATED CODE - DO NOT MODIFY BY HAND

part of '../../../data/models/address_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_AddressModel _$AddressModelFromJson(Map<String, dynamic> json) =>
    _AddressModel(
      id: json['id'] as String?,
      userId: json['user_id'] as String?,
      label: json['label'] as String? ?? 'Home',
      fullName: json['full_name'] as String,
      phone: json['phone'] as String,
      addressLine1: json['address_line1'] as String,
      addressLine2: json['address_line2'] as String?,
      landmark: json['landmark'] as String?,
      city: json['city'] as String,
      state: json['state'] as String,
      pincode: json['pincode'] as String,
      country: json['country'] as String? ?? 'India',
      society: json['society'] as String?,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      isDefault: json['is_default'] as bool? ?? false,
      createdAt: json['created_at'] as String?,
    );

Map<String, dynamic> _$AddressModelToJson(_AddressModel instance) =>
    <String, dynamic>{
      'id': ?instance.id,
      'user_id': ?instance.userId,
      'label': instance.label,
      'full_name': instance.fullName,
      'phone': instance.phone,
      'address_line1': instance.addressLine1,
      'address_line2': ?instance.addressLine2,
      'landmark': ?instance.landmark,
      'city': instance.city,
      'state': instance.state,
      'pincode': instance.pincode,
      'country': instance.country,
      'society': ?instance.society,
      'latitude': ?instance.latitude,
      'longitude': ?instance.longitude,
      'is_default': instance.isDefault,
      'created_at': ?instance.createdAt,
    };
