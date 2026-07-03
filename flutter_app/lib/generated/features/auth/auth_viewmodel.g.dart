// GENERATED CODE - DO NOT MODIFY BY HAND

part of '../../../features/auth/auth_viewmodel.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(AuthViewModel)
final authViewModelProvider = AuthViewModelFamily._();

final class AuthViewModelProvider
    extends $NotifierProvider<AuthViewModel, AuthState> {
  AuthViewModelProvider._({
    required AuthViewModelFamily super.from,
    required ({
      AuthRemoteDataSource authRemoteDataSource,
      AuthLocalDataSource authLocalDataSource,
    })
    super.argument,
  }) : super(
         retry: null,
         name: r'authViewModelProvider',
         isAutoDispose: true,
         dependencies: null,
         $allTransitiveDependencies: null,
       );

  @override
  String debugGetCreateSourceHash() => _$authViewModelHash();

  @override
  String toString() {
    return r'authViewModelProvider'
        ''
        '$argument';
  }

  @$internal
  @override
  AuthViewModel create() => AuthViewModel();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(AuthState value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<AuthState>(value),
    );
  }

  @override
  bool operator ==(Object other) {
    return other is AuthViewModelProvider && other.argument == argument;
  }

  @override
  int get hashCode {
    return argument.hashCode;
  }
}

String _$authViewModelHash() => r'443df1ac916e96f9b0b53ac4cfddf9e78ffa1ef2';

final class AuthViewModelFamily extends $Family
    with
        $ClassFamilyOverride<
          AuthViewModel,
          AuthState,
          AuthState,
          AuthState,
          ({
            AuthRemoteDataSource authRemoteDataSource,
            AuthLocalDataSource authLocalDataSource,
          })
        > {
  AuthViewModelFamily._()
    : super(
        retry: null,
        name: r'authViewModelProvider',
        dependencies: null,
        $allTransitiveDependencies: null,
        isAutoDispose: true,
      );

  AuthViewModelProvider call({
    required AuthRemoteDataSource authRemoteDataSource,
    required AuthLocalDataSource authLocalDataSource,
  }) => AuthViewModelProvider._(
    argument: (
      authRemoteDataSource: authRemoteDataSource,
      authLocalDataSource: authLocalDataSource,
    ),
    from: this,
  );

  @override
  String toString() => r'authViewModelProvider';
}

abstract class _$AuthViewModel extends $Notifier<AuthState> {
  late final _$args =
      ref.$arg
          as ({
            AuthRemoteDataSource authRemoteDataSource,
            AuthLocalDataSource authLocalDataSource,
          });
  AuthRemoteDataSource get authRemoteDataSource => _$args.authRemoteDataSource;
  AuthLocalDataSource get authLocalDataSource => _$args.authLocalDataSource;

  AuthState build({
    required AuthRemoteDataSource authRemoteDataSource,
    required AuthLocalDataSource authLocalDataSource,
  });
  @$mustCallSuper
  @override
  void runBuild() {
    final ref = this.ref as $Ref<AuthState, AuthState>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<AuthState, AuthState>,
              AuthState,
              Object?,
              Object?
            >;
    element.handleCreate(
      ref,
      () => build(
        authRemoteDataSource: _$args.authRemoteDataSource,
        authLocalDataSource: _$args.authLocalDataSource,
      ),
    );
  }
}
