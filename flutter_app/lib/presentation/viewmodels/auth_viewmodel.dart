import 'package:flutter_riverpod/legacy.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:khurpi_fresh/data/models/user_model.dart';
import 'package:khurpi_fresh/data/datasources/remote/auth_remote_datasource.dart';
import 'package:khurpi_fresh/data/datasources/local/auth_local_datasource.dart';

part 'auth_viewmodel.freezed.dart';

@freezed
sealed class AuthState with _$AuthState {
  const factory AuthState({
    @Default(false) bool isLoading,
    @Default(false) bool isAuthenticated,
    UserModel? user,
    String? errorMessage,
  }) = _AuthState;
}

extension AuthStateX on AuthState {
  String? get error => errorMessage;
}

class AuthViewModel extends StateNotifier<AuthState> {
  final AuthRemoteDataSource _authRemoteDataSource;
  final AuthLocalDataSource _authLocalDataSource;

  AuthViewModel({
    required AuthRemoteDataSource authRemoteDataSource,
    required AuthLocalDataSource authLocalDataSource,
  })  : _authRemoteDataSource = authRemoteDataSource,
        _authLocalDataSource = authLocalDataSource,
        super(const AuthState());

  Future<void> initialize() async {
    state = state.copyWith(isLoading: true);

    try {
      final token = await _authLocalDataSource.getToken();
      if (token != null) {
        final user = await _authLocalDataSource.getUser();
        state = state.copyWith(
          isLoading: false,
          isAuthenticated: true,
          user: user,
        );
      } else {
        state = state.copyWith(isLoading: false);
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.toString(),
      );
    }
  }

  Future<bool> login(String phone, String password) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final response = await _authRemoteDataSource.login(phone, password);
      await _authLocalDataSource.saveAuthData(response.token, response.user);

      state = state.copyWith(
        isLoading: false,
        isAuthenticated: true,
        user: response.user,
      );
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.toString(),
      );
      return false;
    }
  }

  Future<bool> register(String name, String phone, String password) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final response = await _authRemoteDataSource.register(
        phone: phone,
        password: password,
        name: name,
      );
      await _authLocalDataSource.saveAuthData(response.token, response.user);

      state = state.copyWith(
        isLoading: false,
        isAuthenticated: true,
        user: response.user,
      );
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.toString(),
      );
      return false;
    }
  }

  Future<void> logout() async {
    state = state.copyWith(isLoading: true);

    try {
      await _authLocalDataSource.clearAuthData();
      state = const AuthState();
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.toString(),
      );
    }
  }

  Future<void> updateProfile({
    String? name,
    String? email,
    String? address,
    String? city,
    String? pincode,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final user = await _authRemoteDataSource.updateProfile(
        name: name,
        email: email,
        address: address,
        city: city,
        pincode: pincode,
      );

      final token = await _authLocalDataSource.getToken();
      if (token != null) {
        await _authLocalDataSource.saveAuthData(token, user);
      }

      state = state.copyWith(
        isLoading: false,
        user: user,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.toString(),
      );
    }
  }

  Future<void> updateAddress({
    required String address,
    required String city,
    required String pincode,
  }) async {
    await updateProfile(
      address: address,
      city: city,
      pincode: pincode,
    );
  }

  void clearError() {
    state = state.copyWith(errorMessage: null);
  }
}
