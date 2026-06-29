import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:khurpi_fresh/data/models/user_model.dart';
import 'package:khurpi_fresh/presentation/providers/providers.dart';

part 'auth_viewmodel.g.dart';
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

@Riverpod(keepAlive: true)
class AuthViewModel extends _$AuthViewModel {
  @override
  AuthState build() {
    return const AuthState();
  }

  Future<void> initialize() async {
    state = state.copyWith(isLoading: true);
    
    try {
      final token = await ref.read(authLocalDataSourceProvider).getToken();
      if (token != null) {
        final user = await ref.read(authLocalDataSourceProvider).getUser();
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
      final response = await ref.read(authRemoteDataSourceProvider).login(phone, password);
      await ref.read(authLocalDataSourceProvider).saveAuthData(response.token, response.user);
      
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

  Future<bool> register({
    required String phone,
    required String password,
    String? name,
    String? email,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    
    try {
      final response = await ref.read(authRemoteDataSourceProvider).register(
        phone: phone,
        password: password,
        name: name,
        email: email,
      );
      await ref.read(authLocalDataSourceProvider).saveAuthData(response.token, response.user);
      
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
      await ref.read(authLocalDataSourceProvider).clearAuthData();
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
      final user = await ref.read(authRemoteDataSourceProvider).updateProfile(
        name: name,
        email: email,
        address: address,
        city: city,
        pincode: pincode,
      );
      
      final token = await ref.read(authLocalDataSourceProvider).getToken();
      if (token != null) {
        await ref.read(authLocalDataSourceProvider).saveAuthData(token, user);
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

  void clearError() {
    state = state.copyWith(errorMessage: null);
  }
}
