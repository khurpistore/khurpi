import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:khurpi_fresh/core/constants/app_constants.dart';
import 'package:khurpi_fresh/core/error/exceptions.dart';
import 'package:khurpi_fresh/core/network/dio_client.dart';
import 'package:khurpi_fresh/data/api/auth_api_service.dart';
import 'package:khurpi_fresh/data/models/user_model.dart';

abstract class AuthRemoteDataSource {
  Future<AuthResponse> login(String phone, String password);
  Future<AuthResponse> register({
    required String phone,
    required String password,
    String? name,
    String? email,
  });
  Future<UserModel> getCurrentUser();
  Future<UserModel> updateProfile({
    String? name,
    String? email,
    String? address,
    String? city,
    String? pincode,
  });
}

abstract class AuthLocalDataSource {
  Future<void> saveAuthData(String token, UserModel user);
  Future<String?> getToken();
  Future<UserModel?> getUser();
  Future<void> clearAuthData();
}

class AuthResponse {
  final String token;
  final UserModel user;

  AuthResponse({required this.token, required this.user});
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final AuthApiService _apiService;

  AuthRemoteDataSourceImpl(this._apiService);

  @override
  Future<AuthResponse> login(String phone, String password) async {
    try {
      final response = await _apiService.login(
        LoginRequest(phone: phone, password: password),
      );
      DioClient.setAuthToken(response.token);
      return AuthResponse(token: response.token, user: response.user);
    } catch (e) {
      throw ServerException(message: 'Login failed: $e');
    }
  }

  @override
  Future<AuthResponse> register({
    required String phone,
    required String password,
    String? name,
    String? email,
  }) async {
    try {
      final response = await _apiService.register(
        RegisterRequest(
          phone: phone,
          password: password,
          name: name,
          email: email,
        ),
      );
      DioClient.setAuthToken(response.token);
      return AuthResponse(token: response.token, user: response.user);
    } catch (e) {
      throw ServerException(message: 'Registration failed: $e');
    }
  }

  @override
  Future<UserModel> getCurrentUser() async {
    try {
      return await _apiService.getCurrentUser();
    } catch (e) {
      throw ServerException(message: 'Failed to get current user: $e');
    }
  }

  @override
  Future<UserModel> updateProfile({
    String? name,
    String? email,
    String? address,
    String? city,
    String? pincode,
  }) async {
    try {
      return await _apiService.updateProfile(
        UpdateProfileRequest(
          name: name,
          email: email,
          address: address,
          city: city,
          pincode: pincode,
        ),
      );
    } catch (e) {
      throw ServerException(message: 'Failed to update profile: $e');
    }
  }
}

class AuthLocalDataSourceImpl implements AuthLocalDataSource {
  final SharedPreferences sharedPreferences;

  AuthLocalDataSourceImpl(this.sharedPreferences);

  @override
  Future<void> saveAuthData(String token, UserModel user) async {
    await sharedPreferences.setString(AppConstants.tokenKey, token);
    await sharedPreferences.setString(AppConstants.userKey, jsonEncode(user.toJson()));
    DioClient.setAuthToken(token);
  }

  @override
  Future<String?> getToken() async {
    final token = sharedPreferences.getString(AppConstants.tokenKey);
    if (token != null) {
      DioClient.setAuthToken(token);
    }
    return token;
  }

  @override
  Future<UserModel?> getUser() async {
    final userData = sharedPreferences.getString(AppConstants.userKey);
    if (userData == null) return null;
    return UserModel.fromJson(jsonDecode(userData));
  }

  @override
  Future<void> clearAuthData() async {
    await sharedPreferences.remove(AppConstants.tokenKey);
    await sharedPreferences.remove(AppConstants.userKey);
    DioClient.clearToken();
  }
}
