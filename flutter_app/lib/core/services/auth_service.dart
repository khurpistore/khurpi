import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/app_constants.dart';
import '../models/user_model.dart';
import 'api_service.dart';

class AuthService {
  final ApiService _api = ApiService();

  // Login with phone and password
  Future<Map<String, dynamic>> login(String phone, String password) async {
    final response = await _api.post('/auth/login', {
      'phone': phone,
      'password': password,
    });
    
    final token = response['token'];
    final user = UserModel.fromJson(response['user']);
    
    // Save to local storage
    await _saveAuthData(token, user);
    
    // Set token in API service
    _api.setAuthToken(token);
    
    return {'token': token, 'user': user};
  }

  // Register new user
  Future<Map<String, dynamic>> register({
    required String phone,
    required String password,
    String? name,
    String? email,
  }) async {
    final response = await _api.post('/auth/register', {
      'phone': phone,
      'password': password,
      if (name != null) 'name': name,
      if (email != null) 'email': email,
    });
    
    final token = response['token'];
    final user = UserModel.fromJson(response['user']);
    
    // Save to local storage
    await _saveAuthData(token, user);
    
    // Set token in API service
    _api.setAuthToken(token);
    
    return {'token': token, 'user': user};
  }

  // Get current user
  Future<UserModel?> getCurrentUser() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString(AppConstants.tokenKey);
      
      if (token == null) return null;
      
      _api.setAuthToken(token);
      
      final response = await _api.get('/auth/me');
      final user = UserModel.fromJson(response);
      
      // Update local storage
      await prefs.setString(AppConstants.userKey, jsonEncode(user.toJson()));
      
      return user;
    } catch (e) {
      return null;
    }
  }

  // Check if user is logged in
  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(AppConstants.tokenKey);
    return token != null;
  }

  // Logout
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConstants.tokenKey);
    await prefs.remove(AppConstants.userKey);
    _api.setAuthToken(null);
  }

  // Update profile
  Future<UserModel> updateProfile({
    String? name,
    String? email,
    String? address,
    String? city,
    String? pincode,
  }) async {
    final response = await _api.put('/auth/profile', {
      if (name != null) 'name': name,
      if (email != null) 'email': email,
      if (address != null) 'address': address,
      if (city != null) 'city': city,
      if (pincode != null) 'pincode': pincode,
    });
    
    final user = UserModel.fromJson(response);
    
    // Update local storage
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppConstants.userKey, jsonEncode(user.toJson()));
    
    return user;
  }

  // Get stored user
  Future<UserModel?> getStoredUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userData = prefs.getString(AppConstants.userKey);
    
    if (userData == null) return null;
    
    return UserModel.fromJson(jsonDecode(userData));
  }

  // Get stored token
  Future<String?> getStoredToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(AppConstants.tokenKey);
  }

  // Private helper to save auth data
  Future<void> _saveAuthData(String token, UserModel user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppConstants.tokenKey, token);
    await prefs.setString(AppConstants.userKey, jsonEncode(user.toJson()));
  }
}
