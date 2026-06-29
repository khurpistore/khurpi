import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:khurpi_fresh/core/network/api_client.dart';
import 'package:khurpi_fresh/core/error/exceptions.dart';
import 'package:khurpi_fresh/core/constants/app_constants.dart';
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
  final ApiClient apiClient;

  AuthRemoteDataSourceImpl(this.apiClient);

  @override
  Future<AuthResponse> login(String phone, String password) async {
    try {
      final response = await apiClient.post('/auth/login', data: {
        'phone': phone,
        'password': password,
      });
      return AuthResponse(
        token: response['token'],
        user: UserModel.fromJson(response['user']),
      );
    } catch (e) {
      if (e is ServerException) rethrow;
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
      final response = await apiClient.post('/auth/register', data: {
        'phone': phone,
        'password': password,
        if (name != null) 'name': name,
        if (email != null) 'email': email,
      });
      return AuthResponse(
        token: response['token'],
        user: UserModel.fromJson(response['user']),
      );
    } catch (e) {
      if (e is ServerException) rethrow;
      throw ServerException(message: 'Registration failed: $e');
    }
  }

  @override
  Future<UserModel> getCurrentUser() async {
    try {
      final response = await apiClient.get('/auth/me');
      return UserModel.fromJson(response);
    } catch (e) {
      if (e is ServerException) rethrow;
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
      final response = await apiClient.put('/auth/profile', data: {
        if (name != null) 'name': name,
        if (email != null) 'email': email,
        if (address != null) 'address': address,
        if (city != null) 'city': city,
        if (pincode != null) 'pincode': pincode,
      });
      return UserModel.fromJson(response);
    } catch (e) {
      if (e is ServerException) rethrow;
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
  }

  @override
  Future<String?> getToken() async {
    return sharedPreferences.getString(AppConstants.tokenKey);
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
  }
}
