import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:khurpi_fresh/domain/entities/user_entity.dart';
import 'package:khurpi_fresh/domain/repositories/auth_repository.dart';
import 'package:khurpi_fresh/domain/usecases/auth_usecases.dart';
import 'package:khurpi_fresh/presentation/providers/providers.dart';

// ==================== State Classes ====================

class AuthState {
  final UserEntity? user;
  final bool isLoading;
  final bool isInitialized;
  final String? error;

  const AuthState({
    this.user,
    this.isLoading = false,
    this.isInitialized = false,
    this.error,
  });

  AuthState copyWith({
    UserEntity? user,
    bool? isLoading,
    bool? isInitialized,
    String? error,
    bool clearError = false,
    bool clearUser = false,
  }) {
    return AuthState(
      user: clearUser ? null : (user ?? this.user),
      isLoading: isLoading ?? this.isLoading,
      isInitialized: isInitialized ?? this.isInitialized,
      error: clearError ? null : (error ?? this.error),
    );
  }

  bool get isLoggedIn => user != null;
  bool get isWholesaleEnabled => user?.wholesaleEnabled ?? false;
}

// ==================== ViewModel ====================

class AuthViewModel extends StateNotifier<AuthState> {
  final LoginUseCase _loginUseCase;
  final RegisterUseCase _registerUseCase;
  final GetCurrentUserUseCase _getCurrentUserUseCase;
  final LogoutUseCase _logoutUseCase;
  final UpdateProfileUseCase _updateProfileUseCase;

  AuthViewModel({
    required LoginUseCase loginUseCase,
    required RegisterUseCase registerUseCase,
    required GetCurrentUserUseCase getCurrentUserUseCase,
    required LogoutUseCase logoutUseCase,
    required UpdateProfileUseCase updateProfileUseCase,
  })  : _loginUseCase = loginUseCase,
        _registerUseCase = registerUseCase,
        _getCurrentUserUseCase = getCurrentUserUseCase,
        _logoutUseCase = logoutUseCase,
        _updateProfileUseCase = updateProfileUseCase,
        super(const AuthState());

  Future<void> initialize() async {
    if (state.isInitialized) return;

    state = state.copyWith(isLoading: true);

    final result = await _getCurrentUserUseCase();

    result.fold(
      (failure) => state = state.copyWith(
        isLoading: false,
        isInitialized: true,
      ),
      (user) => state = state.copyWith(
        isLoading: false,
        isInitialized: true,
        user: user,
      ),
    );
  }

  Future<bool> login(String phone, String password) async {
    state = state.copyWith(isLoading: true, clearError: true);

    final result = await _loginUseCase(LoginParams(
      phone: phone,
      password: password,
    ));

    return result.fold(
      (failure) {
        state = state.copyWith(isLoading: false, error: failure.message);
        return false;
      },
      (authResult) {
        state = state.copyWith(isLoading: false, user: authResult.user);
        return true;
      },
    );
  }

  Future<bool> register({
    required String phone,
    required String password,
    String? name,
    String? email,
  }) async {
    state = state.copyWith(isLoading: true, clearError: true);

    final result = await _registerUseCase(RegisterParams(
      phone: phone,
      password: password,
      name: name,
      email: email,
    ));

    return result.fold(
      (failure) {
        state = state.copyWith(isLoading: false, error: failure.message);
        return false;
      },
      (authResult) {
        state = state.copyWith(isLoading: false, user: authResult.user);
        return true;
      },
    );
  }

  Future<void> logout() async {
    await _logoutUseCase();
    state = state.copyWith(clearUser: true);
  }

  Future<bool> updateProfile({
    String? name,
    String? email,
    String? address,
    String? city,
    String? pincode,
  }) async {
    state = state.copyWith(isLoading: true, clearError: true);

    final result = await _updateProfileUseCase(UpdateProfileParams(
      name: name,
      email: email,
      address: address,
      city: city,
      pincode: pincode,
    ));

    return result.fold(
      (failure) {
        state = state.copyWith(isLoading: false, error: failure.message);
        return false;
      },
      (user) {
        state = state.copyWith(isLoading: false, user: user);
        return true;
      },
    );
  }

  void clearError() {
    state = state.copyWith(clearError: true);
  }
}

// ==================== Provider ====================

final authViewModelProvider =
    StateNotifierProvider<AuthViewModel, AuthState>((ref) {
  return AuthViewModel(
    loginUseCase: ref.watch(loginUseCaseProvider),
    registerUseCase: ref.watch(registerUseCaseProvider),
    getCurrentUserUseCase: ref.watch(getCurrentUserUseCaseProvider),
    logoutUseCase: ref.watch(logoutUseCaseProvider),
    updateProfileUseCase: ref.watch(updateProfileUseCaseProvider),
  );
});
