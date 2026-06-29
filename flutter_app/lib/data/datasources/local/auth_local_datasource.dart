import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:khurpi_fresh/core/constants/app_constants.dart';
import 'package:khurpi_fresh/core/network/dio_client.dart';
import 'package:khurpi_fresh/data/models/user_model.dart';

abstract class AuthLocalDataSource {
  Future<void> saveAuthData(String token, UserModel user);
  Future<String?> getToken();
  Future<UserModel?> getUser();
  Future<void> clearAuthData();
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
