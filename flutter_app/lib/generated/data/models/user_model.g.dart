// GENERATED CODE - DO NOT MODIFY BY HAND

part of '../../../data/models/user_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_UserModel _$UserModelFromJson(Map<String, dynamic> json) => _UserModel(
  id: json['id'] as String?,
  mongoId: json['_id'] as String?,
  name: json['name'] as String?,
  phone: json['phone'] as String,
  email: json['email'] as String?,
  address: json['address'] as String?,
  addressLine1: json['address_line_1'] as String?,
  addressLine2: json['address_line_2'] as String?,
  landmark: json['landmark'] as String?,
  city: json['city'] as String?,
  state: json['state'] as String?,
  country: json['country'] as String?,
  pincode: json['pincode'] as String?,
  latitude: (json['latitude'] as num?)?.toDouble(),
  longitude: (json['longitude'] as num?)?.toDouble(),
  formattedAddress: json['formatted_address'] as String?,
  isAdmin: json['is_admin'] as bool? ?? false,
  wholesaleEnabled: json['wholesale_enabled'] as bool? ?? false,
  role: json['role'] as String? ?? 'customer',
  createdAt: json['created_at'] == null
      ? null
      : DateTime.parse(json['created_at'] as String),
);

Map<String, dynamic> _$UserModelToJson(_UserModel instance) =>
    <String, dynamic>{
      'id': ?instance.id,
      '_id': ?instance.mongoId,
      'name': ?instance.name,
      'phone': instance.phone,
      'email': ?instance.email,
      'address': ?instance.address,
      'address_line_1': ?instance.addressLine1,
      'address_line_2': ?instance.addressLine2,
      'landmark': ?instance.landmark,
      'city': ?instance.city,
      'state': ?instance.state,
      'country': ?instance.country,
      'pincode': ?instance.pincode,
      'latitude': ?instance.latitude,
      'longitude': ?instance.longitude,
      'formatted_address': ?instance.formattedAddress,
      'is_admin': instance.isAdmin,
      'wholesale_enabled': instance.wholesaleEnabled,
      'role': instance.role,
      'created_at': ?instance.createdAt?.toIso8601String(),
    };
