import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import 'package:khurpi_fresh/data/models/user_model.dart';

part 'auth_api_service.g.dart';

@RestApi()
abstract class AuthApiService {
  factory AuthApiService(Dio dio, {String baseUrl}) = _AuthApiService;

  @POST('/auth/login')
  Future<AuthResponseModel> login(@Body() LoginRequest request);

  @POST('/auth/register')
  Future<AuthResponseModel> register(@Body() RegisterRequest request);

  @GET('/auth/me')
  Future<UserModel> getCurrentUser();

  @PUT('/auth/profile')
  Future<UserModel> updateProfile(@Body() UpdateProfileRequest request);
}

// Request Models
class LoginRequest {
  final String phone;
  final String password;

  LoginRequest({required this.phone, required this.password});

  Map<String, dynamic> toJson() => {
    'phone': phone,
    'password': password,
  };
}

class RegisterRequest {
  final String phone;
  final String password;
  final String? name;
  final String? email;

  RegisterRequest({
    required this.phone,
    required this.password,
    this.name,
    this.email,
  });

  Map<String, dynamic> toJson() => {
    'phone': phone,
    'password': password,
    if (name != null) 'name': name,
    if (email != null) 'email': email,
  };
}

class UpdateProfileRequest {
  final String? name;
  final String? email;
  final String? address;
  final String? city;
  final String? pincode;

  UpdateProfileRequest({
    this.name,
    this.email,
    this.address,
    this.city,
    this.pincode,
  });

  Map<String, dynamic> toJson() => {
    if (name != null) 'name': name,
    if (email != null) 'email': email,
    if (address != null) 'address': address,
    if (city != null) 'city': city,
    if (pincode != null) 'pincode': pincode,
  };
}

// Response Model
class AuthResponseModel {
  final String token;
  final UserModel user;

  AuthResponseModel({required this.token, required this.user});

  factory AuthResponseModel.fromJson(Map<String, dynamic> json) {
    return AuthResponseModel(
      token: json['token'],
      user: UserModel.fromJson(json['user']),
    );
  }
}
