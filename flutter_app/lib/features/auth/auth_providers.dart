import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:khurpi_fresh/features/auth/auth_viewmodel.dart';
import 'package:khurpi_fresh/features/providers.dart';

export 'package:khurpi_fresh/features/auth/auth_viewmodel.dart';

// ==================== Auth ViewModel Providers ====================

/// Exposes [AuthState] – watch this in UI.
final provideAuthViewModelProvider = Provider<AuthState?>(
  (ref) {
    final remoteDS = ref.watch(provideAuthRemoteDataSourceProvider);
    final localDS = ref.watch(provideAuthLocalDataSourceProvider);

    if (remoteDS == null || localDS == null) return null;

    return ref.watch(
      authViewModelProvider(
        authRemoteDataSource: remoteDS,
        authLocalDataSource: localDS,
      ),
    );
  },
);

/// Exposes the [AuthViewModel] notifier – use this for actions.
final provideAuthViewModelNotifierProvider = Provider<AuthViewModel?>(
  (ref) {
    final remoteDS = ref.watch(provideAuthRemoteDataSourceProvider);
    final localDS = ref.watch(provideAuthLocalDataSourceProvider);

    if (remoteDS == null || localDS == null) return null;

    return ref.watch(
      authViewModelProvider(
        authRemoteDataSource: remoteDS,
        authLocalDataSource: localDS,
      ).notifier,
    );
  },
);
