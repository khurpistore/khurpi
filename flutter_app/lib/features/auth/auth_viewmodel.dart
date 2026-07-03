import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:khurpi_fresh/data/models/user_model.dart';
import 'package:khurpi_fresh/data/datasources/remote/auth_remote_datasource.dart';
import 'package:khurpi_fresh/data/datasources/local/auth_local_datasource.dart';

part '../../generated/features/auth/auth_viewmodel.freezed.dart';
part '../../generated/features/auth/auth_viewmodel.g.dart';

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

@riverpod
class AuthViewModel extends _$AuthViewModel {
  late final AuthRemoteDataSource _authRemoteDataSource;
  late final AuthLocalDataSource _authLocalDataSource;

  @override
  AuthState build({
    required AuthRemoteDataSource authRemoteDataSource,
    required AuthLocalDataSource authLocalDataSource,
  }) {
    _authRemoteDataSource = authRemoteDataSource;
    _authLocalDataSource = authLocalDataSource;
    return const AuthState();
  }

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
    String? addressLine1,
    String? addressLine2,
    String? landmark,
    String? city,
    String? stateName,
    String? country,
    String? pincode,
    double? latitude,
    double? longitude,
    String? formattedAddress,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final user = await _authRemoteDataSource.updateProfile(
        name: name,
        email: email,
        address: address,
        addressLine1: addressLine1,
        addressLine2: addressLine2,
        landmark: landmark,
        city: city,
        state: stateName,
        country: country,
        pincode: pincode,
        latitude: latitude,
        longitude: longitude,
        formattedAddress: formattedAddress,
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
    required String addressLine1,
    String? addressLine2,
    String? landmark,
    required String city,
    required String state,
    required String country,
    required String pincode,
    double? latitude,
    double? longitude,
  }) async {
    final formattedAddress = [
      addressLine1,
      if (addressLine2 != null && addressLine2.trim().isNotEmpty) addressLine2,
      if (landmark != null && landmark.trim().isNotEmpty) landmark,
      city,
      state,
      pincode,
      country,
    ].join(', ');

    await updateProfile(
      address: formattedAddress,
      addressLine1: addressLine1,
      addressLine2: addressLine2,
      landmark: landmark,
      city: city,
      stateName: state,
      country: country,
      pincode: pincode,
      latitude: latitude,
      longitude: longitude,
      formattedAddress: formattedAddress,
    );
  }

  void clearError() {
    state = state.copyWith(errorMessage: null);
  }
}
