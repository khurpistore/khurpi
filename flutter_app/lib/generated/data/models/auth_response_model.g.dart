// GENERATED CODE - DO NOT MODIFY BY HAND

part of '../../../data/models/auth_response_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_AuthResponseModel _$AuthResponseModelFromJson(Map<String, dynamic> json) =>
    _AuthResponseModel(
      token: json['token'] as String,
      user: UserModel.fromJson(json['user'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$AuthResponseModelToJson(_AuthResponseModel instance) =>
    <String, dynamic>{'token': instance.token, 'user': instance.user.toJson()};

_LoginRequest _$LoginRequestFromJson(Map<String, dynamic> json) =>
    _LoginRequest(
      phone: json['phone'] as String,
      password: json['password'] as String,
    );

Map<String, dynamic> _$LoginRequestToJson(_LoginRequest instance) =>
    <String, dynamic>{'phone': instance.phone, 'password': instance.password};

_RegisterRequest _$RegisterRequestFromJson(Map<String, dynamic> json) =>
    _RegisterRequest(
      phone: json['phone'] as String,
      password: json['password'] as String,
      name: json['name'] as String?,
      email: json['email'] as String?,
    );

Map<String, dynamic> _$RegisterRequestToJson(_RegisterRequest instance) =>
    <String, dynamic>{
      'phone': instance.phone,
      'password': instance.password,
      'name': ?instance.name,
      'email': ?instance.email,
    };

_UpdateProfileRequest _$UpdateProfileRequestFromJson(
  Map<String, dynamic> json,
) => _UpdateProfileRequest(
  name: json['name'] as String?,
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
);

Map<String, dynamic> _$UpdateProfileRequestToJson(
  _UpdateProfileRequest instance,
) => <String, dynamic>{
  'name': ?instance.name,
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
};
